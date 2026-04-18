import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"] as const,
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];
