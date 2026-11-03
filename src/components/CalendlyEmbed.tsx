import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackCompleteRegistration, trackSchedule } from '../lib/metaPixel';
import { beginBookingConversion, getStoredApplicantUserData } from '../lib/conversionTracking';
import { bookingConversionEvent, useFunnelPaths } from '../lib/funnelPaths';
import {
  CALENDLY_EMBED_SCRIPT_ID,
  CALENDLY_EMBED_SCRIPT_SRC,
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
          customAnswers?: { a1?: string };
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
  const paths = useFunnelPaths();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetInitializedRef = useRef(false);
  const bookedRef = useRef(false);
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
        // Calendly can emit this twice. The first one owns the conversion.
        if (bookedRef.current) return;
        bookedRef.current = true;
        const conversion = bookingConversionEvent(paths.variant);
        if (!beginBookingConversion(conversion)) {
          const userData = getStoredApplicantUserData();
          if (conversion === 'Schedule') trackSchedule(userData);
          else trackCompleteRegistration(userData);
        }
        navigate(paths.postBooking, { replace: true });
      }
    };

    window.addEventListener('message', handleCalendlyMessage);

    const initWidget = () => {
      const container = containerRef.current;
      if (!container || widgetInitializedRef.current || !window.Calendly) return;

      widgetInitializedRef.current = true;
      container.innerHTML = '';
      const prefill = getCalendlyPrefillFromStorage();
      window.Calendly.initInlineWidget({
        url: getCalendlyEmbedUrl(prefill),
        parentElement: container,
        prefill,
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
  }, [navigate, paths.postBooking, paths.variant]);

  const prefill = getCalendlyPrefillFromStorage();
  const embedUrl = getCalendlyEmbedUrl(prefill);

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
        <div ref={containerRef} className="calendly-embed-frame" data-url={embedUrl} />
      </div>

      {showFallback && !isReady && (
        <p className="calendly-embed-fallback">
          Taking a while?{' '}
          <a href={embedUrl} target="_blank" rel="noopener noreferrer">
            Open the calendar in a new tab
          </a>
        </p>
      )}
    </div>
  );
}
