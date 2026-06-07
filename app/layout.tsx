import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const title = "FarmPredictor — Harvest when you actually can";
const description =
  "Operations Intelligence for high-yield farms. Cross optimal harvest windows with the machinery, crews and weather you actually have — and see the gap in dollars.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "FarmPredictor",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* App Router root layout loads fonts globally; the rule targets the Pages Router. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
