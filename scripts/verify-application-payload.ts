import { formatApplicationPayload } from '../src/lib/formatApplicationPayload';
import { emptyApplicationFormData } from '../src/data/applicationForm';
import { isValidPhone } from '../src/lib/validators';

const base = {
  ...emptyApplicationFormData,
  name: 'Jane Doe',
  isJewish: 'yes' as const,
  situation: 'B',
  goal: 'A',
  readiness: 'B',
  instagram: '@jane',
  occupation: 'Engineer',
  age: '34',
  email: 'jane@example.com',
  phone: '+1 310 561 5995',
};

const qualified = formatApplicationPayload({ ...base, readiness: 'A' });
const interested = formatApplicationPayload({ ...base, readiness: 'B' });
const dqReadiness = formatApplicationPayload({ ...base, readiness: 'C' });

const requiredKeys = [
  'name',
  'email',
  'phone',
  'instagram',
  'isJewish',
  'occupation',
  'age',
  'situation',
  'goal',
  'readiness',
  'leadStatus',
  'dqReason',
  'submittedAt',
  'source',
  'answers',
] as const;

const checks: Array<[string, boolean]> = [
  ['qualified readiness A', qualified.leadStatus === 'qualified' && qualified.dqReason === null],
  [
    'interested readiness B',
    interested.leadStatus === 'qualified' && interested.dqReason === null,
  ],
  [
    'dq readiness C',
    dqReadiness.leadStatus === 'disqualified' &&
      dqReadiness.dqReason === 'gathering_information',
  ],
  [
    'nested choice answers mapped',
    qualified.goal.code === 'A' &&
      qualified.goal.label.includes('Lose 25+') &&
      qualified.readiness.label.includes('ready to move'),
  ],
  [
    'flat answers mirror nested fields',
    qualified.answers.goalCode === qualified.goal.code &&
      qualified.answers.goal === qualified.goal.label &&
      qualified.answers.readinessCode === qualified.readiness.code,
  ],
  ['age included in payload', qualified.age === '34' && qualified.answers.age === '34'],
  [
    'old seriousness/investment fields removed',
    !('seriousness' in qualified) && !('investment' in qualified),
  ],
  [
    'question prompts included',
    qualified.readiness.prompt.includes('dream body') &&
      qualified.situation.prompt.includes('best describes your situation'),
  ],
  ['required webhook keys present', requiredKeys.every((key) => key in qualified)],
  ['zapier phone is E.164', qualified.phone === '+13105615995'],
  [
    'zapier phone normalizes spaced E.164',
    formatApplicationPayload({ ...base, phone: '+1 (310) 561-5995' }).phone === '+13105615995',
  ],
  [
    'zapier phone normalizes national US digits',
    formatApplicationPayload({ ...base, phone: '3105615995' }).phone === '+13105615995',
  ],
  ['phone remains top-level zapier field', typeof qualified.phone === 'string' && !('phone' in qualified.answers)],
  ['real US number accepted', isValidPhone('+13105615995')],
  ['country code required', !isValidPhone('3105615995')],
  ['555 movie number rejected', !isValidPhone('+15555555555')],
  ['555 exchange rejected', !isValidPhone('+12125551212')],
  ['sequential fake rejected', !isValidPhone('+11234567890')],
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
