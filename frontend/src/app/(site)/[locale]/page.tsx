import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import HomeClient from "@/components/brochure/HomeClient";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://talehotel.com";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "seo" });
  const tHotel = await getTranslations({ locale, namespace: "seo.hotel" });

  const hotelJsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: t("siteName"),
    description: tHotel("description"),
    url: `${SITE_URL}/${locale}`,
    image: `${SITE_URL}/og-image.jpg`,
    priceRange: tHotel("priceRange"),
    starRating: {
      "@type": "Rating",
      ratingValue: "5",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: tHotel("addressLocality"),
      addressRegion: tHotel("addressRegion"),
      addressCountry: tHotel("addressCountry"),
    },
    amenityFeature: (tHotel.raw("amenities") as string[]).map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
    })),
    sameAs: [
      process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL || "https://www.instagram.com",
      process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL || "https://www.facebook.com",
    ],
    inLanguage: locale === "ar" ? "ar-EG" : "en-US",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
