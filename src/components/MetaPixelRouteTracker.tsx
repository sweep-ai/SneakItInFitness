import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/metaPixel';

/**
 * SPA route changes do not reload index.html, so PageView must be sent again
 * on each navigation. The first PageView is fired by the base snippet in index.html.
 */
export function MetaPixelRouteTracker() {
  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;

    if (previousPathRef.current === null) {
      previousPathRef.current = path;
      return;
    }

    if (previousPathRef.current === path) return;

    previousPathRef.current = path;
    trackPageView();
  }, [location.pathname, location.search]);

  return null;
}
