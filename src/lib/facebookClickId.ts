/**
 * Meta click id (`fbc`) from the `fbclid` URL parameter.
 * Format: fb.1.{creationTimeMs}.{fbclid}
 * https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */
export function facebookClickIdFromFbclid(
  fbclid: string | null | undefined,
  creationTimeMs = Date.now(),
): string | undefined {
  const value = fbclid?.trim();
  if (!value) return undefined;
  if (value.startsWith('fb.')) return value;
  return `fb.1.${creationTimeMs}.${value}`;
}

export function facebookClickIdFromUrl(
  eventSourceUrl: string | undefined,
  creationTimeMs = Date.now(),
): string | undefined {
  if (!eventSourceUrl) return undefined;
  try {
    return facebookClickIdFromFbclid(new URL(eventSourceUrl).searchParams.get('fbclid'), creationTimeMs);
  } catch {
    return undefined;
  }
}

/** Same click when the stored fbc was built from this fbclid. */
export function fbcMatchesFbclid(fbc: string, fbclid: string): boolean {
  return fbc.endsWith(`.${fbclid}`);
}
