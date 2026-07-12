import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleTrackEventRequest } from './metaCapi.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleTrackEventRequest(req, res);
}
