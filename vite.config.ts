import type { ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleTrackEventRequest } from './api/track-event/metaCapi.js';
import { handleSubmitApplicationRequest } from './api/submit-application/handler.js';

function submitApplicationApi(): Plugin {
  return {
    name: 'submit-application-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/api/submit-application' || req.method !== 'POST') {
          next();
          return;
        }

        void handleSubmitApplicationRequest(req, res as ServerResponse);
      });
    },
  };
}

function trackEventApi(): Plugin {
  return {
    name: 'track-event-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/api/track-event' || req.method !== 'POST') {
          next();
          return;
        }

        void handleTrackEventRequest(req, res as ServerResponse);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Expose env vars used by the dev-server middleware (loadEnv doesn't set process.env).
  process.env.META_CAPI_ACCESS_TOKEN = env.META_CAPI_ACCESS_TOKEN;
  process.env.ZAPIER_WEBHOOK = env.ZAPIER_WEBHOOK;
  process.env.GHL_INTEGRATION_TOKEN = env.GHL_INTEGRATION_TOKEN;
  process.env.GHL_LOCATION_ID = env.GHL_LOCATION_ID;
  if (env.META_CAPI_TEST_EVENT_CODE) {
    process.env.META_CAPI_TEST_EVENT_CODE = env.META_CAPI_TEST_EVENT_CODE;
  }

  return {
    plugins: [react(), submitApplicationApi(), trackEventApi()],
  };
});
