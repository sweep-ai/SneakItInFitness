import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ApplicationWebhookPayload } from '../submit-application/ghl.js';
import {
  isSmsloopConfigured,
  sendLeadToSmsloop,
  shouldForwardToSmsloop,
} from '../submit-application/smsloop.js';
import { mapQuizFields, unmappedCustomFieldKeys } from './fields.js';

type Json = Record<string, any>;

export interface SimpleCheckWebhook {
  event?: string;
  timestamp?: string;
  clientId?: string;
  test?: boolean;
  data?: Json;
}

/** Only this event creates an SMSLoop lead. Other events are acknowledged and ignored. */
export const SIMPLECHECK_LEAD_EVENT = 'lead.created';

/** A lead payload is a few KB. Anything near this is not a SimpleCheck webhook. */
const MAX_BODY_BYTES = 256 * 1024;

/**
 * SMS consent flag. SimpleCheck puts it in `data.customFields.marketingConsent`.
 * Top-level spellings are kept so a payload change fails closed, not open.
 */
const CONSENT_KEYS = ['marketingConsent', 'smsConsent', 'marketing_consent', 'sms_consent'];

class BodyTooLargeError extends Error {}

async function readRequestBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) throw new BodyTooLargeError();
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

/** Constant-time compare of two strings of any length. */
function secretsMatch(provided: string, expected: string): boolean {
  return timingSafeEqual(digest(provided), digest(expected));
}

/**
 * `X-SimpleCheck-Signature: sha256=<hex HMAC-SHA256 of the raw request body>`,
 * keyed with the signing secret set in the SimpleCheck portal. Verified against
 * captured live requests. The HMAC covers the exact bytes received, so verify
 * before parsing.
 */
export function verifySimpleCheckSignature(
  rawBody: Buffer,
  header: string | undefined,
  signingSecret: string,
): boolean {
  if (!signingSecret || !header) return false;

  const match = /^sha256=([0-9a-f]{64})$/i.exec(header.trim());
  if (!match) return false;

  const expected = createHmac('sha256', signingSecret).update(rawBody).digest();
  return timingSafeEqual(expected, Buffer.from(match[1], 'hex'));
}

/** Optional extra layer: shared secret as `X-SimpleCheck-Secret`, Bearer token, or `?token=`. */
export function extractProvidedToken(req: IncomingMessage): string {
  const header = req.headers['x-simplecheck-secret'];
  if (typeof header === 'string' && header.trim()) return header.trim();

  const auth = req.headers.authorization;
  if (typeof auth === 'string' && /^bearer\s+/i.test(auth)) {
    return auth.replace(/^bearer\s+/i, '').trim();
  }

  try {
    const url = new URL(req.url ?? '', 'http://localhost');
    return url.searchParams.get('token')?.trim() ?? '';
  } catch {
    return '';
  }
}

function truthy(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === 'string') return ['true', 'yes', '1'].includes(value.trim().toLowerCase());
  return false;
}

/** TCPA: consent must be an explicit true. Missing or ambiguous means no text. */
export function resolveSmsConsent(data: Json): { given: boolean; timestamp: string } {
  const sources = [data.customFields ?? {}, data];
  const given = sources.some((source) => CONSENT_KEYS.some((key) => truthy(source?.[key])));
  // The payload carries no separate consent timestamp. The lead is created at the
  // moment of the submit that carries the checkbox, so createdAt is the record.
  return { given, timestamp: given ? String(data.createdAt ?? '') : '' };
}

/** Maps a SimpleCheck lead onto the payload shape the SMSLoop sender already uses. */
export function simpleCheckLeadToPayload(data: Json): ApplicationWebhookPayload {
  const consent = resolveSmsConsent(data);
  const name = [data.firstName, data.lastName]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(' ');

  return {
    name,
    email: typeof data.email === 'string' ? data.email.trim() : '',
    phone: typeof data.phone === 'string' ? data.phone.trim() : '',
    // SimpleCheck owns qualification. Not a real quiz verdict, see lead_status below.
    leadStatus: 'qualified',
    dqReason: null,
    submittedAt: String(data.createdAt ?? ''),
    source: 'SimpleCheck widget',
    smsConsent: consent.given,
    smsConsentTimestamp: consent.timestamp,
  } as ApplicationWebhookPayload;
}

