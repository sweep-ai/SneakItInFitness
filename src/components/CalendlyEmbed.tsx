import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackSchedule } from '../lib/metaPixel';
import { beginScheduleTracking, getStoredApplicantUserData } from '../lib/conversionTracking';
import {
  CALENDLY_EMBED_SCRIPT_ID,
  CALENDLY_EMBED_SCRIPT_SRC,
  CALENDLY_EVENT_URL,
  getCalendlyEmbedUrl,
  getCalendlyPrefillFromStorage,
  warmCalendlyAssets,
} from '../lib/calendly';
import './CalendlyEmbed.css';

/** If Calendly hasn't painted by then, surface an escape hatch. */
const SLOW_LOAD_FALLBACK_MS = 7000;

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: {
          name?: string;
          email?: string;
          firstName?: string;
          lastName?: string;
        };
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
  let settled = false;
  const ready = () => {
    if (settled || !window.Calendly) return;
    settled = true;
    onReady();
  };

  if (window.Calendly) {
    ready();
    return;
  }

  const existing = document.getElementById(CALENDLY_EMBED_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    existing.addEventListener('load', ready, { once: true });
    // Warm prefetch may have finished before this listener was attached.
    if (existing.dataset.loaded === '1' || window.Calendly) {
      ready();
    }
    return;
  }

  const script = document.createElement('script');
  script.id = CALENDLY_EMBED_SCRIPT_ID;
  script.src = CALENDLY_EMBED_SCRIPT_SRC;
  script.async = true;
  script.onload = () => {
    script.dataset.loaded = '1';
    ready();
  };
  document.body.appendChild(script);
}

export function CalendlyEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetInitializedRef = useRef(false);
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    warmCalendlyAssets();

    const slowTimer = window.setTimeout(() => {
      setShowFallback(true);
    }, SLOW_LOAD_FALLBACK_MS);

    const handleCalendlyMessage = (event: MessageEvent) => {
      if (!isCalendlyMessage(event)) return;

      const calendlyEvent = (event.data as { event: string }).event;

      // First paint of the event type UI — hide skeleton.
      if (
        calendlyEvent === 'calendly.event_type_viewed' ||
        calendlyEvent === 'calendly.date_and_time_selected' ||
        calendlyEvent === 'calendly.event_scheduled'
      ) {
        setIsReady(true);
        setShowFallback(false);
        window.clearTimeout(slowTimer);
      }

      if (calendlyEvent === 'calendly.event_scheduled') {
        // Same event_id is reused on the /post-booking landing so the two fires dedupe.
        const scheduleEventId = beginScheduleTracking();
        trackSchedule(getStoredApplicantUserData(), scheduleEventId);
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
        url: getCalendlyEmbedUrl(),
        parentElement: container,
        prefill: getCalendlyPrefillFromStorage(),
      });
    };

    loadCalendlyScript(initWidget);

    return () => {
      window.removeEventListener('message', handleCalendlyMessage);
      window.clearTimeout(slowTimer);
      widgetInitializedRef.current = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [navigate]);

  return (
    <div className="calendly-embed-shell">
      <div
        className={`calendly-embed${isReady ? ' calendly-embed--ready' : ''}`}
        aria-busy={!isReady}
        aria-label="Schedule your strategy call"
      >
        {!isReady && (
          <div className="calendly-embed-skeleton" aria-hidden="true">
            <div className="calendly-embed-skeleton-pulse" />
            <p className="calendly-embed-skeleton-label">Loading available times…</p>
          </div>
        )}
        <div ref={containerRef} className="calendly-embed-frame" data-url={getCalendlyEmbedUrl()} />
      </div>

      {showFallback && !isReady && (
        <p className="calendly-embed-fallback">
          Taking a while?{' '}
          <a href={CALENDLY_EVENT_URL} target="_blank" rel="noopener noreferrer">
            Open the calendar in a new tab
          </a>
        </p>
      )}
    </div>
  );
}
