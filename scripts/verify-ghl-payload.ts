import { formatApplicationPayload } from '../src/lib/formatApplicationPayload';
import { emptyApplicationFormData } from '../src/data/applicationForm';
import { buildGhlContactPayload, formatPhoneForGhl, shouldCreateGhlContact, shouldForwardToGoogleSheet, shouldForwardToZapier } from '../api/submit-application/ghl';
import { formatLeadsTabRow, LEADS_TAB_HEADERS } from '../api/submit-application/sheetLead';

const base = {
  ...emptyApplicationFormData,
  name: 'Jane Doe',
  isJewish: 'yes' as const,
  situation: 'B',
  goal: 'A',
  openToCoaching: 'yes' as const,
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
  ['sneakit application tag applied', tags.includes('SneakIt Application')],
  ['qualified tag applied', tags.includes('Qualified Lead')],
  [
    'only allowlisted tags sent',
    tags.every((tag) =>
      ['SneakIt Application', 'Warm Lead', 'Qualified Lead', 'Disqualified Lead'].includes(tag)
    ) && tags.length === 2,
  ],
  [
    'disqualified tag applied when dq',
    (
      buildGhlContactPayload(
        { ...payload, leadStatus: 'disqualified' },
        'test-location-id'
      ).tags as string[]
    ).includes('Disqualified Lead'),
  ],
  ['no custom fields', !('customFields' in contact)],
  ['ghl created for qualified lead', shouldCreateGhlContact(payload) === true],
  [
    'ghl skipped for financial dq',
    shouldCreateGhlContact({
      ...payload,
      leadStatus: 'disqualified',
      dqReason: 'gathering_information',
      readiness: { ...payload.readiness, code: 'C' },
    }) === false,
  ],
  [
    'ghl still created for non-financial dq',
    shouldCreateGhlContact({
      ...payload,
      leadStatus: 'disqualified',
      dqReason: 'not_open_to_coaching',
    }) === true,
  ],
  [
    'zapier skipped for financial dq',
    shouldForwardToZapier({
      ...payload,
      leadStatus: 'disqualified',
      dqReason: 'gathering_information',
      readiness: { ...payload.readiness, code: 'C' },
    }) === false,
  ],
  [
    'zapier skipped for non-financial dq',
    shouldForwardToZapier({
      ...payload,
      leadStatus: 'disqualified',
      dqReason: 'not_open_to_coaching',
    }) === false,
  ],
  ['zapier kept for qualified lead', shouldForwardToZapier(payload) === true],
  [
    'zapier skipped if readiness C even when marked qualified',
    shouldForwardToZapier({
      ...payload,
      leadStatus: 'qualified',
      dqReason: null,
      readiness: { ...payload.readiness, code: 'C' },
    }) === false,
  ],
  [
    'sheet used for dq leads',
    shouldForwardToGoogleSheet({
      ...payload,
      leadStatus: 'disqualified',
      dqReason: 'just_browsing',
    }) === true,
  ],
  ['sheet skipped for qualified lead', shouldForwardToGoogleSheet(payload) === false],
  ['leads tab has 15 columns', LEADS_TAB_HEADERS.length === 15],
  [
    'leads tab column order',
    LEADS_TAB_HEADERS.join('|') ===
      'Date|Name|Jewish|Problem|Goal|Committed?|Instagram|Occupation|Email|Number|Recieving Help|No Show?|UTM Campaign|UTM Set|UTM Ad',
  ],
  [
    'leads tab row mapped',
    (() => {
      const row = formatLeadsTabRow({
        ...payload,
        utm_source: 'Campaign Name',
        utm_medium: 'Adset Name',
        utm_campaign: 'Ad Name',
      });
      return (
        row[1] === 'Jane Doe' &&
        row[2] === 'Yes' &&
        row[6] === '@jane' &&
        row[8] === 'jane@example.com' &&
        row[11] === '' &&
        row[12] === 'Campaign Name' &&
        row[13] === 'Adset Name' &&
        row[14] === 'Ad Name'
      );
    })(),
  ],
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
