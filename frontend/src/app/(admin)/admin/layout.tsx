import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import AppProviders from "@/providers/AppProviders";
import AdminShell from "./AdminShell";
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
  title: "Talé Admin",
  description: "Talé Hotel administration console.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased overflow-x-hidden min-w-0`}
        suppressHydrationWarning
      >
        <AppProviders>
          <AdminShell>{children}</AdminShell>
        </AppProviders>
      </body>
    </html>
  );
}
