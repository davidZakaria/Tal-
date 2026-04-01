/**
 * Safe in-app path for post–guest-login redirect (open redirect protection).
 */
export function sanitizeReturnPath(path: string | null | undefined): string | null {
  if (path == null || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (/[\s\\]/.test(trimmed) || /javascript:/i.test(trimmed)) return null;
  return trimmed;
}

export function guestSignInUrl(returnPath: string): string {
  const safe = sanitizeReturnPath(returnPath);
  if (!safe) return "/portal";
  return `/portal?returnTo=${encodeURIComponent(safe)}`;
}

/** API said the user must use a guest account or re-authenticate as guest */
export function shouldRedirectGuestToSignIn(
  res: Response,
  data: { message?: string }
): boolean {
  const msg = (data?.message || "").toLowerCase();
  if (res.status === 403 && msg.includes("guest account required")) return true;
  if (
    res.status === 401 &&
    (msg.includes("not authorized") ||
      msg.includes("token") ||
      msg.includes("no token"))
  ) {
    return true;
  }
  return false;
}
