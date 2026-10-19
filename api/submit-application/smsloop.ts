import { formatPhoneForGhl, isFinancialDisqualificationPayload, type ApplicationWebhookPayload } from './ghl.js';

interface SmsloopResponse {
  status: string;
  phone: string;
  scenario?: string;
  opted_out?: boolean;
}

interface SmsloopConfig {
  url: string;
  secret: string;
}

function getSmsloopConfig(): SmsloopConfig | null {
  const url = process.env.SMSLOOP_URL?.trim();
  const secret = process.env.SMSLOOP_SECRET?.trim();
  if (!url || !secret) return null;
  return { url, secret };
}

export function isSmsloopConfigured(): boolean {
  return getSmsloopConfig() !== null;
}

/**
 * TCPA: never text a lead without affirmative opt-in. `smsConsent` must be true —
 * this is a hard gate, not a default. Financial DQs (cannot invest) skip SMSLoop
 * too, same rule as GHL/Zapier.
 */
export function shouldForwardToSmsloop(payload: ApplicationWebhookPayload): boolean {
  if (!payload.phone?.trim()) return false;
  if (payload.smsConsent !== true) return false;
  return !isFinancialDisqualificationPayload(payload);
}

/** Quiz opt-in, no call booked yet. Must exist in the SMSLoop dashboard. */
export const SMSLOOP_NOT_BOOKED_SCENARIO = 'not_booked';

/**
 * Inbound opt-in scenario. Defaults to `not_booked`. Override with
 * `SMSLOOP_SCENARIO` if the dashboard key differs.
 */
export function resolveInboundScenario(): string {
  return process.env.SMSLOOP_SCENARIO?.trim() || SMSLOOP_NOT_BOOKED_SCENARIO;
}

function splitName(fullName: string): { firstName: string | undefined; lastName: string | undefined } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') || undefined };
}

/** Readable question text as keys, per the SMSLoop API's `fields` convention. */
function buildFields(payload: ApplicationWebhookPayload): Record<string, string> {
  const fields: Record<string, string> = {};

  if (payload.isJewish?.trim()) fields['Jewish?'] = payload.isJewish.trim();
  if (payload.situation?.label) fields['What is going on right now?'] = payload.situation.label;
  if (payload.goal?.label) fields['What is your main goal?'] = payload.goal.label;
  if (payload.openToCoaching?.label) fields['Open to coaching?'] = payload.openToCoaching.label;
  if (payload.readiness?.label) fields['Ready to invest?'] = payload.readiness.label;
  if (payload.occupation?.trim()) fields.Occupation = payload.occupation.trim();
  if (payload.age?.trim()) fields.Age = payload.age.trim();
  if (payload.instagram?.trim()) fields.Instagram = payload.instagram.trim();

  return fields;
}

/** Sends an application lead to SMSLoop so the AI opener texts them. */
export async function sendLeadToSmsloop(payload: ApplicationWebhookPayload): Promise<SmsloopResponse> {
  const config = getSmsloopConfig();
  if (!config) {
    throw new Error('SMSLOOP_URL/SMSLOOP_SECRET is not configured');
  }

  const { firstName, lastName } = splitName(payload.name ?? '');
  const scenario = resolveInboundScenario();

  // Consent evidence travels with every send, regardless of whether a scenario is set.
  const context: Record<string, string> = { lead_status: payload.leadStatus };
  if (payload.dqReason) context.dq_reason = payload.dqReason;
  if (payload.smsConsentTimestamp) context.consent_given_at = payload.smsConsentTimestamp;

  const body: Record<string, unknown> = {
    phone: formatPhoneForGhl(payload.phone),
    first_name: firstName,
    last_name: lastName,
    email: payload.email?.trim() || undefined,
    source: payload.source?.trim() || 'Application quiz',
    fields: buildFields(payload),
    scenario,
    context,
  };

  const response = await fetch(`${config.url}/leads/inbound`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-SMSLoop-Secret': config.secret,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });

  const data = (await response.json().catch(() => ({}))) as Partial<SmsloopResponse> & { detail?: string };

  if (!response.ok) {
    throw new Error(`SMSLoop ${response.status}: ${data.detail ?? 'request failed'}`);
  }

  return data as SmsloopResponse;
}
