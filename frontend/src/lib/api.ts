/**
 * Single source of truth for the backend base URL. Set NEXT_PUBLIC_API_URL in production.
 */
export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
}

/** Absolute URL for an API path (path must start with `/`, e.g. `/api/properties`). */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${p}`;
}
