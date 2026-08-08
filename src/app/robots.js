import { getSiteUrl } from "@/lib/seo";
import { routing } from "@/i18n/routing";

const SHARED_DISALLOW = [
  "/quan-tri",
  "/dat-ve/chuyen-huong-sepay",
  "/dat-ve/sepay",
];

const LOCALE_SUFFIXES = [
  "/dang-nhap",
  "/dang-ky",
  "/quen-mat-khau",
  "/dat-lai-mat-khau",
  "/tai-khoan",
  "/dat-ve",
  "/khach-san/dat-phong",
  "/tour/dat-tour",
  "/tim-kiem",
];

function disallowPaths() {
  const localePaths = routing.locales.flatMap((locale) =>
    LOCALE_SUFFIXES.map((suffix) => `/${locale}${suffix}`),
  );
  return [...SHARED_DISALLOW, ...localePaths];
}

export default function robots() {
  const siteUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowPaths(),
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
