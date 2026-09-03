/** Meta (Facebook) Pixel ID — must match the snippet in index.html */
export const META_PIXEL_ID = '1880087192677392';

const TRACK_EVENT_ENDPOINT = '/api/track-event';

/** Contact fields used for Conversions API advanced matching (hashed server-side). */
export interface PixelUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

function fbqAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

function trackWhop(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.whop?.track !== 'function') return;
  if (params) {
    window.whop.track(eventName, params);
    return;
  }
  window.whop.track(eventName);
}

function toWhopUserParams(
  userData?: PixelUserData,
  eventId?: string
): Record<string, unknown> | undefined {
  const params: Record<string, unknown> = {};
  if (eventId) params.event_id = eventId;
  if (userData?.email) params.email = userData.email;
  if (userData?.phone) params.phone = userData.phone;
  if (userData?.firstName) params.first_name = userData.firstName;
  if (userData?.lastName) params.last_name = userData.lastName;
  if (userData?.firstName || userData?.lastName) {
    params.name = [userData.firstName, userData.lastName].filter(Boolean).join(' ');
  }
  return Object.keys(params).length > 0 ? params : undefined;
}

/** Generates a unique id shared by the browser and server event for deduplication. */
export function generateEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Fires the same event through the browser pixel and the server Conversions API.
 * Pass an explicit `eventId` to deduplicate against an earlier fire of the same
 * conversion (e.g. firing again when the visitor lands on the destination page).
 */
function trackEvent(eventName: string, userData?: PixelUserData, eventId?: string): void {
  const resolvedEventId = eventId ?? generateEventId();
  const eventSourceUrl = typeof window !== 'undefined' ? window.location.href : undefined;

  if (fbqAvailable()) {
    // eventID enables Meta to dedupe this against the matching server event.
    window.fbq?.('track', eventName, {}, { eventID: resolvedEventId });
  }

  sendServerEvent(eventName, resolvedEventId, eventSourceUrl, userData);

  if (eventName === 'Lead') {
    trackWhop('lead', toWhopUserParams(userData, resolvedEventId));
  } else if (eventName === 'Schedule') {
    trackWhop('schedule', toWhopUserParams(userData, resolvedEventId));
  }
}

function sendServerEvent(
  eventName: string,
  eventId: string,
  eventSourceUrl: string | undefined,
  userData?: PixelUserData
): void {
  if (typeof fetch === 'undefined') return;

  const payload = {
    eventName,
    eventId,
    eventSourceUrl,
    userData: {
      ...userData,
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
    },
  };

  // Fire-and-forget: tracking must never block or break the UI.
  void fetch(TRACK_EVENT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    /* Swallow tracking errors. */
  });
}

/** Fires on every page/route view (browser + server). */
export function trackPageView(): void {
  trackEvent('PageView');
}

/** Fires when a visitor completes the application form. */
export function trackLead(userData?: PixelUserData, eventId?: string): void {
  trackEvent('Lead', userData, eventId);
}

/** Standard event when a Calendly appointment is booked. */
export function trackSchedule(userData?: PixelUserData, eventId?: string): void {
  trackEvent('Schedule', userData, eventId);
}
