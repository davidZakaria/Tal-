/**
 * Backend base URL for API calls.
 * - If `NEXT_PUBLIC_API_URL` is set: browser talks to that host directly (production / custom).
 * - Otherwise: same-origin paths like `/api/...` are proxied to the Express server (see `next.config.ts` rewrites).
 */
export function getApiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  return env ? env.replace(/\/$/, "") : "";
}

/** Human-readable target for error messages (never empty). */
export function describeApiBase(): string {
  const b = getApiBaseUrl();
  if (b) return b;
  return "same-origin /api (proxied to backend, default 127.0.0.1:5000)";
}

/** URL for an API path (path must start with `/`, e.g. `/api/properties`). */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${p}` : p;
}
