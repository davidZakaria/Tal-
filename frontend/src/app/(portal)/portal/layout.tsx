import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import AppProviders from "@/providers/AppProviders";
import "../../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#003b3a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Guest Portal | Talé Hotel",
  description: "Manage your Talé reservations, payments, and personal preferences.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.ico" },
};

export default function PortalRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased overflow-x-hidden min-w-0`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
