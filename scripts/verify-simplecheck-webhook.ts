import { createHmac } from 'node:crypto';
import { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleSimpleCheckWebhookRequest } from '../api/simplecheck-webhook/handler';
import { mapQuizFields, QUIZ_FIELD_LABELS } from '../api/simplecheck-webhook/fields';

const SIGNING_SECRET = 'test-signing-secret';
const TOKEN_SECRET = 'test-token-secret';

process.env.SMSLOOP_URL = 'https://smsloop.invalid';
process.env.SMSLOOP_SECRET = 'test-secret';
delete process.env.SMSLOOP_SCENARIO;
delete process.env.SIMPLECHECK_WEBHOOK_LOG_BODY;

const sent: Array<{ url: string; body: Record<string, any> }> = [];
let smsloopStatus = 200;
globalThis.fetch = (async (url: string, init?: RequestInit) => {
  sent.push({ url: String(url), body: JSON.parse(String(init?.body)) });
  return new Response(JSON.stringify({ status: 'created', phone: '+16505550123' }), {
    status: smsloopStatus,
  });
}) as typeof fetch;

const logged: string[] = [];
const originalLog = console.log;
const originalError = console.error;
console.log = (...args: unknown[]) => void logged.push(args.map(String).join(' '));
console.error = () => undefined;

/** Shape captured from a live widget submission. Values are synthetic. */
const CREDIT_SENTINEL = 'CREDIT_SENTINEL_742';
const liveLead = {
  id: '76c5e63e-0000-0000-0000-d458a06b49b0',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  phone: '6505550123',
  countryCode: '+1',
  phoneVerified: null,
  widgetType: 'lead_only',
  meetingDate: null,
  meetingTime: null,
  hostEmail: null,
  hostName: null,
  customFields: {
    marketingConsent: true,
    termsConsent: true,
    xrayConsent: true,
    which_option_fits_you_best: 'Yes I watched it',
    which_best_describes_your_situation: "Successful on paper, but know I'm capable of more",
    what_does_a_successful_result_for_you: 'Lose 20 lbs and keep it off',
    swolekol_is_an_online_fitness_program: 'Yes',
    what_is_your_occupation: 'Engineer',
    what_is_your_age: '41',
    what_is_your_instagram_or_facebook: '@',
    creditScore: CREDIT_SENTINEL,
    income: CREDIT_SENTINEL,
    dti: CREDIT_SENTINEL,
    ipAddress: '203.0.113.9',
    qualification: CREDIT_SENTINEL,
    some_future_question: 'FUTURE_UNMAPPED_VALUE',
  },
  creditData: { creditScore: CREDIT_SENTINEL, income: CREDIT_SENTINEL },
  attribution: { href: 'https://example.com/schedule' },
  createdAt: '2026-11-16T19:39:56.216Z',
};

