import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // Admin + SePay merchant-return paths stay unprefixed (fixed URLs
  // configured at the SePay integration/merchant level; only the redirect
  // and gateway-return pages — not /dat-ve create/success/status).
  if (
    pathname.startsWith("/quan-tri") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/dat-ve/chuyen-huong-sepay") ||
    pathname.startsWith("/dat-ve/sepay")
  ) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);

  // app/layout.tsx's <html> lives outside the [locale] segment (shared with
  // unprefixed /quan-tri), so it can't read the locale param directly.
  // Forward it as a response header instead; the root layout reads it via
  // next/headers to set <html lang> server-side, not just after hydration.
  const firstSegment = pathname.split("/")[1];
  const resolvedLocale = routing.locales.includes(firstSegment)
    ? firstSegment
    : routing.defaultLocale;
  response.headers.set("x-app-locale", resolvedLocale);
  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
