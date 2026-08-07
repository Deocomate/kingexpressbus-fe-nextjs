import { headers } from "next/headers";
import "./globals.css";
export const metadata = {
  title: "King Express Bus",
  description: "King Express Bus — client portal and admin"
};
export default async function RootLayout({
  children
}) {
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
      </body>
    </html>
  );
}