import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Amiri, IBM_Plex_Sans_Arabic } from "next/font/google";
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

// Playfair Display is loaded via the Google Fonts <link> below instead of
// next/font. next/font would self-host a separate Playfair .woff2 even though
// our titles CSS pins them to the literal family name "Playfair Display"
// (which the CDN provides), so self-hosting was shipping an unused second copy.
// The CDN file is widely cached across the web and preconnected here.

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
      ? `${inter.variable} ${amiri.variable} ${ibmPlexArabic.variable}`
      : inter.variable;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${fontVars} antialiased overflow-x-hidden min-w-0`}
        suppressHydrationWarning
      >
        {/* Playfair Display via Google Fonts CDN. React 19 auto-hoists
            <link rel="stylesheet"> to <head>, so rendering here is equivalent
            to putting it in <head>. An explicit <head> child of <html> is
            stripped by the Next.js App Router. display=swap prevents FOIT. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
        />
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
