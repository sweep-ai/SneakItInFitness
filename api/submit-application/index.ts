import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleSubmitApplicationRequest } from './handler.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleSubmitApplicationRequest(req, res);
}
