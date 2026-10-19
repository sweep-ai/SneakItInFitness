import { createHmac, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { formatPhoneForGhl } from '../submit-application/ghl.js';

type Json = Record<string, any>;

interface RelayResult {
  status: number;
  body: Record<string, unknown>;
}

/** Reject signatures older than this to block replays (Calendly's own guidance). */
const SIGNATURE_TOLERANCE_SECONDS = 180;

async function readRequestBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks).toString('utf8');
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return ab.length > 0 && ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** `Calendly-Webhook-Signature: t=<unix>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">`. */
export function verifyCalendlySignature(raw: string, header: string | undefined, signingKey: string): boolean {
  if (!signingKey || !header) return false;

  const parts = Object.fromEntries(
    header.split(',').map((part) => {
      const [key, ...rest] = part.trim().split('=');
      return [key, rest.join('=')];
    }),
  );
  const timestamp = Number(parts.t);
  if (!timestamp || !parts.v1) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const expected = createHmac('sha256', signingKey).update(`${parts.t}.${raw}`, 'utf8').digest('hex');
  return safeEqualHex(expected, parts.v1);
}

/** SMSLoop wants flat, non-empty strings in `context`. */
function clean(obj: Json): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') out[key] = String(value);
  }
  return out;
}

function calendlyPhone(payload: Json): string | undefined {
  if (payload.text_reminder_number) return payload.text_reminder_number;

  const answer = (payload.questions_and_answers ?? []).find(
    (qa: Json) => /phone|mobile|cell|whatsapp/i.test(qa.question ?? '') && qa.answer,
  );
  if (answer) return answer.answer;

  const location = payload.scheduled_event?.location;
  if (location?.type === 'outbound_call' && location.location) return location.location;

  return undefined;
}

/**
 * Optional allowlist (comma-separated event type URIs). Unset => every event on
 * the subscribed user's calendar is relayed, which is fine while only the
 * strategy call collects a phone number.
 */
function isRelayedEventType(eventTypeUri: string | undefined): boolean {
  const allowlist = (process.env.CALENDLY_EVENT_TYPE_URIS ?? '')
    .split(',')
    .map((uri) => uri.trim())
    .filter(Boolean);

  if (allowlist.length === 0) return true;
  return Boolean(eventTypeUri && allowlist.includes(eventTypeUri));
}

async function postSmsloopEvent(body: Json): Promise<RelayResult> {
  const url = process.env.SMSLOOP_URL?.trim();
  const secret = process.env.SMSLOOP_SECRET?.trim();
  if (!url || !secret) {
    console.error('SMSLOOP_URL/SMSLOOP_SECRET is not configured');
    return { status: 500, body: { error: 'smsloop_not_configured' } };
  }

  let response: Response;
  try {
    response = await fetch(`${url}/leads/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-SMSLoop-Secret': secret },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error('SMSLoop unreachable', error);
    return { status: 502, body: { error: 'smsloop_unreachable' } };
  }

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (response.ok) {
    console.log('SMSLoop booking event', body.event, data.status);
    return { status: 200, body: data };
  }

  console.error('SMSLoop rejected booking event', response.status, data);
  // 401/422 are config problems a retry won't fix; 409/5xx may clear up, so let Calendly retry.
  const retry = response.status === 409 || response.status >= 500;
  return { status: retry ? 502 : 200, body: { error: 'smsloop_rejected', smsloop_status: response.status } };
}

function bookedEvent(phone: string, payload: Json): Json {
  const event = payload.scheduled_event ?? {};

  return {
    phone,
    event: 'set_scenario',
    scenario: process.env.SMSLOOP_BOOKED_SCENARIO?.trim() || 'booked',
    source: 'Calendly',
    ...clean({ name: payload.name, email: payload.email }),
    context: clean({
      call_start: event.start_time,
      call_end: event.end_time,
      timezone: payload.timezone,
      event_name: event.name,
      meeting_link: event.location?.join_url,
      reschedule_link: payload.reschedule_url,
      cancel_link: payload.cancel_url,
    }),
  };
}

function cancelEvent(phone: string, callStart: string | undefined): Json {
  const onCancel = process.env.SMSLOOP_ON_CANCEL?.trim() || 'ai_off';
  if (onCancel === 'ai_off') {
    return { phone, event: 'ai_off', reason: 'Cancelled their call in Calendly' };
  }

  return { phone, event: 'set_scenario', scenario: onCancel, context: clean({ cancelled_call: callStart }) };
}

export async function relayCalendlyWebhook(raw: string, signature: string | undefined): Promise<RelayResult> {
  const signingKey = process.env.CALENDLY_SIGNING_KEY?.trim() ?? '';
  if (!verifyCalendlySignature(raw, signature, signingKey)) {
    return { status: 401, body: { error: 'bad_signature' } };
  }

  let body: Json;
  try {
    body = JSON.parse(raw);
  } catch {
    return { status: 400, body: { error: 'invalid_json' } };
  }

  const payload: Json = body.payload ?? {};
  const eventTypeUri: string | undefined = payload.scheduled_event?.event_type;

  if (body.event !== 'invitee.created' && body.event !== 'invitee.canceled') {
    return { status: 200, body: { skipped: body.event ?? 'unknown_event' } };
  }

  if (!isRelayedEventType(eventTypeUri)) {
    return { status: 200, body: { skipped: 'event_type', event_type: eventTypeUri } };
  }

  const rawPhone = calendlyPhone(payload);
  if (!rawPhone) {
    console.warn('Calendly booking without a phone number', { email: payload.email, eventTypeUri });
    return { status: 200, body: { skipped: 'no_phone' } };
  }
  // Same normalization as the application relay so SMSLoop matches the existing lead.
  const phone = formatPhoneForGhl(rawPhone);

  if (body.event === 'invitee.created') {
    return postSmsloopEvent(bookedEvent(phone, payload));
  }

  // Reschedules fire canceled (rescheduled: true) + created; the created event carries the new time.
  if (payload.rescheduled) {
    return { status: 200, body: { skipped: 'rescheduled' } };
  }

  return postSmsloopEvent(cancelEvent(phone, payload.scheduled_event?.start_time));
}

export async function handleCalendlyWebhookRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  let raw: string;
  try {
    raw = await readRequestBody(req);
  } catch {
    sendJson(res, 400, { error: 'Unable to read request body' });
    return;
  }

  const header = req.headers['calendly-webhook-signature'];
  const signature = Array.isArray(header) ? header[0] : header;
  const { status, body } = await relayCalendlyWebhook(raw, signature);
  sendJson(res, status, body);
}
