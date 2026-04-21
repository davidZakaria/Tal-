import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Playfair_Display, Amiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AppProviders from "@/providers/AppProviders";
import Footer from "@/components/Footer";
import { routing } from "@/i18n/routing";
import "../../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Self-host Playfair Display via next/font. This gives us:
//   1. `<link rel="preload">` for the font file automatically (critical for LCP)
//   2. A size-adjusted local fallback to minimize CLS during swap
//   3. Same-origin delivery — no cross-origin DNS/TLS handshake
//   4. Inlined @font-face CSS — no render-blocking external stylesheet
// globals.css references this via `var(--font-playfair)` in the title stack.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// Arabic fonts are only applied when the active locale is `ar` (see below), but
// next/font still extracts and subsets them at build time. Keeping them declared
// here (rather than in a conditional block) is required for next/font — it does
// not allow conditional initialization. Their CSS is only attached to <body>
// when the locale is Arabic, so Latin visitors don't get the font-face CSS.
const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-ar",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://talehotel.com";

export const viewport: Viewport = {
  themeColor: "#003b3a",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "seo" });

  const ogLocaleMap: Record<string, string> = { en: "en_US", ar: "ar_EG" };
  const alternateLocales = routing.locales.filter((l) => l !== locale).map((l) => ogLocaleMap[l]);

  const keywords = t.raw("homeKeywords") as string[];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("homeTitle"),
      template: `%s | ${t("siteName")}`,
    },
    description: t("homeDescription"),
    keywords,
    applicationName: t("siteName"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ar: "/ar",
        "x-default": "/en",
      },
    },
    openGraph: {
      title: t("homeTitle"),
      description: t("homeDescription"),
      url: `/${locale}`,
      siteName: t("siteName"),
      type: "website",
      locale: ogLocaleMap[locale],
      alternateLocale: alternateLocales,
    },
    twitter: {
      card: "summary_large_image",
      title: t("homeTitle"),
      description: t("homeDescription"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    other: {
      "content-language": locale,
    },
  };
}

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = locale === "ar" ? "rtl" : "ltr";

  // Arabic font variables are only attached for the `ar` locale to avoid
  // shipping that CSS + woff2 to Latin visitors.
  const fontVars =
    locale === "ar"
      ? `${inter.variable} ${playfair.variable} ${amiri.variable} ${ibmPlexArabic.variable}`
      : `${inter.variable} ${playfair.variable}`;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${fontVars} antialiased overflow-x-hidden min-w-0`}
        suppressHydrationWarning
      >
        {/* Note: the hero image preload is handled by next/image's `priority`
            prop (it emits a <link rel="preload"> pointing at the exact
            /_next/image optimized URL). Adding a manual preload here for the
            raw .webp would be a different URL and just double the bandwidth. */}
        <NextIntlClientProvider>
          <AppProviders>
            {children}
            <Footer />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
