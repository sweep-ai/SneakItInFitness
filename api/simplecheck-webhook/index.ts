import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleSimpleCheckWebhookRequest } from './handler.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleSimpleCheckWebhookRequest(req, res);
}
