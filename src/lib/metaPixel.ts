import { facebookClickIdFromFbclid, fbcMatchesFbclid } from './facebookClickId';
import { isSchedulePath } from './funnelPaths';

/** Live campaign pixel. Must match the first `fbq('init')` in index.html. */
export const META_PIXEL_ID = '1880087192677392';

/** New pixel. The only browser pixel on /schedule routes. */
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

const FBC_STORAGE_KEY = 'sneakit-fbc';

function readStoredClickId(): string | undefined {
  try {
    return sessionStorage.getItem(FBC_STORAGE_KEY) || undefined;
  } catch {
    return undefined;
  }
}

function storeClickId(fbc: string): void {
  try {
    sessionStorage.setItem(FBC_STORAGE_KEY, fbc);
  } catch {
    /* Storage can be blocked. The cookie still carries the click id. */
  }
  if (getCookie('_fbc') === fbc) return;
  document.cookie = `_fbc=${encodeURIComponent(fbc)}; path=/; max-age=7776000; SameSite=Lax`;
}

/**
 * Schedule pixel click id. Prefers the _fbc cookie, then the fbclid URL parameter.
 * Meta parameter name is `fbc`. Do not hash.
 */
function scheduleClickId(): string | undefined {
  if (typeof window === 'undefined' || !isSchedulePath(window.location.pathname)) return undefined;

  const fbclid = new URLSearchParams(window.location.search).get('fbclid')?.trim();
  const cookieFbc = getCookie('_fbc');
  const storedFbc = readStoredClickId();
  const current = cookieFbc || storedFbc;

  if (fbclid && (!current || !fbcMatchesFbclid(current, fbclid))) {
    const fbc = facebookClickIdFromFbclid(fbclid);
    if (!fbc) return current;
    storeClickId(fbc);
    return fbc;
  }

  if (current) {
    storeClickId(current);
    return current;
  }

  return undefined;
}

/**
 * Fires one conversion once: browser pixel and Conversions API, same event id.
 * Meta dedupes that pair. Callers must not track the same step from two pages.
 */
function trackEvent(eventName: string, userData?: PixelUserData, eventId?: string): void {
  const resolvedEventId = eventId ?? generateEventId();
  const eventSourceUrl = typeof window !== 'undefined' ? window.location.href : undefined;

  if (fbqAvailable()) {
    const onSchedule = isSchedulePath(window.location.pathname);
    if (onSchedule) {
      // Old pixel is off on /schedule.
      // window.fbq?.('trackSingle', META_PIXEL_ID, eventName, {}, { eventID: resolvedEventId });
      window.fbq?.('init', META_PIXEL_ID_TRAINING);
      window.fbq?.(
        'trackSingle',
        META_PIXEL_ID_TRAINING,
        eventName,
        {},
        { eventID: resolvedEventId }
      );
    } else {
      window.fbq?.('trackSingle', META_PIXEL_ID, eventName, {}, { eventID: resolvedEventId });
    }
  }

  sendServerEvent(eventName, resolvedEventId, eventSourceUrl, userData);
}

/** Meta standard events this site sends. Pixel `eventID` matches CAPI `event_id`. */
export const META_STANDARD_EVENTS = ['PageView', 'Lead', 'Schedule', 'CompleteRegistration'] as const;

export type MetaStandardEvent = (typeof META_STANDARD_EVENTS)[number];

const CONVERSION_EVENTS = new Set<string>(['Lead', 'Schedule', 'CompleteRegistration']);
const CAPI_OUTBOX_KEY = 'sneakit-capi-outbox';

interface ServerEventPayload {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  userData?: PixelUserData & { fbp?: string; fbc?: string };
}

function readOutbox(): ServerEventPayload[] {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(CAPI_OUTBOX_KEY) || '[]') as ServerEventPayload[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOutbox(items: ServerEventPayload[]): void {
  try {
    sessionStorage.setItem(CAPI_OUTBOX_KEY, JSON.stringify(items.slice(-20)));
  } catch {
    /* Storage can be blocked. The request below still sends. */
  }
}

function rememberServerEvent(payload: ServerEventPayload): void {
  if (!CONVERSION_EVENTS.has(payload.eventName)) return;
  const rest = readOutbox().filter(
    (item) => !(item.eventName === payload.eventName && item.eventId === payload.eventId)
  );
  writeOutbox([...rest, payload]);
}

function forgetServerEvent(eventName: string, eventId: string): void {
  writeOutbox(readOutbox().filter((item) => !(item.eventName === eventName && item.eventId === eventId)));
}

let retryArmed = false;

function armServerRetry(): void {
  if (retryArmed || typeof window === 'undefined') return;
  retryArmed = true;
  window.addEventListener('online', () => flushServerEvents());
}

function postServerEvent(payload: ServerEventPayload, beacon: boolean): void {
  const body = JSON.stringify(payload);
  if (beacon && CONVERSION_EVENTS.has(payload.eventName)) {
    try {
      navigator.sendBeacon?.(TRACK_EVENT_ENDPOINT, new Blob([body], { type: 'application/json' }));
    } catch {
      /* fetch below still sends the event */
    }
  }

  const post = () =>
    fetch(TRACK_EVENT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });

  const finish = (response: Response) => {
    if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429)) {
      forgetServerEvent(payload.eventName, payload.eventId);
      return;
    }
    throw new Error('capi');
  };

  void post()
    .then(finish)
    .catch(() => {
      void post().then(finish).catch(() => {
        /* Kept in the outbox. The next page or online event retries the same event id. */
      });
    });
}

function sendServerEvent(
  eventName: string,
  eventId: string,
  eventSourceUrl: string | undefined,
  userData?: PixelUserData
): void {
  if (typeof fetch === 'undefined') return;

  const payload: ServerEventPayload = {
    eventName,
    eventId,
    eventSourceUrl,
    userData: {
      ...userData,
      fbp: getCookie('_fbp'),
      fbc: scheduleClickId() ?? getCookie('_fbc'),
    },
  };

  // Same event id on every attempt. Meta counts one event when the pixel
  // eventID matches this CAPI event_id, even if the post is delivered twice.
  rememberServerEvent(payload);
  armServerRetry();
  postServerEvent(payload, true);
}

/** Retries conversion events whose server post never returned success. */
export function flushServerEvents(): void {
  for (const payload of readOutbox()) {
    postServerEvent(payload, false);
  }
}

/** CAPI only. Used before navigation so a Schedule is not lost if the next page never paints. */
export function sendServerConversion(
  eventName: MetaStandardEvent,
  eventId: string,
  userData?: PixelUserData
): void {
  const eventSourceUrl = typeof window !== 'undefined' ? window.location.href : undefined;
  sendServerEvent(eventName, eventId, eventSourceUrl, userData);
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
