import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackSchedule } from '../lib/metaPixel';
import './CalendlyEmbed.css';

const CALENDLY_URL =
  'https://calendly.com/swolekol/1-on-1-strategy-call-clone?hide_gdpr_banner=1&background_color=000000&text_color=ffffff&primary_color=d70000';

const EMBED_SCRIPT_ID = 'calendly-widget-script';
const EMBED_SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js';

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

function isCalendlyMessage(event: MessageEvent): boolean {
  return (
    event.origin === 'https://calendly.com' &&
    typeof event.data === 'object' &&
    event.data !== null &&
    'event' in event.data &&
    typeof (event.data as { event: string }).event === 'string' &&
    (event.data as { event: string }).event.startsWith('calendly.')
  );
}

function loadCalendlyScript(onReady: () => void) {
  if (window.Calendly) {
    onReady();
    return;
  }

  const existing = document.getElementById(EMBED_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    existing.addEventListener('load', onReady, { once: true });
    return;
  }

  const script = document.createElement('script');
  script.id = EMBED_SCRIPT_ID;
  script.src = EMBED_SCRIPT_SRC;
  script.async = true;
  script.onload = onReady;
  document.body.appendChild(script);
}

export function CalendlyEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetInitializedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCalendlyMessage = (event: MessageEvent) => {
      if (!isCalendlyMessage(event)) return;

      if (event.data.event === 'calendly.event_scheduled') {
        trackSchedule();
        navigate('/post-booking', { replace: true });
      }
    };

    window.addEventListener('message', handleCalendlyMessage);

    const initWidget = () => {
      const container = containerRef.current;
      if (!container || widgetInitializedRef.current || !window.Calendly) return;

      widgetInitializedRef.current = true;
      container.innerHTML = '';
      window.Calendly.initInlineWidget({
        url: CALENDLY_URL,
        parentElement: container,
      });
    };

    loadCalendlyScript(initWidget);

    return () => {
      window.removeEventListener('message', handleCalendlyMessage);
      widgetInitializedRef.current = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [navigate]);

  return (
    <div
      ref={containerRef}
      className="calendly-embed"
      data-url={CALENDLY_URL}
      aria-label="Schedule your strategy call"
    />
  );
}
