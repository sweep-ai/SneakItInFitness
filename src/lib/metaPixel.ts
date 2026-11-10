import { isSchedulePath } from './funnelPaths';

/** Live campaign pixel. Must match the first `fbq('init')` in index.html. */
export const META_PIXEL_ID = '1880087192677392';

/** Training pixel. Fires only on /schedule routes. */
export const META_PIXEL_ID_TRAINING = '3091081311239345';

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
 * Fires one conversion once: browser pixel and Conversions API, same event id.
 * Meta dedupes that pair. Callers must not track the same step from two pages.
 */
function trackEvent(eventName: string, userData?: PixelUserData, eventId?: string): void {
  const resolvedEventId = eventId ?? generateEventId();
  const eventSourceUrl = typeof window !== 'undefined' ? window.location.href : undefined;

  if (fbqAvailable()) {
    // Live pixel on every page. Training pixel only while the URL is /schedule.
    window.fbq?.('trackSingle', META_PIXEL_ID, eventName, {}, { eventID: resolvedEventId });
    if (typeof window !== 'undefined' && isSchedulePath(window.location.pathname)) {
      window.fbq?.('init', META_PIXEL_ID_TRAINING);
      window.fbq?.(
        'trackSingle',
        META_PIXEL_ID_TRAINING,
        eventName,
        {},
        { eventID: resolvedEventId }
      );
    }
  }

  sendServerEvent(eventName, resolvedEventId, eventSourceUrl, userData);
}

/** Meta standard events this site sends. Pixel `eventID` matches CAPI `event_id`. */
export const META_STANDARD_EVENTS = ['PageView', 'Lead', 'Schedule', 'CompleteRegistration'] as const;

export type MetaStandardEvent = (typeof META_STANDARD_EVENTS)[number];

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

  // One CAPI post. A dropped request retries once with the same event id,
  // so Meta still dedupes if the first post actually landed.
  const body = JSON.stringify(payload);
  const post = () =>
    fetch(TRACK_EVENT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });

  const postOnce = () =>
    post().then((response) => {
      if (response.status >= 500) throw new Error('capi');
    });

  void postOnce().catch(() => {
    void post().catch(() => {
      /* Swallow tracking errors. */
    });
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

/** Standard event when a Calendly appointment is booked on the /schedule funnel. */
export function trackSchedule(userData?: PixelUserData, eventId?: string): void {
  trackEvent('Schedule', userData, eventId);
}

/** Standard event when a Calendly appointment is booked on the original funnel. */
export function trackCompleteRegistration(userData?: PixelUserData, eventId?: string): void {
  trackEvent('CompleteRegistration', userData, eventId);
}
