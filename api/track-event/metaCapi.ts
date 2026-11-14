import { createHash } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { facebookClickIdFromUrl } from '../../src/lib/facebookClickId.js';

/** Graph API version used for Conversions API requests. */
const GRAPH_API_VERSION = 'v21.0';

/** Browser pixel and this endpoint must use the same names so event_id can dedupe. */
export const CAPI_EVENT_NAMES = ['PageView', 'Lead', 'Schedule', 'CompleteRegistration'] as const;

const ALLOWED_CAPI_EVENTS = new Set<string>(CAPI_EVENT_NAMES);

/**
 * Meta dataset (Pixel) ID. Must match the `fbq('init', ...)` id in index.html
 * so browser and server events are attributed to the same dataset.
 */
export const META_DATASET_ID = '1880087192677392';

/** Training dataset. Same event_id, only for /schedule page URLs. */
export const META_DATASET_ID_TRAINING = '3091081311239345';

/** True for /schedule and /schedule/* event_source_url values. */
export function isScheduleEventSource(eventSourceUrl: string | undefined): boolean {
  if (!eventSourceUrl) return false;
  try {
    const path = new URL(eventSourceUrl).pathname;
    return path === '/schedule' || path.startsWith('/schedule/');
  } catch {
    return false;
  }
}

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

