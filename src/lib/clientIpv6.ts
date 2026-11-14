/** IPv6-only echo. A dual-stack echo can answer over IPv4 while Meta Pixel still sees IPv6. */
export const CLIENT_IPV6_ENDPOINT = 'https://api6.ipify.org';

const STORAGE_KEY = 'sneakit-ipv6';
const PROBE_MS = 1500;
const PAGEVIEW_WAIT_MS = 800;

function isPublicIpv6(ip: string): boolean {
  if (!ip.includes(':') || !/^[0-9a-f:]+$/i.test(ip)) return false;
  const halves = ip.split('::');
  if (halves.length > 2) return false;
  const groups = ip.split(':').filter((group) => group.length > 0);
  if (groups.some((group) => group.length > 4)) return false;
  if (ip.includes('::') ? groups.length >= 8 : groups.length !== 8) return false;
  const lower = ip.toLowerCase();
  if (lower === '::' || lower === '::1') return false;
  const head = Number.parseInt(lower.split(':')[0] || '0', 16);
  if (head >= 0xfe80 && head <= 0xfebf) return false;
  if (head >= 0xfc00 && head <= 0xfdff) return false;
  return true;
}

export function readClientIpv6(): string | undefined {
  if (typeof sessionStorage === 'undefined') return undefined;
  try {
    const value = sessionStorage.getItem(STORAGE_KEY)?.trim() ?? '';
    return isPublicIpv6(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

let pending: Promise<string | undefined> | null = null;

function probeClientIpv6(): Promise<string | undefined> {
  const cached = readClientIpv6();
  if (cached) return Promise.resolve(cached);
  if (pending) return pending;
  if (typeof fetch === 'undefined') return Promise.resolve(undefined);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_MS);
  pending = fetch(CLIENT_IPV6_ENDPOINT, { signal: controller.signal, cache: 'no-store' })
    .then((response) => (response.ok ? response.text() : ''))
    .then((text) => {
      const ip = text.trim();
      if (!isPublicIpv6(ip)) return undefined;
      try {
        sessionStorage.setItem(STORAGE_KEY, ip);
      } catch {
        /* The in-memory result still covers this page. */
      }
      return ip;
    })
    .catch(() => undefined)
    .finally(() => clearTimeout(timer));
  return pending;
}

/** Resolves the visitor IPv6, or undefined when the probe misses the deadline. */
export function clientIpv6(timeoutMs = PAGEVIEW_WAIT_MS): Promise<string | undefined> {
  const cached = readClientIpv6();
  if (cached) return Promise.resolve(cached);
  return Promise.race([
    probeClientIpv6(),
    new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), timeoutMs)),
  ]);
}
