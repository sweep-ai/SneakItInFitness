import { formatApplicationPayload } from '../src/lib/formatApplicationPayload';
import { emptyApplicationFormData } from '../src/data/applicationForm';
import {
  resolveInboundScenario,
  sendLeadToSmsloop,
  shouldForwardToSmsloop,
  SMSLOOP_NOT_BOOKED_SCENARIO,
} from '../api/submit-application/smsloop';

process.env.SMSLOOP_URL = 'https://smsloop.invalid';
process.env.SMSLOOP_SECRET = 'test-secret';
delete process.env.SMSLOOP_SCENARIO;

const sent: Array<{ url: string; body: Record<string, unknown> }> = [];
globalThis.fetch = (async (url: string, init?: RequestInit) => {
  sent.push({ url: String(url), body: JSON.parse(String(init?.body)) });
  return new Response(JSON.stringify({ status: 'created', phone: '+13105615995', scenario: 'not_booked' }), {
    status: 200,
  });
}) as typeof fetch;

const optedIn = formatApplicationPayload({
  ...emptyApplicationFormData,
  name: 'Jane Doe',
  isJewish: 'yes',
  situation: 'B',
  goal: 'A',
  openToCoaching: 'yes',
  readiness: 'B',
  instagram: '@jane',
  occupation: 'Engineer',
  age: '34',
  email: 'jane@example.com',
  phone: '310-561-5995',
  smsConsent: true,
  smsConsentTimestamp: '2026-10-19T18:20:00.000Z',
});

const noConsent = { ...optedIn, smsConsent: false, smsConsentTimestamp: '' };
const financialDq = {
  ...optedIn,
  leadStatus: 'disqualified' as const,
  dqReason: 'gathering_information',
  readiness: { ...optedIn.readiness, code: 'C' },
};

await sendLeadToSmsloop(optedIn);
const inbound = sent[0];

process.env.SMSLOOP_SCENARIO = 'waitlist';
const override = resolveInboundScenario();
delete process.env.SMSLOOP_SCENARIO;

const checks: Array<[string, boolean]> = [
  ['opt-in with phone forwards to SMSLoop', shouldForwardToSmsloop(optedIn) === true],
  ['missing consent does not forward', shouldForwardToSmsloop(noConsent) === false],
  ['financial DQ does not forward', shouldForwardToSmsloop(financialDq) === false],
  ['inbound scenario defaults to not_booked', resolveInboundScenario() === SMSLOOP_NOT_BOOKED_SCENARIO],
  ['SMSLOOP_SCENARIO overrides inbound key', override === 'waitlist'],
  ['POST /leads/inbound', inbound?.url === 'https://smsloop.invalid/leads/inbound'],
  ['opt-in payload uses not_booked', inbound?.body.scenario === 'not_booked'],
  ['phone normalized to E.164', inbound?.body.phone === '+13105615995'],
  ['first name in opener payload', inbound?.body.first_name === 'Jane'],
  ['consent timestamp in context', (inbound?.body.context as { consent_given_at?: string })?.consent_given_at === '2026-10-19T18:20:00.000Z'],
];

let failed = 0;

for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
  if (!ok) failed += 1;
}

if (failed > 0) {
  process.exit(1);
}

console.log('SMSLoop inbound opt-in verification passed.');
