import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

// Admin CSP: Next.js App Router needs inline hydration scripts. Without a
// per-request nonce + force-dynamic pipeline, script-src must allow
// 'unsafe-inline'. We still block third-party script CDNs (no jsDelivr).
// Client portal has no CSP header (unchanged).
const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const isDev = process.env.NODE_ENV === "development";
const ADMIN_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: " + apiOrigin,
  "font-src 'self'",
  "connect-src 'self' " + apiOrigin + (isDev ? " ws: wss:" : ""),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async headers() {
    const adminCspHeader = {
      key: "Content-Security-Policy",
      value: ADMIN_CSP,
    };
    return [
      { source: "/quan-tri", headers: [adminCspHeader] },
      { source: "/quan-tri/:path*", headers: [adminCspHeader] },
    ];
  },
};

export default withNextIntl(nextConfig);
