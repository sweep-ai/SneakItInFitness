import type { IncomingMessage, ServerResponse } from 'node:http';
import { isGhlConfigured, shouldCreateGhlContact, shouldForwardToGoogleSheet, shouldForwardToZapier, upsertApplicationContact, type ApplicationWebhookPayload } from './ghl.js';
import { formatLeadsTabRow } from './sheetLead.js';

async function readRequestBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks).toString();
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function forwardJsonWebhook(webhookUrl: string, body: string, label: string): Promise<void> {
  const isAppsScript = webhookUrl.includes('script.google.com');
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    redirect: isAppsScript ? 'manual' : 'follow',
  });

  const ok =
    response.ok ||
    (isAppsScript && (response.status === 302 || response.status === 303));
  if (!ok) {
    throw new Error(`${label} request failed (${response.status})`);
  }
}

/** Shared handler for `/api/submit-application`. */
export async function handleSubmitApplicationRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const webhook = process.env.ZAPIER_WEBHOOK?.trim();
  const sheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK?.trim();
  const ghlEnabled = isGhlConfigured();

  if (!webhook && !ghlEnabled && !sheetWebhook) {
    sendJson(res, 500, {
      error: 'No submission destination configured (ZAPIER_WEBHOOK, GOOGLE_SHEET_WEBHOOK, or GHL credentials)',
    });
    return;
  }

  let rawBody = '';
  try {
    rawBody = await readRequestBody(req);
  } catch {
    sendJson(res, 400, { error: 'Unable to read request body' });
    return;
  }

  let payload: ApplicationWebhookPayload;
  try {
    payload = rawBody ? (JSON.parse(rawBody) as ApplicationWebhookPayload) : ({} as ApplicationWebhookPayload);
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body' });
    return;
  }

  if (!payload.email?.trim() && !payload.phone?.trim()) {
    sendJson(res, 400, { error: 'email or phone is required' });
    return;
  }

  const tasks: Array<Promise<void>> = [];

  if (webhook && shouldForwardToZapier(payload)) {
    tasks.push(forwardJsonWebhook(webhook, rawBody, 'Zapier'));
  }

  if (sheetWebhook && shouldForwardToGoogleSheet(payload)) {
    tasks.push(
      forwardJsonWebhook(
        sheetWebhook,
        JSON.stringify({ values: formatLeadsTabRow(payload) }),
        'Google Sheet',
      ),
    );
  }

  if (ghlEnabled && shouldCreateGhlContact(payload)) {
    tasks.push(upsertApplicationContact(payload).then(() => undefined));
  }

  try {
    await Promise.all(tasks);
    sendJson(res, 200, { success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Submission failed';
    console.error('[submit-application]', message);
    sendJson(res, 502, { error: 'Submission failed' });
  }
}
