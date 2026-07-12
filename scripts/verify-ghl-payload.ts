import { formatApplicationPayload } from '../src/lib/formatApplicationPayload';
import { emptyApplicationFormData } from '../src/data/applicationForm';
import { buildGhlContactPayload, formatPhoneForGhl } from '../api/submit-application/ghl';

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
  phone: '(555) 123-4567',
};

const payload = formatApplicationPayload(base);
const contact = buildGhlContactPayload(payload, 'test-location-id');

const checks: Array<[string, boolean]> = [
  ['first name split', contact.firstName === 'Jane'],
  ['last name split', contact.lastName === 'Doe'],
  ['email preserved', contact.email === 'jane@example.com'],
  ['phone normalized to E.164', formatPhoneForGhl(base.phone) === '+15551234567'],
  ['occupation mapped to company', contact.companyName === 'Engineer'],
  ['instagram mapped to website', contact.website === 'https://instagram.com/jane'],
  ['location id included', contact.locationId === 'test-location-id'],
  ['source preserved', contact.source === 'sneakit-application-form'],
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
