import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://talehotel.com";

const STATIC_PATHS = [
  { path: "", priority: 1.0, changeFrequency: "weekly" as const },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return STATIC_PATHS.flatMap(({ path, priority, changeFrequency }) =>
    routing.locales.map((locale) => {
      const url = `${SITE_URL}/${locale}${path ? `/${path}` : ""}`;
      const languages = Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_URL}/${l}${path ? `/${path}` : ""}`]),
      );
      return {
        url,
        lastModified: now,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            ...languages,
            "x-default": `${SITE_URL}/${routing.defaultLocale}${path ? `/${path}` : ""}`,
          },
        },
      };
    }),
  );
}
