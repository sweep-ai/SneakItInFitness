import { createHmac } from 'node:crypto';
import { relayCalendlyWebhook, verifyCalendlySignature } from '../api/booking-webhook/handler';

const SIGNING_KEY = 'test-signing-key';
const EVENT_TYPE = 'https://api.calendly.com/event_types/test';

process.env.CALENDLY_SIGNING_KEY = SIGNING_KEY;
process.env.SMSLOOP_URL = 'https://smsloop.invalid';
process.env.SMSLOOP_SECRET = 'test-secret';
delete process.env.SMSLOOP_BOOKED_SCENARIO;
delete process.env.SMSLOOP_ON_CANCEL;
delete process.env.CALENDLY_EVENT_TYPE_URIS;

// Capture SMSLoop calls instead of hitting the network.
const sent: Array<Record<string, any>> = [];
let smsloopStatus = 200;
globalThis.fetch = (async (_url: string, init: RequestInit) => {
  sent.push(JSON.parse(String(init.body)));
  return new Response(JSON.stringify({ status: 'switched' }), { status: smsloopStatus });
}) as typeof fetch;

const now = () => Math.floor(Date.now() / 1000);
const sign = (raw: string, t = now()) =>
  `t=${t},v1=${createHmac('sha256', SIGNING_KEY).update(`${t}.${raw}`).digest('hex')}`;

function webhook(event: string, overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    event,
    payload: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      timezone: 'America/New_York',
      questions_and_answers: [{ question: 'Phone #', answer: '(310) 561-5995' }],
      scheduled_event: {
        start_time: '2026-10-20T15:00:00.000000Z',
        end_time: '2026-10-20T15:45:00.000000Z',
        name: '1-on-1 Strategy Call',
        event_type: EVENT_TYPE,
      },
      reschedule_url: 'https://calendly.com/reschedulings/abc',
      cancel_url: 'https://calendly.com/cancellations/abc',
      ...overrides,
    },
  });
}

async function relay(raw: string, signature?: string) {
  sent.length = 0;
  return relayCalendlyWebhook(raw, signature);
}

const created = webhook('invitee.created');
const canceled = webhook('invitee.canceled');

const badSig = await relay(created, 't=1,v1=00');
const staleSig = await relay(created, sign(created, now() - 600));
const missingSig = await relay(created);
const tampered = await relay(created.replace('Jane', 'Eve'), sign(created));

const booked = await relay(created, sign(created));
const bookedBody = sent[0];

const cancel = await relay(canceled, sign(canceled));
const cancelBody = sent[0];

const rescheduledRaw = webhook('invitee.canceled', { rescheduled: true });
const rescheduled = await relay(rescheduledRaw, sign(rescheduledRaw));
const rescheduledSent = sent.length;

const reminderRaw = webhook('invitee.created', { questions_and_answers: [], text_reminder_number: '+1 310 561 5995' });
await relay(reminderRaw, sign(reminderRaw));
const reminderPhone = sent[0]?.phone;

const noPhoneRaw = webhook('invitee.created', { questions_and_answers: [] });
const noPhone = await relay(noPhoneRaw, sign(noPhoneRaw));
const noPhoneSent = sent.length;

const pingRaw = JSON.stringify({ event: 'routing_form_submission.created', payload: {} });
const ping = await relay(pingRaw, sign(pingRaw));

process.env.SMSLOOP_ON_CANCEL = 'not_booked';
await relay(canceled, sign(canceled));
const rebookBody = sent[0];
delete process.env.SMSLOOP_ON_CANCEL;

process.env.CALENDLY_EVENT_TYPE_URIS = 'https://api.calendly.com/event_types/other';
const filtered = await relay(created, sign(created));
const filteredSent = sent.length;
process.env.CALENDLY_EVENT_TYPE_URIS = `https://api.calendly.com/event_types/other, ${EVENT_TYPE}`;
const allowed = await relay(created, sign(created));
delete process.env.CALENDLY_EVENT_TYPE_URIS;

smsloopStatus = 422;
const configError = await relay(created, sign(created));
smsloopStatus = 503;
const outage = await relay(created, sign(created));
smsloopStatus = 200;

const checks: Array<[string, boolean]> = [
  ['bad signature rejected', badSig.status === 401],
  ['stale signature rejected', staleSig.status === 401],
  ['missing signature rejected', missingSig.status === 401],
  ['tampered body rejected', tampered.status === 401],
  ['empty signing key never verifies', !verifyCalendlySignature(created, sign(created), '')],
  ['booking relayed', booked.status === 200 && bookedBody?.event === 'set_scenario'],
  ['booked scenario defaults to booked', bookedBody?.scenario === 'booked'],
  ['booking phone normalized to E.164', bookedBody?.phone === '+13105615995'],
  ['booking carries call_start', bookedBody?.context?.call_start === '2026-10-20T15:00:00.000000Z'],
  ['booking carries invitee timezone', bookedBody?.context?.timezone === 'America/New_York'],
  ['booking carries name/email', bookedBody?.name === 'Jane Doe' && bookedBody?.email === 'jane@example.com'],
  ['missing meeting link omitted from context', !('meeting_link' in (bookedBody?.context ?? {}))],
  ['cancel turns AI off by default', cancel.status === 200 && cancelBody?.event === 'ai_off'],
  ['reschedule cancel skipped', rescheduled.body.skipped === 'rescheduled' && rescheduledSent === 0],
  ['SMS reminder number preferred', reminderPhone === '+13105615995'],
  ['booking without phone skipped', noPhone.status === 200 && noPhone.body.skipped === 'no_phone' && noPhoneSent === 0],
  ['unhandled event acknowledged', ping.status === 200 && ping.body.skipped === 'routing_form_submission.created'],
  [
    'SMSLOOP_ON_CANCEL scenario re-engages',
    rebookBody?.event === 'set_scenario' &&
      rebookBody?.scenario === 'not_booked' &&
      rebookBody?.context?.cancelled_call === '2026-10-20T15:00:00.000000Z',
  ],
  ['event type allowlist filters', filtered.body.skipped === 'event_type' && filteredSent === 0],
  ['event type allowlist passes listed type', allowed.status === 200],
  ['SMSLoop 4xx not retried', configError.status === 200 && configError.body.error === 'smsloop_rejected'],
  ['SMSLoop 5xx retried', outage.status === 502],
];

let failed = 0;

for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
  if (!ok) failed += 1;
}

if (failed > 0) {
  process.exit(1);
}

console.log('Booking webhook relay verification passed.');
