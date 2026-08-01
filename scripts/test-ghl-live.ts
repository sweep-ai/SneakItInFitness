import { formatApplicationPayload } from '../src/lib/formatApplicationPayload';
import { emptyApplicationFormData } from '../src/data/applicationForm';
import { upsertApplicationContact } from '../api/submit-application/ghl';
import { loadLocalEnv } from './loadLocalEnv';

loadLocalEnv();

async function main() {
  const stamp = Date.now();
  const payload = formatApplicationPayload({
    ...emptyApplicationFormData,
    name: 'SneakIt API Test',
    isJewish: 'yes',
    situation: 'A',
    goal: 'B',
    readiness: 'A',
    instagram: '@sneakit_api_test',
    occupation: 'API Integration Test',
    email: `sneakit-api-test-${stamp}@example.com`,
    phone: `+1555${String(stamp).slice(-7)}`,
  });

  console.log('Submitting test contact to GHL...');
  console.log('Email:', payload.email);
  console.log('Phone:', payload.phone);

  const contactId = await upsertApplicationContact(payload);

  console.log('SUCCESS: Contact upserted in GHL.');
  console.log('Contact ID:', contactId);
}

main().catch((error) => {
  console.error('FAILED:', error instanceof Error ? error.message : error);
  process.exit(1);
});
