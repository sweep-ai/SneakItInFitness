import { formatApplicationPayload } from '../src/lib/formatApplicationPayload';
import { emptyApplicationFormData } from '../src/data/applicationForm';
import { buildGhlContactPayload, formatPhoneForGhl } from '../api/submit-application/ghl';

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
  phone: '310-561-5995',
};

const payload = formatApplicationPayload(base);
const contact = buildGhlContactPayload(payload, 'test-location-id');
const tags = contact.tags as string[];

const checks: Array<[string, boolean]> = [
  ['first name split', contact.firstName === 'Jane'],
  ['last name split', contact.lastName === 'Doe'],
  ['email preserved', contact.email === 'jane@example.com'],
  ['phone normalized to E.164', formatPhoneForGhl(base.phone) === '+13105615995'],
  ['occupation mapped to company', contact.companyName === 'Engineer'],
  ['instagram mapped to website', contact.website === 'https://instagram.com/jane'],
  [
    'facebook url mapped to website',
    buildGhlContactPayload(
      { ...payload, instagram: 'https://facebook.com/jane.doe' },
      'test-location-id'
    ).website === 'https://facebook.com/jane.doe',
  ],
  ['location id included', contact.locationId === 'test-location-id'],
  ['source preserved', contact.source === 'sneakit-application-form'],
  ['qualified tag applied', tags.includes('Qualified Lead')],
  ['jewish tag applied', tags.includes('Jewish Yes')],
  ['situation tag applied', tags.includes('Situation B')],
  ['goal tag applied', tags.includes('Goal A')],
  ['readiness tag applied', tags.includes('Readiness B')],
  ['age tag applied', tags.includes('Age 34')],
  ['no custom fields', !('customFields' in contact)],
];

let failed = 0;

for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
  if (!ok) failed += 1;
}

if (failed > 0) {
  process.exit(1);
}

console.log('GHL contact payload verification passed.');
