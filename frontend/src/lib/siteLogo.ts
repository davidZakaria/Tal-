/**
 * Public logo URL (served from `frontend/public/` next to `package.json`).
 *
 * - Default: `logo.png` (your full brand mark in `public/`). Fallback: `logo.svg` (wordmark only).
 * - Use a path **without** query strings so the dev server always resolves `public/` files reliably.
 * - After replacing an asset, change `NEXT_PUBLIC_LOGO_VERSION` (optional) or rename the file to bust caches.
 */
export function siteLogoSrc(): string {
  const file = (process.env.NEXT_PUBLIC_LOGO_FILE || "logo.png").replace(/^\/+/, "");
  return `/${file}`;
}
