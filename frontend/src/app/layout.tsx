import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Talé Hotel | Galala City - Red Sea",
  description: "Talé Hotel introduces a tailored hospitality experience at the heart of Galala city. Designed as a seamless extension of the coastal lifestyle, bringing together hotel comfort, curated service, and uninterrupted views of the Red Sea.",
  keywords: ["Talé Hotel", "Galala City", "Red Sea", "Luxury Hotel", "Coastal Retreat", "Hospitality"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
