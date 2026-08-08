/** Site origin helpers for absolute SEO URLs. */

const PROD_FALLBACK = "https://kingexpressbus.com";
const LOCAL_FALLBACK = "http://localhost:3000";

/**
 * Public site origin (no trailing slash).
 * Prefer NEXT_PUBLIC_SITE_URL; fall back by NODE_ENV.
 */
export function getSiteUrl() {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return PROD_FALLBACK;
  return LOCAL_FALLBACK;
}

/**
 * Resolve a path or absolute URL to an absolute http(s) URL.
 * @param {string | null | undefined} pathOrUrl
 * @returns {string | undefined}
 */
export function toAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return undefined;
  const trimmed = String(pathOrUrl).trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${getSiteUrl()}${path}`;
}
