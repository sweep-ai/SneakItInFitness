import { parsePhoneNumberFromString } from 'libphonenumber-js';

export interface ApplicationChoiceAnswer {
  prompt: string;
  code: string;
  label: string;
}

export interface ApplicationWebhookPayload {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  isJewish: string;
  occupation: string;
  age: string;
  situation: ApplicationChoiceAnswer;
  goal: ApplicationChoiceAnswer;
  readiness: ApplicationChoiceAnswer;
  leadStatus: 'qualified' | 'disqualified';
  dqReason: string | null;
  submittedAt: string;
  source: string;
  answers: {
    isJewish: string;
    situationPrompt: string;
    situationCode: string;
    situation: string;
    goalPrompt: string;
    goalCode: string;
    goal: string;
    readinessPrompt: string;
    readinessCode: string;
    readiness: string;
    occupation: string;
    age: string;
  };
}

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

interface GhlRequestOptions {
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  body?: unknown;
}

interface GhlUpsertResponse {
  contact?: {
    id?: string;
  };
}

function getGhlConfig(): { token: string; locationId: string } {
  const token = process.env.GHL_INTEGRATION_TOKEN?.trim();
  const locationId = process.env.GHL_LOCATION_ID?.trim();

  if (!token) {
    throw new Error('GHL_INTEGRATION_TOKEN is not configured');
  }

  if (!locationId) {
    throw new Error('GHL_LOCATION_ID is not configured');
  }

  return { token, locationId };
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: 'Applicant', lastName: '' };
  }

  const parts = trimmed.split(/\s+/);
  const firstName = parts[0] ?? trimmed;
  const lastName = parts.slice(1).join(' ');

  return { firstName, lastName };
}

/** Normalizes phone numbers to E.164 when possible for GHL matching. */
export function formatPhoneForGhl(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return trimmed;

  const parsed = parsePhoneNumberFromString(trimmed, 'US');
  if (parsed?.number) {
    return parsed.number;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;

  if (trimmed.startsWith('+')) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

function normalizeSocialProfile(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const handle = trimmed.replace(/^@/, '');
  if (!handle) return undefined;

  if (/facebook\.com/i.test(handle) || /^fb\.me\//i.test(handle)) {
    return `https://${handle.replace(/^\/+/, '')}`;
  }

  if (/instagram\.com/i.test(handle)) {
    return `https://${handle.replace(/^\/+/, '')}`;
  }

  return `https://instagram.com/${handle}`;
}

export function buildGhlContactPayload(
  payload: ApplicationWebhookPayload,
  locationId: string
): Record<string, unknown> {
  const { firstName, lastName } = splitName(payload.name);
  const phone = formatPhoneForGhl(payload.phone);
  const socialUrl = normalizeSocialProfile(payload.instagram);

  const tags = [
    'SneakIt Application',
    payload.leadStatus === 'qualified' ? 'Qualified Lead' : 'Disqualified Lead',
    `Jewish ${payload.isJewish}`,
    `Situation ${payload.situation.code}`,
    `Goal ${payload.goal.code}`,
    `Readiness ${payload.readiness.code}`,
    ...(payload.age.trim() ? [`Age ${payload.age.trim()}`] : []),
  ];

  return {
    locationId,
    firstName,
    lastName: lastName || undefined,
    email: payload.email.trim(),
    phone,
    companyName: payload.occupation.trim() || undefined,
    website: socialUrl,
    source: payload.source,
    tags,
  };
}

async function ghlRequest<T>(options: GhlRequestOptions): Promise<T> {
  const { token } = getGhlConfig();
  const url = `${GHL_API_BASE}${options.path}`;

  const response = await fetch(url, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Version: GHL_API_VERSION,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`GHL API ${options.method} ${options.path} failed (${response.status}): ${detail}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

/** Creates or updates a GHL contact from a quiz submission. */
export async function upsertApplicationContact(payload: ApplicationWebhookPayload): Promise<string> {
  const { locationId } = getGhlConfig();
  const contactPayload = buildGhlContactPayload(payload, locationId);

  const result = await ghlRequest<GhlUpsertResponse>({
    method: 'POST',
    path: '/contacts/upsert',
    body: contactPayload,
  });

  const contactId = result.contact?.id;
  if (!contactId) {
    throw new Error('GHL upsert succeeded but no contact id was returned');
  }

  return contactId;
}

export function isGhlConfigured(): boolean {
  return Boolean(process.env.GHL_INTEGRATION_TOKEN?.trim() && process.env.GHL_LOCATION_ID?.trim());
}