/**
 * PII-free summary for logs: key names and flags only. Never logs creditData or
 * customFields values. Set SIMPLECHECK_WEBHOOK_LOG_BODY=1 while mapping fields to
 * also log the non-credit quiz answers.
 */
function logSummary(body: SimpleCheckWebhook, data: Json, outcome: string): void {
  const summary: Json = {
    event: body.event,
    test: body.test === true,
    outcome,
    leadId: data.id,
    hasPhone: Boolean(data.phone),
    hasEmail: Boolean(data.email),
    consentFound: resolveSmsConsent(data).given,
    mappedQuizFields: Object.keys(mapQuizFields(data.customFields)),
    unmappedCustomFieldKeys: unmappedCustomFieldKeys(data.customFields),
  };
  if (process.env.SIMPLECHECK_WEBHOOK_LOG_BODY === '1') {
    summary.quizAnswers = mapQuizFields(data.customFields);
  }
  console.log('[simplecheck-webhook]', JSON.stringify(summary));
}

/** Handler for `/api/simplecheck-webhook`. */
export async function handleSimpleCheckWebhookRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const signingSecret = process.env.SIMPLECHECK_SIGNING_SECRET?.trim();
  const tokenSecret = process.env.SIMPLECHECK_WEBHOOK_SECRET?.trim();
  if (!signingSecret && !tokenSecret) {
    console.error('[simplecheck-webhook] SIMPLECHECK_SIGNING_SECRET is not configured');
    sendJson(res, 500, { error: 'Webhook not configured' });
    return;
  }

  let rawBody: Buffer;
  try {
    rawBody = await readRequestBody(req);
  } catch (error) {
    const tooLarge = error instanceof BodyTooLargeError;
    sendJson(res, tooLarge ? 413 : 400, { error: tooLarge ? 'Payload too large' : 'Unable to read body' });
    return;
  }

  // Every configured layer must pass. Reject before parsing or acting on anything.
  const signatureHeader = req.headers['x-simplecheck-signature'];
  if (
    signingSecret &&
    !verifySimpleCheckSignature(
      rawBody,
      Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader,
      signingSecret,
    )
  ) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return;
  }
  if (tokenSecret && !secretsMatch(extractProvidedToken(req), tokenSecret)) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return;
  }

  let body: SimpleCheckWebhook;
  try {
    body = rawBody.length ? (JSON.parse(rawBody.toString('utf8')) as SimpleCheckWebhook) : {};
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body' });
    return;
  }

  const data = body.data && typeof body.data === 'object' ? body.data : {};

  if (body.event !== SIMPLECHECK_LEAD_EVENT) {
    logSummary(body, data, 'ignored_event');
    sendJson(res, 200, { success: true, ignored: body.event ?? 'unknown' });
    return;
  }

  const payload = simpleCheckLeadToPayload(data);

  if (!payload.phone) {
    logSummary(body, data, 'skipped_no_phone');
    sendJson(res, 200, { success: true, skipped: 'no_phone' });
    return;
  }

  if (!isSmsloopConfigured()) {
    console.error('[simplecheck-webhook] SMSLOOP_URL/SMSLOOP_SECRET is not configured');
    sendJson(res, 500, { error: 'SMSLoop not configured' });
    return;
  }

  if (!shouldForwardToSmsloop(payload)) {
    logSummary(body, data, 'skipped_no_consent');
    sendJson(res, 200, { success: true, skipped: 'no_sms_consent' });
    return;
  }

  try {
    await sendLeadToSmsloop(payload, {
      fields: mapQuizFields(data.customFields),
      // SimpleCheck did the screening, so we do not claim a quiz verdict.
      context: { lead_status: 'simplecheck_lead' },
    });
    logSummary(body, data, 'sent_to_smsloop');
    sendJson(res, 200, { success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SMSLoop request failed';
    console.error('[simplecheck-webhook]', message);
    // Non-2xx so SimpleCheck can retry if it supports it.
    sendJson(res, 502, { error: 'Forward failed' });
  }
}
