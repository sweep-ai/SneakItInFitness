import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleCalendlyWebhookRequest } from './handler.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleCalendlyWebhookRequest(req, res);
}
