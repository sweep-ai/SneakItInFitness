import { APPLICATION_FORM_STORAGE_KEY } from '../data/applicationForm';

/** Base Calendly event URL (no query params). */
export const CALENDLY_EVENT_URL =
  'https://calendly.com/d/dv5r-hq7-g2w/1-on-1-fitness-strategy-call';

export const CALENDLY_EMBED_SCRIPT_ID = 'calendly-widget-script';
export const CALENDLY_EMBED_SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js';

const WARM_FLAG = 'data-calendly-warmed';

export interface CalendlyPrefill {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

/** Embed URL with branding/UX params that reduce chrome and friction. */
export function getCalendlyEmbedUrl(): string {
  const url = new URL(CALENDLY_EVENT_URL);
  url.searchParams.set('hide_gdpr_banner', '1');
  url.searchParams.set('hide_event_type_details', '1');
  url.searchParams.set('hide_landing_page_details', '1');
  url.searchParams.set('background_color', '000000');
  url.searchParams.set('text_color', 'ffffff');
  url.searchParams.set('primary_color', 'd70000');
  return url.toString();
}

/** Prefill from the quiz payload stored in sessionStorage. */
export function getCalendlyPrefillFromStorage(): CalendlyPrefill | undefined {
  try {
    const raw = sessionStorage.getItem(APPLICATION_FORM_STORAGE_KEY);
    if (!raw) return undefined;

    const data = JSON.parse(raw) as { name?: string; email?: string };
    const name = data.name?.trim();
    const email = data.email?.trim();
    if (!name && !email) return undefined;

    const [firstName, ...restName] = (name ?? '').split(/\s+/);
    return {
      name: name || undefined,
      email: email || undefined,
      firstName: firstName || undefined,
      lastName: restName.join(' ') || undefined,
    };
  } catch {
    return undefined;
  }
}

function ensureHeadLink(rel: string, href: string, extra?: Record<string, string>) {
  const selector = `link[rel="${rel}"][href="${href}"]`;
  if (document.head.querySelector(selector)) return;

  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      link.setAttribute(key, value);
    }
  }
  document.head.appendChild(link);
}

/**
 * Warms Calendly network + widget.js before /booking.
 * Safe to call multiple times (idempotent).
 */
export function warmCalendlyAssets(): void {
  if (typeof document === 'undefined') return;
  if (document.documentElement.getAttribute(WARM_FLAG) === '1') return;
  document.documentElement.setAttribute(WARM_FLAG, '1');

  ensureHeadLink('dns-prefetch', 'https://calendly.com');
  ensureHeadLink('dns-prefetch', 'https://assets.calendly.com');
  ensureHeadLink('preconnect', 'https://calendly.com', { crossorigin: '' });
  ensureHeadLink('preconnect', 'https://assets.calendly.com', { crossorigin: '' });
  ensureHeadLink('preload', CALENDLY_EMBED_SCRIPT_SRC, { as: 'script' });

  // Start downloading the widget script early without initializing the iframe yet.
  const calendlyAlreadyPresent =
    typeof window !== 'undefined' &&
    'Calendly' in window &&
    Boolean((window as Window & { Calendly?: unknown }).Calendly);

  if (!document.getElementById(CALENDLY_EMBED_SCRIPT_ID) && !calendlyAlreadyPresent) {
    const script = document.createElement('script');
    script.id = CALENDLY_EMBED_SCRIPT_ID;
    script.src = CALENDLY_EMBED_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = '1';
    };
    document.body.appendChild(script);
  }
}
