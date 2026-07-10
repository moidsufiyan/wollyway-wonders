import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

/**
 * DM Sans loaded via next/font (replaces the @import URL in src/index.css).
 * next/font self-hosts the font at build time — no runtime network request,
 * no FOUT (Flash of Unstyled Text), and eliminates the CLS layout shift.
 */
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WollyWay — Handcrafted Woollen Wonders",
    template: "%s | WollyWay",
  },
  description:
    "Shop WollyWay's premium handcrafted woollen products — scarves, sweaters, shawls and more. Free shipping on orders above ₹999.",
  keywords: ["handcrafted", "woollen", "shawl", "scarf", "sweater", "WollyWay"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "WollyWay",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