function sign(body: string | Buffer, secret = SIGNING_SECRET): string {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

async function call(options: {
  rawBody: string;
  method?: string;
  headers?: Record<string, string>;
  url?: string;
}): Promise<{ status: number; body: Record<string, any> }> {
  const req = Object.assign(Readable.from([Buffer.from(options.rawBody)]), {
    method: options.method ?? 'POST',
    url: options.url ?? '/api/simplecheck-webhook',
    headers: options.headers ?? {},
  }) as unknown as IncomingMessage;

  let status = 0;
  let responseBody = '';
  const res = {
    statusCode: 200,
    setHeader() {},
    end(chunk: string) {
      status = this.statusCode;
      responseBody = chunk;
    },
  } as unknown as ServerResponse;

  await handleSimpleCheckWebhookRequest(req, res);
  return { status, body: responseBody ? JSON.parse(responseBody) : {} };
}

const envelope = (data: Record<string, unknown>, event = 'lead.created') =>
  JSON.stringify({ event, timestamp: '2026-11-16T19:39:56Z', clientId: 'widget_test', data });

const signed = (rawBody: string) => ({ 'x-simplecheck-signature': sign(rawBody) });

// --- Configured with both layers: signature AND token ---------------------------
process.env.SIMPLECHECK_SIGNING_SECRET = SIGNING_SECRET;
process.env.SIMPLECHECK_WEBHOOK_SECRET = TOKEN_SECRET;
const tokenUrl = `/api/simplecheck-webhook?token=${TOKEN_SECRET}`;

const good = envelope(liveLead);
const unsigned = await call({ rawBody: good, url: tokenUrl });
const wrongSig = await call({
  rawBody: good,
  url: tokenUrl,
  headers: { 'x-simplecheck-signature': sign(good, 'attacker-secret') },
});
const malformedSig = await call({
  rawBody: good,
  url: tokenUrl,
  headers: { 'x-simplecheck-signature': 'sha256=not-hex' },
});
const noPrefixSig = await call({
  rawBody: good,
  url: tokenUrl,
  headers: { 'x-simplecheck-signature': sign(good).replace('sha256=', '') },
});
const tampered = await call({
  rawBody: good.replace('Jane', 'Evil'),
  url: tokenUrl,
  headers: signed(good),
});
const signedNoToken = await call({ rawBody: good, headers: signed(good) });
const getRequest = await call({ rawBody: '', method: 'GET', url: tokenUrl, headers: signed('') });
const callsAfterRejections = sent.length;

const oversized = await call({
  rawBody: 'x'.repeat(300 * 1024),
  url: tokenUrl,
  headers: signed('x'),
});

const badJson = '{not json';
const invalidJson = await call({ rawBody: badJson, url: tokenUrl, headers: signed(badJson) });

const ignoredBody = envelope(liveLead, 'credit.completed');
const ignored = await call({ rawBody: ignoredBody, url: tokenUrl, headers: signed(ignoredBody) });

const noConsentLead = {
  ...liveLead,
  customFields: { ...liveLead.customFields, marketingConsent: false },
};
const noConsentBody = envelope(noConsentLead);
const noConsent = await call({ rawBody: noConsentBody, url: tokenUrl, headers: signed(noConsentBody) });

const missingConsentLead = { ...liveLead, customFields: { what_is_your_age: '41' } };
const missingConsentBody = envelope(missingConsentLead);
const missingConsent = await call({
  rawBody: missingConsentBody,
  url: tokenUrl,
  headers: signed(missingConsentBody),
});

const noPhoneBody = envelope({ ...liveLead, phone: '' });
const noPhone = await call({ rawBody: noPhoneBody, url: tokenUrl, headers: signed(noPhoneBody) });
const callsBeforeValidSend = sent.length;

const accepted = await call({ rawBody: good, url: tokenUrl, headers: signed(good) });
const inbound = sent[0];
const inboundText = JSON.stringify(inbound?.body ?? {});

smsloopStatus = 500;
const upstreamFail = await call({ rawBody: good, url: tokenUrl, headers: signed(good) });
smsloopStatus = 200;

// --- Signature-only mode and token-only mode ------------------------------------
delete process.env.SIMPLECHECK_WEBHOOK_SECRET;
const signatureOnly = await call({ rawBody: good, headers: signed(good) });
const signatureOnlyUnsigned = await call({ rawBody: good });

delete process.env.SIMPLECHECK_SIGNING_SECRET;
process.env.SIMPLECHECK_WEBHOOK_SECRET = TOKEN_SECRET;
const tokenOnly = await call({ rawBody: good, url: tokenUrl });
const tokenOnlyBearer = await call({
  rawBody: good,
  headers: { authorization: `Bearer ${TOKEN_SECRET}` },
});
const tokenOnlyWrong = await call({ rawBody: good, url: '/api/simplecheck-webhook?token=wrong' });

delete process.env.SIMPLECHECK_WEBHOOK_SECRET;
const unconfigured = await call({ rawBody: good, headers: signed(good) });

// --- Log hygiene ---------------------------------------------------------------
const logText = logged.join('\n');

console.log = originalLog;
console.error = originalError;

const mapped = mapQuizFields(liveLead.customFields);
const expectedLabels = Object.values(QUIZ_FIELD_LABELS);

const checks: Array<[string, boolean]> = [
  // Authentication and integrity
  ['unsigned request is 401 when a signing secret is set', unsigned.status === 401],
  ['signature from the wrong secret is 401', wrongSig.status === 401],
  ['malformed signature is 401', malformedSig.status === 401],
  ['signature without sha256= prefix is 401', noPrefixSig.status === 401],
  ['tampered body with the original signature is 401', tampered.status === 401],
  ['valid signature without the token is 401 when both are required', signedNoToken.status === 401],
  ['GET is 405', getRequest.status === 405],
  ['nothing reached SMSLoop from any rejected request', callsAfterRejections === 0],
  ['oversized body is 413', oversized.status === 413],
  ['signed invalid JSON is 400', invalidJson.status === 400],
  ['no secret configured fails closed with 500', unconfigured.status === 500],
  ['signature only mode accepts a valid signature', signatureOnly.status === 200],
  ['signature only mode rejects an unsigned request', signatureOnlyUnsigned.status === 401],
  ['token only mode accepts ?token=', tokenOnly.status === 200],
  ['token only mode accepts Bearer', tokenOnlyBearer.status === 200],
  ['token only mode rejects a wrong token', tokenOnlyWrong.status === 401],

  // Compliance gates
  ['non lead.created event is acknowledged and ignored', ignored.status === 200 && Boolean(ignored.body.ignored)],
  ['marketingConsent false does not text', noConsent.body.skipped === 'no_sms_consent'],
  ['missing consent field does not text', missingConsent.body.skipped === 'no_sms_consent'],
  ['missing phone is skipped', noPhone.body.skipped === 'no_phone'],
  ['nothing reached SMSLoop before the valid lead', callsBeforeValidSend === 0],

  // Accuracy of what is sent
  ['valid lead returns 200', accepted.status === 200 && accepted.body.success === true],
  ['POST /leads/inbound', inbound?.url === 'https://smsloop.invalid/leads/inbound'],
  ['US 10 digit phone normalized to E.164', inbound?.body.phone === '+16505550123'],
  ['first and last name split', inbound?.body.first_name === 'Jane' && inbound?.body.last_name === 'Doe'],
  ['email forwarded', inbound?.body.email === 'jane.doe@example.com'],
  ['source is SimpleCheck widget', inbound?.body.source === 'SimpleCheck widget'],
  ['scenario defaults to not_booked', inbound?.body.scenario === 'not_booked'],
  ['consent timestamp is the lead createdAt', inbound?.body.context?.consent_given_at === '2026-11-16T19:39:56.216Z'],
  ['lead_status does not claim a quiz verdict', inbound?.body.context?.lead_status === 'simplecheck_lead'],
  ['situation answer sent with readable question', inbound?.body.fields?.['What is going on right now?'] === "Successful on paper, but know I'm capable of more"],
  ['goal answer sent with readable question', inbound?.body.fields?.['What does a successful result for you look like?'] === 'Lose 20 lbs and keep it off'],
  ['age and occupation sent', inbound?.body.fields?.Age === '41' && inbound?.body.fields?.Occupation === 'Engineer'],
  ['untouched Instagram "@" is dropped', !('Instagram or Facebook' in (inbound?.body.fields ?? {}))],
  ['only allowlisted question labels are used', Object.keys(inbound?.body.fields ?? {}).every((key) => expectedLabels.includes(key))],

  // Privacy: credit and identity data must not leave
  ['credit values never sent to SMSLoop', !inboundText.includes(CREDIT_SENTINEL)],
  ['IP address never sent to SMSLoop', !inboundText.includes('203.0.113.9')],
  ['unknown future custom fields are not forwarded', !inboundText.includes('FUTURE_UNMAPPED_VALUE')],
  ['consent flags are not forwarded as quiz fields', !inboundText.includes('termsConsent') && !inboundText.includes('xrayConsent')],
  ['field values are capped at 1000 characters', Object.values(mapQuizFields({ what_is_your_age: 'a'.repeat(5000) })).every((v) => v.length <= 1000)],
  ['mapper tolerates null customFields', Object.keys(mapQuizFields(null)).length === 0],
  ['mapper keeps all 6 meaningful answers', Object.keys(mapped).length === 6],

  // Reliability
  ['SMSLoop failure returns 502 so SimpleCheck can retry', upstreamFail.status === 502],

  // Logs carry no PII, credit data, or answer text by default
  ['logs hold no phone', !logText.includes('6505550123')],
  ['logs hold no email', !logText.includes('jane.doe@example.com')],
  ['logs hold no name', !logText.includes('Jane') && !logText.includes('Doe')],
  ['logs hold no credit values', !logText.includes(CREDIT_SENTINEL)],
  ['logs hold no quiz answer text by default', !logText.includes('Lose 20 lbs')],
  ['logs list unmapped custom field keys for review', logText.includes('some_future_question')],
];

let failed = false;
for (const [label, ok] of checks) {
  if (!ok) failed = true;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
}

console.log(`\n${checks.filter(([, ok]) => ok).length}/${checks.length} checks passed`);
if (failed) process.exit(1);
