import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  getSiteUrl,
  toAbsoluteUrl,
} from "@/lib/seo";
import "./globals.css";

const siteUrl = getSiteUrl();
const defaultDescription =
  "King Express Bus — premium intercity coach, hotel, and Sa Pa tours.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultDescription,
  icons: {
    icon: "/assets/client/icons/logo.ico",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: defaultDescription,
    url: siteUrl,
    images: [{ url: toAbsoluteUrl(DEFAULT_OG_IMAGE) }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: defaultDescription,
    images: [toAbsoluteUrl(DEFAULT_OG_IMAGE)],
  },
};

export default async function RootLayout({ children }) {
  // Set by middleware.ts (x-app-locale) since this root layout is outside
  // the [locale] segment and can't read the route param directly.
  const locale = (await headers()).get("x-app-locale") ?? "vi";
  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className="antialiased bg-page text-ink font-sans"
        suppressHydrationWarning
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
