import { CAPI_EVENT_NAMES } from '../api/track-event/metaCapi';
import { getCalendlyEmbedUrl } from '../src/lib/calendly';
import { bookingConversionEvent, funnelPathsFor } from '../src/lib/funnelPaths';
import { META_STANDARD_EVENTS } from '../src/lib/metaPixel';

const main = funnelPathsFor('default');
const schedule = funnelPathsFor('schedule');
const embed = new URL(
  getCalendlyEmbedUrl({
    name: 'Jane Doe',
    email: 'jane@example.com',
    customAnswers: { a1: '+13105615995' },
  })
);

const checks: Array<[string, boolean]> = [
  ['main home', main.home === '/' && main.booking === '/booking' && main.postBooking === '/post-booking'],
  ['main gender pages', main.male === '/male' && main.female === '/female'],
  [
    'schedule mirrors every funnel page',
    schedule.home === '/schedule' &&
      schedule.male === '/schedule/male' &&
      schedule.female === '/schedule/female' &&
      schedule.booking === '/schedule/booking' &&
      schedule.postBooking === '/schedule/post-booking',
  ],
  ['original booking conversion is CompleteRegistration', bookingConversionEvent('default') === 'CompleteRegistration'],
  ['schedule booking conversion is Schedule', bookingConversionEvent('schedule') === 'Schedule'],
  [
    'pixel and CAPI allow the same standard events',
    META_STANDARD_EVENTS.join() === CAPI_EVENT_NAMES.join() &&
      CAPI_EVENT_NAMES.includes('CompleteRegistration') &&
      CAPI_EVENT_NAMES.includes('Lead'),
  ],
  ['calendly url prefills name', embed.searchParams.get('name') === 'Jane Doe'],
  ['calendly url prefills email', embed.searchParams.get('email') === 'jane@example.com'],
  ['calendly url prefills phone as a1', embed.searchParams.get('a1') === '+13105615995'],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
  if (!ok) failed += 1;
}

if (failed > 0) process.exit(1);
console.log('Funnel variant verification passed.');
