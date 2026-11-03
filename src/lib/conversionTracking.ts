import {
  APPLICATION_FORM_STORAGE_KEY,
  isFinancialDisqualification,
  type ApplicationFormData,
} from '../data/applicationForm';
import { generateEventId, type PixelUserData } from './metaPixel';
import type { BookingConversionEvent } from './funnelPaths';

/**
 * One Meta event per person per step. The pending id only lets the destination
 * page fire that single event. Browser pixel and CAPI share the id inside
 * trackEvent. A refresh or direct visit finds nothing pending and does not fire.
 */
const LEAD_EVENT_ID_KEY = 'sneakit-lead-event-id';
const BOOKING_CONVERSION_KEY = 'sneakit-booking-conversion';

export interface PendingBookingConversion {
  eventName: BookingConversionEvent;
  eventId: string;
}

function safeGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** True only when a later page read will see this exact value. */
function safeSet(key: string, value: string): boolean {
  try {
    sessionStorage.setItem(key, value);
    if (sessionStorage.getItem(key) === value) return true;
  } catch {
    /* fall through and clear a partial write */
  }
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore storage failures */
  }
  return false;
}

function safeRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore storage failures */
  }
}

/** Applicant contact info captured at form submit, used for advanced matching. */
export function getStoredApplicantUserData(): PixelUserData | undefined {
  const raw = safeGet(APPLICATION_FORM_STORAGE_KEY);
  if (!raw) return undefined;

  try {
    const data = JSON.parse(raw) as ApplicationFormData;
    if (isFinancialDisqualification(data)) return undefined;
    const [firstName, ...restName] = (data.name ?? '').trim().split(/\s+/);
    return {
      email: data.email,
      phone: data.phone,
      firstName: firstName || undefined,
      lastName: restName.join(' ') || undefined,
    };
  } catch {
    return undefined;
  }
}

/** True when stored application is a cannot-invest DQ. */
export function storedApplicantIsFinancialDq(): boolean {
  const raw = safeGet(APPLICATION_FORM_STORAGE_KEY);
  if (!raw) return false;
  try {
    return isFinancialDisqualification(JSON.parse(raw) as ApplicationFormData);
  } catch {
    return false;
  }
}

/**
 * Stores the one Lead id for the booking page.
 * Returns false when storage did not keep it. Caller must fire Lead itself.
 */
export function beginLeadTracking(): boolean {
  const eventId = generateEventId();
  return safeSet(LEAD_EVENT_ID_KEY, eventId);
}

/** Returns and clears the pending Lead event id (fired on the /booking landing). */
export function consumePendingLeadEventId(): string | null {
  const eventId = safeGet(LEAD_EVENT_ID_KEY);
  if (eventId) safeRemove(LEAD_EVENT_ID_KEY);
  return eventId;
}

/**
 * Stores the one booking conversion for the post-booking page.
 * Returns false when storage did not keep it. Caller must fire the event itself.
 */
export function beginBookingConversion(eventName: BookingConversionEvent): boolean {
  const eventId = generateEventId();
  return safeSet(
    BOOKING_CONVERSION_KEY,
    JSON.stringify({ eventName, eventId } satisfies PendingBookingConversion)
  );
}

/** Returns and clears the pending booking conversion. Refresh / direct visit returns null. */
export function consumePendingBookingConversion(): PendingBookingConversion | null {
  const raw = safeGet(BOOKING_CONVERSION_KEY);
  if (!raw) return null;
  safeRemove(BOOKING_CONVERSION_KEY);
  try {
    const parsed = JSON.parse(raw) as PendingBookingConversion;
    if (
      (parsed.eventName === 'Schedule' || parsed.eventName === 'CompleteRegistration') &&
      typeof parsed.eventId === 'string' &&
      parsed.eventId
    ) {
      return parsed;
    }
  } catch {
    /* drop corrupt payload */
  }
  return null;
}
