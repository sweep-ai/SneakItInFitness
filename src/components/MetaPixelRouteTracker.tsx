import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/metaPixel';

/**
 * index.html only initializes the pixel; every PageView (including the first)
 * is sent from here so it carries a shared event_id and deduplicates against
 * the server-side Conversions API event.
 */
export function MetaPixelRouteTracker() {
  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;

    if (previousPathRef.current === path) return;

    previousPathRef.current = path;
    trackPageView();
  }, [location.pathname, location.search]);

  return null;
}
