const UTM_STORAGE_KEY = 'sneakit-utm';

export const UTM_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
] as const;

export type UtmParamKey = (typeof UTM_PARAM_KEYS)[number];

export type UtmParams = Partial<Record<UtmParamKey, string>>;

function safeGet(): UtmParams {
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UtmParams;
  } catch {
    return {};
  }
}

function safeSet(params: UtmParams): void {
  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Reads UTM params from the current URL (if present) and persists for the session.
 * Last-touch: a new ad click overwrites stored values.
 */
export function captureUtmFromUrl(search: string = window.location.search): UtmParams {
  const fromUrl: UtmParams = {};
  const params = new URLSearchParams(search);

  for (const key of UTM_PARAM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) {
      fromUrl[key] = value;
    }
  }

  if (Object.keys(fromUrl).length === 0) {
    return safeGet();
  }

  const lastTouch: UtmParams = { ...safeGet(), ...fromUrl };
  safeSet(lastTouch);
  return lastTouch;
}

/** Returns stored UTM params for the current session (empty if none). */
export function getStoredUtmParams(): UtmParams {
  return safeGet();
}
