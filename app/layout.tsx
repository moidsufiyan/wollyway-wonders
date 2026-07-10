import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WollyWay — Handcrafted Woollen Wonders",
  description:
    "Shop WollyWay's premium handcrafted woollen products — scarves, sweaters, shawls and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
