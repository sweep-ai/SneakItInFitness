/** Meta (Facebook) Pixel ID — must match the snippet in index.html */
export const META_PIXEL_ID = '1880087192677392';

function fbqAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

/** Fires on client-side route changes (initial PageView is in index.html). */
export function trackPageView(): void {
  const fbq = fbqAvailable() ? window.fbq : undefined;
  if (!fbq) return;
  fbq('track', 'PageView');
}

/** Standard event when a Calendly appointment is booked. */
export function trackSchedule(): void {
  const fbq = fbqAvailable() ? window.fbq : undefined;
  if (!fbq) return;
  fbq('track', 'Schedule');
}
