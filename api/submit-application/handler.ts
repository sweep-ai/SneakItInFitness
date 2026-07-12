import type { IncomingMessage, ServerResponse } from 'node:http';
import { isGhlConfigured, upsertApplicationContact, type ApplicationWebhookPayload } from './ghl.js';

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

async function forwardToZapier(webhookUrl: string, body: string): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!response.ok) {
    throw new Error(`Zapier request failed (${response.status})`);
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
  const ghlEnabled = isGhlConfigured();

  if (!webhook && !ghlEnabled) {
    sendJson(res, 500, {
      error: 'No submission destination configured (ZAPIER_WEBHOOK or GHL credentials)',
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

  if (webhook) {
    tasks.push(forwardToZapier(webhook, rawBody));
  }

  if (ghlEnabled) {
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
