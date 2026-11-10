import { readFileSync } from 'node:fs';
import { CAPI_EVENT_NAMES, isScheduleEventSource, META_DATASET_ID, META_DATASET_ID_TRAINING } from '../api/track-event/metaCapi';
import { facebookClickIdFromFbclid, facebookClickIdFromUrl } from '../src/lib/facebookClickId';
import { getCalendlyEmbedUrl } from '../src/lib/calendly';
import { bookingConversionEvent, funnelPathsFor } from '../src/lib/funnelPaths';
import { META_PIXEL_ID, META_PIXEL_ID_TRAINING, META_STANDARD_EVENTS } from '../src/lib/metaPixel';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const metaCapiSource = readFileSync(new URL('../api/track-event/metaCapi.ts', import.meta.url), 'utf8');

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
  [
    'training pixel matches live and training datasets',
    META_PIXEL_ID === META_DATASET_ID &&
      META_PIXEL_ID_TRAINING === '3091081311239345' &&
      META_DATASET_ID_TRAINING === META_PIXEL_ID_TRAINING,
  ],
  [
    'schedule pages init only the new pixel',
    indexHtml.includes("location.pathname === '/schedule'") &&
      indexHtml.includes("// fbq('init', '1880087192677392');") &&
      indexHtml.includes(`fbq('init', '${META_PIXEL_ID_TRAINING}')`) &&
      !indexHtml.includes("fbq('track', 'PageView')") &&
      !indexHtml.slice(indexHtml.indexOf('<noscript>'), indexHtml.indexOf('</noscript>')).includes(META_PIXEL_ID_TRAINING),
  ],
  [
    'schedule click id uses the Meta fbc parameter',
    facebookClickIdFromFbclid('AbCdEf', 1554763741205) === 'fb.1.1554763741205.AbCdEf' &&
      facebookClickIdFromUrl('https://sneak-it-in-fitness.vercel.app/schedule?fbclid=AbCdEf', 1554763741205) ===
        'fb.1.1554763741205.AbCdEf' &&
      indexHtml.includes("var fbc = 'fb.1.' + Date.now() + '.' + fbclid;") &&
      metaCapiSource.includes('client_ip_address') &&
      metaCapiSource.includes('userData.fbc = ud.fbc'),
  ],
  [
    'training CAPI follows the schedule URL only',
    isScheduleEventSource('https://sneak-it-in-fitness.vercel.app/schedule') &&
      isScheduleEventSource('https://sneak-it-in-fitness.vercel.app/schedule/booking') &&
      isScheduleEventSource('https://sneak-it-in-fitness.vercel.app/schedule/post-booking') &&
      !isScheduleEventSource('https://sneak-it-in-fitness.vercel.app/') &&
      !isScheduleEventSource('https://sneak-it-in-fitness.vercel.app/booking') &&
      !isScheduleEventSource('https://sneak-it-in-fitness.vercel.app/post-booking'),
  ],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
  if (!ok) failed += 1;
}

if (failed > 0) process.exit(1);
console.log('Funnel variant verification passed.');
