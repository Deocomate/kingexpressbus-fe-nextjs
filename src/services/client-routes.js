import { routing } from "@/i18n/routing";

/**
 * Client URL path segments (Vietnamese slugs for SEO and bookmarks).
 */
export const CLIENT_ROUTES = {
  home: "/",
  routesIndex: "/tuyen-duong",
  search: "/tim-kiem",
  booking: "/dat-ve",
  paymentStatus: "/dat-ve/trang-thai-thanh-toan",
  forgotPassword: "/quen-mat-khau",
  resetPassword: "/dat-lai-mat-khau",
  contact: "/lien-he",
  about: "/gioi-thieu",
  page: "/trang",
  login: "/dang-nhap",
  register: "/dang-ky",
  account: "/tai-khoan"
};
export function localePath(locale, path) {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

/**
 * Menu URLs come from the DB as absolute legacy (unprefixed) paths.
 * Locale-prefix them for rendering; leave external/absolute-http links alone.
 */
export function localizeMenuUrl(locale, url) {
  if (!url) return localePath(locale, CLIENT_ROUTES.home);
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return localePath(locale, path);
}

/**
 * Locale switcher: replace the leading /vi or /en segment, preserving the
 * rest of the path and the query string.
 */
export function switchLocaleInPath(pathname, search, nextLocale) {
  const segments = pathname.split("/");
  const currentFirst = segments[1];
  if (routing.locales.includes(currentFirst)) {
    segments[1] = nextLocale;
  } else {
    segments.splice(1, 0, nextLocale);
  }
  const nextPath = segments.join("/") || `/${nextLocale}`;
  return `${nextPath}${search}`;
}