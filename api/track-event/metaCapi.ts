import { createHash } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

/** Graph API version used for Conversions API requests. */
const GRAPH_API_VERSION = 'v21.0';

/**
 * Meta dataset (Pixel) ID. Must match the `fbq('init', ...)` id in index.html
 * so browser and server events are attributed to the same dataset.
 */
export const META_DATASET_ID = '1880087192677392';

/** SHA-256 hash of a normalized (trimmed, lowercased) value, per Meta spec. */
function hashNormalized(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return createHash('sha256').update(normalized).digest('hex');
}

/** Phone numbers are hashed as digits only (no punctuation, no leading +). */
function hashPhone(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return undefined;
  return createHash('sha256').update(digits).digest('hex');
}

export interface CapiUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  /** Meta browser id cookie (_fbp). */
  fbp?: string;
  /** Meta click id cookie (_fbc). */
  fbc?: string;
}

export interface CapiEventInput {
  eventName: string;
  /** Shared with the browser pixel event for deduplication. */
  eventId?: string;
  eventSourceUrl?: string;
  actionSource?: 'website' | 'system_generated';
  /** Unix seconds. Defaults to now. */
  eventTime?: number;
  userData?: CapiUserData;
  customData?: Record<string, unknown>;
}

function buildUserData(ud: CapiUserData): Record<string, unknown> {
  const userData: Record<string, unknown> = {};

  const em = hashNormalized(ud.email);
  const ph = hashPhone(ud.phone);
  const fn = hashNormalized(ud.firstName);
  const ln = hashNormalized(ud.lastName);

  if (em) userData.em = [em];
  if (ph) userData.ph = [ph];
  if (fn) userData.fn = [fn];
  if (ln) userData.ln = [ln];
  if (ud.clientIpAddress) userData.client_ip_address = ud.clientIpAddress;
  if (ud.clientUserAgent) userData.client_user_agent = ud.clientUserAgent;
  if (ud.fbp) userData.fbp = ud.fbp;
  if (ud.fbc) userData.fbc = ud.fbc;

  return userData;
}

/** Sends a single server event to the Meta Conversions API. Throws on failure. */
export async function sendConversionsApiEvent(input: CapiEventInput): Promise<void> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('META_CAPI_ACCESS_TOKEN is not configured');
  }

  const event: Record<string, unknown> = {
    event_name: input.eventName,
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    action_source: input.actionSource ?? 'website',
    user_data: buildUserData(input.userData ?? {}),
  };

  if (input.eventId) event.event_id = input.eventId;
  if (input.eventSourceUrl) event.event_source_url = input.eventSourceUrl;
  if (input.customData) event.custom_data = input.customData;

  const payload: Record<string, unknown> = { data: [event] };

  // Optional: set META_CAPI_TEST_EVENT_CODE to route events to Test Events tab.
  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;
  if (testEventCode) payload.test_event_code = testEventCode;

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_DATASET_ID}/events?access_token=${encodeURIComponent(
    accessToken
  )}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Conversions API responded with ${response.status}: ${detail}`);
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const index = part.indexOf('=');
    if (index === -1) return acc;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

/**
 * Derives the request-scoped fields Meta uses for matching: the visitor IP,
 * user agent, and the _fbp / _fbc cookies dropped by the browser pixel.
 */
export function getRequestUserContext(
  req: IncomingMessage
): Pick<CapiUserData, 'clientIpAddress' | 'clientUserAgent' | 'fbp' | 'fbc'> {
  const forwardedFor = (req.headers['x-forwarded-for'] as string | undefined) ?? '';
  const clientIpAddress =
    forwardedFor.split(',')[0]?.trim() || req.socket?.remoteAddress || undefined;
  const clientUserAgent = (req.headers['user-agent'] as string | undefined) ?? undefined;
  const cookies = parseCookies(req.headers.cookie);

  return {
    clientIpAddress: clientIpAddress || undefined,
    clientUserAgent,
    fbp: cookies['_fbp'],
    fbc: cookies['_fbc'],
  };
}

async function readRequestBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString();
}

interface TrackEventRequestBody {
  eventName?: string;
  eventId?: string;
  eventSourceUrl?: string;
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    fbp?: string;
    fbc?: string;
  };
  customData?: Record<string, unknown>;
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

/**
 * Shared handler for the `/api/track-event` endpoint, used by both the Vercel
 * serverless function and the Vite dev-server middleware.
 */
export async function handleTrackEventRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  let body: TrackEventRequestBody;
  try {
    const raw = await readRequestBody(req);
    body = raw ? (JSON.parse(raw) as TrackEventRequestBody) : {};
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body' });
    return;
  }

  if (!body.eventName) {
    sendJson(res, 400, { error: 'eventName is required' });
    return;
  }

  const context = getRequestUserContext(req);
  const bodyUser = body.userData ?? {};

  const userData: CapiUserData = {
    email: bodyUser.email,
    phone: bodyUser.phone,
    firstName: bodyUser.firstName,
    lastName: bodyUser.lastName,
    clientIpAddress: context.clientIpAddress,
    clientUserAgent: context.clientUserAgent,
    fbp: bodyUser.fbp ?? context.fbp,
    fbc: bodyUser.fbc ?? context.fbc,
  };

  try {
    await sendConversionsApiEvent({
      eventName: body.eventName,
      eventId: body.eventId,
      eventSourceUrl: body.eventSourceUrl,
      userData,
      customData: body.customData,
    });
    sendJson(res, 200, { success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Conversions API request failed';
    // Tracking failures must never surface to visitors; log for observability.
    console.error('[track-event]', message);
    sendJson(res, 502, { success: false, error: message });
  }
}
