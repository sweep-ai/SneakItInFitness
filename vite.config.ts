import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

async function readRequestBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks).toString();
}

function submitApplicationApi(webhookUrl: string | undefined): Plugin {
  return {
    name: 'submit-application-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/api/submit-application' || req.method !== 'POST') {
          next();
          return;
        }

        const response = res as ServerResponse;

        if (!webhookUrl) {
          response.statusCode = 500;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({ error: 'ZAPIER_WEBHOOK is not configured' }));
          return;
        }

        try {
          const body = await readRequestBody(req);
          const zapierResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          });

          if (!zapierResponse.ok) {
            response.statusCode = 502;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ error: 'Zapier request failed' }));
            return;
          }

          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({ success: true }));
        } catch {
          response.statusCode = 500;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({ error: 'Submission failed' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), submitApplicationApi(env.ZAPIER_WEBHOOK)],
  };
});
