/**
 * Helpers for admin-authenticated API calls.
 *
 * Centralises the bearer-token pattern used across the admin console so a
 * single place can react to expired / rejected tokens (401 / 403) by clearing
 * the stored credential and bouncing the user back to the AdminShell login
 * screen, instead of leaving the UI in a half-rendered, error-spewing state.
 */

export const ADMIN_TOKEN_KEY = "adminToken";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function adminAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Clear any admin credential and reload the current page. AdminShell re-reads
 * `adminToken` from storage on mount, so a reload restores the login screen
 * without the rest of the tree retaining stale state.
 */
export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.location.reload();
}

/**
 * Treat a 401 / 403 response as an invalidated session: wipe the token and
 * reload. Returns `true` when the response was actually a rejection, so the
 * caller can bail out of any further processing.
 */
export function handleAdminAuthFailure(res: Response): boolean {
  if (res.status === 401 || res.status === 403) {
    clearAdminSession();
    return true;
  }
  return false;
}

export class AdminSessionInvalidError extends Error {
  constructor() {
    super("admin_session_invalid");
    this.name = "AdminSessionInvalidError";
  }
}

/**
 * Fetch wrapper that attaches the admin bearer token and transparently
 * triggers `clearAdminSession()` on 401 / 403. Non-auth errors are surfaced
 * to the caller via the returned `Response` so existing page-level error
 * handling still applies.
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAdminToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(input, { ...init, headers });
  if (handleAdminAuthFailure(res)) {
    throw new AdminSessionInvalidError();
  }
  return res;
}
