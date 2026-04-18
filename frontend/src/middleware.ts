import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Skip API, the guest portal, the admin console, Next internals,
    // Vercel internals, and files with an extension (images, fonts, etc.).
    // Everything else (site brochure, property detail, auth/success) gets
    // locale negotiated and rewritten under /[locale]/…
    "/((?!api|portal|admin|_next|_vercel|.*\\..*).*)",
  ],
};