/** Sends a single server event to one Meta dataset. Throws on failure. */
export async function sendConversionsApiEvent(
  input: CapiEventInput & { datasetId?: string; accessToken?: string }
): Promise<void> {
  const accessToken = input.accessToken ?? process.env.META_CAPI_ACCESS_TOKEN;
  const datasetId = input.datasetId ?? META_DATASET_ID;
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

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${datasetId}/events?access_token=${encodeURIComponent(
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

function headerText(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join(',');
  return value ?? '';
}

function isIpv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

function isPublicIpv4(ip: string): boolean {
  if (!isIpv4(ip)) return false;
  const [a, b] = ip.split('.').map(Number);
  if (a === 0 || a === 10 || a === 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  return true;
}

function isIpv6(ip: string): boolean {
  if (!ip.includes(':') || !/^[0-9a-f:]+$/i.test(ip)) return false;
  const halves = ip.split('::');
  if (halves.length > 2) return false;
  const groups = ip.split(':').filter((group) => group.length > 0);
  if (groups.some((group) => group.length > 4)) return false;
  return ip.includes('::') ? groups.length < 8 : groups.length === 8;
}

function isPublicIpv6(ip: string): boolean {
  if (!isIpv6(ip)) return false;
  const lower = ip.toLowerCase();
  if (lower === '::' || lower === '::1') return false;
  const head = Number.parseInt(lower.split(':')[0] || '0', 16);
  if (head >= 0xfe80 && head <= 0xfebf) return false;
  if (head >= 0xfc00 && head <= 0xfdff) return false;
  return true;
}

/** Strip brackets, zone ids, ports, and IPv4-mapped IPv6. Reject private addresses. */
export function normalizeClientIp(token: string): string | undefined {
  let value = token.trim().replace(/^"|"$/g, '');
  const bracketed = value.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (bracketed) value = bracketed[1];
  const zone = value.indexOf('%');
  if (zone !== -1) value = value.slice(0, zone);
  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(value)) {
    value = value.slice(0, value.lastIndexOf(':'));
  }
  const mapped = value.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (mapped) value = mapped[1];
  if (isPublicIpv6(value) || isPublicIpv4(value)) return value;
  return undefined;
}

/**
 * Meta matches the pixel's observed address. IPv6 wins when the request
 * carries one. Otherwise the first public IPv4. Never a private or server address.
 */
export function selectClientIp(rawValues: Array<string | undefined>): string | undefined {
  const ips = rawValues
    .flatMap((value) => (value ?? '').split(','))
    .map((token) => normalizeClientIp(token))
    .filter((ip): ip is string => Boolean(ip));
  return ips.find((ip) => ip.includes(':')) ?? ips[0];
}

/**
 * Browser-reported IPv6 wins. Vercel only observes IPv4.
 * A client-supplied IPv4 is ignored so the header stays the source for that case.
 */
export function preferredClientIp(
  reported: string | undefined,
  observed: string | undefined
): string | undefined {
  const fromBrowser = normalizeClientIp(reported ?? '');
  if (fromBrowser?.includes(':')) return fromBrowser;
  return observed;
}

function forwardedHeaderIps(header: string): string[] {
  const ips: string[] = [];
  const pattern = /for=\s*"?(\[[^\]]+\]|[^;,\s"]+)/gi;
  for (const match of header.matchAll(pattern)) {
    ips.push(match[1]);
  }
  return ips;
}

/**
 * Derives the request-scoped fields Meta uses for matching: the visitor IP,
 * user agent, and the _fbp / _fbc cookies dropped by the browser pixel.
 * Called by handleTrackEventRequest in this file (PageView and conversions).
 */
export function getRequestUserContext(
  req: IncomingMessage
): Pick<CapiUserData, 'clientIpAddress' | 'clientUserAgent' | 'fbp' | 'fbc'> {
  const headers = req.headers;
  const clientIpAddress = selectClientIp([
    headerText(headers['x-vercel-forwarded-for']),
    headerText(headers['x-real-ip']),
    headerText(headers['x-forwarded-for']),
    ...forwardedHeaderIps(headerText(headers.forwarded)),
  ]);
  const clientUserAgent = headerText(headers['user-agent']) || undefined;
  const cookies = parseCookies(headerText(headers.cookie) || undefined);

  return {
    clientIpAddress,
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
    clientIpAddress?: string;
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

  if (!body.eventName || !ALLOWED_CAPI_EVENTS.has(body.eventName)) {
    sendJson(res, 400, { error: 'unsupported eventName' });
    return;
  }

  if (!body.eventId?.trim()) {
    sendJson(res, 400, { error: 'eventId is required for deduplication' });
    return;
  }

  const context = getRequestUserContext(req);
  const bodyUser = body.userData ?? {};
  const sendsTraining = isScheduleEventSource(body.eventSourceUrl);
  // Schedule pixel customer parameters: client_ip_address (unhashed) and fbc (click id).
  const clickId =
    bodyUser.fbc ||
    context.fbc ||
    (sendsTraining ? facebookClickIdFromUrl(body.eventSourceUrl) : undefined);

  const userData: CapiUserData = {
    email: bodyUser.email,
    phone: bodyUser.phone,
    firstName: bodyUser.firstName,
    lastName: bodyUser.lastName,
    clientIpAddress: preferredClientIp(bodyUser.clientIpAddress, context.clientIpAddress),
    clientUserAgent: context.clientUserAgent,
    fbp: bodyUser.fbp ?? context.fbp,
    fbc: clickId,
  };

  const eventInput = {
    eventName: body.eventName,
    eventId: body.eventId,
    eventSourceUrl: body.eventSourceUrl,
    userData,
    customData: body.customData,
  };
  const trainingToken =
    process.env.META_CAPI_TRAINING_ACCESS_TOKEN?.trim() || process.env.META_CAPI_ACCESS_TOKEN;

  if (sendsTraining) {
    // Old pixel is off on /schedule.
    // await sendConversionsApiEvent({ ...eventInput, datasetId: META_DATASET_ID });
    try {
      await sendConversionsApiEvent({
        ...eventInput,
        datasetId: META_DATASET_ID_TRAINING,
        accessToken: trainingToken,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'training pixel failed';
      console.error('[track-event] training pixel', message);
      sendJson(res, 502, { success: false, error: message });
      return;
    }
    sendJson(res, 200, { success: true });
    return;
  }

  try {
    await sendConversionsApiEvent({ ...eventInput, datasetId: META_DATASET_ID });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Conversions API request failed';
    console.error('[track-event]', message);
    sendJson(res, 502, { success: false, error: message });
    return;
  }

  sendJson(res, 200, { success: true });
}
