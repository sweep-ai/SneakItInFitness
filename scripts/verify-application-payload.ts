import { formatApplicationPayload } from '../src/lib/formatApplicationPayload';
import { emptyApplicationFormData } from '../src/data/applicationForm';

const base = {
  ...emptyApplicationFormData,
  name: 'Jane Doe',
  isJewish: 'yes' as const,
  situation: 'B',
  goals: ['A', 'B', 'C'],
  seriousness: 'A',
  instagram: '@jane',
  investment: 'B',
  occupation: 'Engineer',
  age: '34',
  email: 'jane@example.com',
  phone: '+1 555 123 4567',
};

const qualified = formatApplicationPayload({ ...base, investment: 'A' });
const interested = formatApplicationPayload({ ...base, investment: 'B' });
const dqInvest = formatApplicationPayload({ ...base, investment: 'C' });
const dqSerious = formatApplicationPayload({ ...base, seriousness: 'D' });

const requiredKeys = [
  'name',
  'isJewish',
  'situation',
  'situationCode',
  'situationPrompt',
  'goals',
  'goalsCodes',
  'goalsPrompt',
  'seriousness',
  'seriousnessCode',
  'seriousnessPrompt',
  'instagram',
  'investment',
  'investmentCode',
  'investmentPrompt',
  'occupation',
  'age',
  'email',
  'phone',
  'leadStatus',
  'dqReason',
  'submittedAt',
  'source',
] as const;

const checks: Array<[string, boolean]> = [
  ['qualified investment A', qualified.leadStatus === 'qualified' && qualified.dqReason === null],
  [
    'interested investment B',
    interested.leadStatus === 'qualified' && interested.dqReason === null,
  ],
  [
    'dq investment C',
    dqInvest.leadStatus === 'disqualified' &&
      dqInvest.dqReason === 'not_willing_for_help' &&
      dqInvest.dqReasonLegacy === 'not_ready_to_invest',
  ],
  [
    'dq seriousness D',
    dqSerious.leadStatus === 'disqualified' && dqSerious.dqReason === 'waste_time',
  ],
  [
    'investment maps to new labels',
    qualified.investment.includes('ready to get the help') &&
      interested.investment.includes('learn more about coaching'),
  ],
  [
    'question prompts included',
    qualified.investmentPrompt.includes('results were guaranteed') &&
      qualified.situationPrompt.includes('best describes your situation'),
  ],
  ['required webhook keys present', requiredKeys.every((key) => key in qualified)],
];

let failed = 0;

for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
  if (!ok) {
    failed += 1;
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log('Application webhook payload verification passed.');
