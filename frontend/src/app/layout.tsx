import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import AppProviders from "@/providers/AppProviders";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  /** Single value avoids edge cases in some browsers / devtools with multi-entry theme-color. */
  themeColor: "#003b3a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Talé Hotel | Galala City - Red Sea",
  description:
    "Talé Hotel introduces a tailored hospitality experience at the heart of Galala city. Designed as a seamless extension of the coastal lifestyle, bringing together hotel comfort, curated service, and uninterrupted views of the Red Sea.",
  keywords: ["Talé Hotel", "Galala City", "Red Sea", "Luxury Hotel", "Coastal Retreat", "Hospitality"],
  openGraph: {
    title: "Talé Hotel | Galala City - Red Sea",
    description:
      "Coastal luxury in Galala City — curated service and Red Sea views.",
    type: "website",
    locale: "en_US",
    siteName: "Talé Hotel",
  },
  twitter: {
    card: "summary_large_image",
    title: "Talé Hotel | Galala City - Red Sea",
    description:
      "Coastal luxury in Galala City — curated service and Red Sea views.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} antialiased overflow-x-hidden min-w-0`} suppressHydrationWarning>
        <AppProviders>
          {children}
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
