import { APPLICATION_FORM_STORAGE_KEY } from '../data/applicationForm';
import { generateEventId, type PixelUserData } from './metaPixel';

/**
 * A conversion (Lead / Schedule) is fired at the moment it happens AND again
 * when the visitor lands on the destination page. Both fires share one event_id
 * — persisted here between the two page views — so Meta deduplicates them into a
 * single conversion. The landing-page fire is the reliable one, since the
 * action-time browser event can be interrupted by the route change.
 */
const LEAD_EVENT_ID_KEY = 'sneakit-lead-event-id';
const SCHEDULE_EVENT_ID_KEY = 'sneakit-schedule-event-id';

function safeGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore storage failures */
  }
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
    const data = JSON.parse(raw) as { name?: string; email?: string; phone?: string };
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

/** Generates + stores a Lead event id, so the /booking landing can dedupe. */
export function beginLeadTracking(): string {
  const eventId = generateEventId();
  safeSet(LEAD_EVENT_ID_KEY, eventId);
  return eventId;
}

/** Returns and clears the pending Lead event id (fired on the /booking landing). */
export function consumePendingLeadEventId(): string | null {
  const eventId = safeGet(LEAD_EVENT_ID_KEY);
  if (eventId) safeRemove(LEAD_EVENT_ID_KEY);
  return eventId;
}

/** Generates + stores a Schedule event id, so the /post-booking landing can dedupe. */
export function beginScheduleTracking(): string {
  const eventId = generateEventId();
  safeSet(SCHEDULE_EVENT_ID_KEY, eventId);
  return eventId;
}

/** Returns and clears the pending Schedule event id (fired on the /post-booking landing). */
export function consumePendingScheduleEventId(): string | null {
  const eventId = safeGet(SCHEDULE_EVENT_ID_KEY);
  if (eventId) safeRemove(SCHEDULE_EVENT_ID_KEY);
  return eventId;
}
