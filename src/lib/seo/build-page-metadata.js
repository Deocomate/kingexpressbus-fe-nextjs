import { routing } from "@/i18n/routing";
import { localePath } from "@/services/client-routes";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo/site-url";

const SITE_NAME = "King Express Bus";
const DEFAULT_OG_IMAGE = "/assets/client/images/web-information/logo.jpg";

const OG_LOCALE = {
  vi: "vi_VN",
  en: "en_US",
};

/**
 * Build Next.js Metadata with Open Graph, Twitter, canonical, and hreflang.
 *
 * @param {object} options
 * @param {string} options.title
 * @param {string} [options.description]
 * @param {string} options.locale - `vi` | `en`
 * @param {string} options.path - Unprefixed path (`/` or `/tuyen-duong/...`)
 * @param {string | string[] | null} [options.images]
 * @param {boolean} [options.noIndex=false]
 * @param {"website" | "article"} [options.type="website"]
 * @param {string} [options.siteName]
 */
export function buildPageMetadata({
  title,
  description,
  locale,
  path,
  images,
  noIndex = false,
  type = "website",
  siteName = SITE_NAME,
}) {
  const siteUrl = getSiteUrl();
  const canonicalPath = localePath(locale, path || "/");
  const canonicalUrl = `${siteUrl}${canonicalPath}`;

  const languageAlternates = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${siteUrl}${localePath(loc, path || "/")}`]),
  );
  languageAlternates["x-default"] = `${siteUrl}${localePath(
    routing.defaultLocale,
    path || "/",
  )}`;

  const imageList = normalizeImages(images);
  const ogImages = imageList.map((url) => ({ url }));

  return {
    metadataBase: new URL(siteUrl),
    title: {
      // Pages pass a full title; avoid `%s | Brand` doubling when title
      // already includes the brand name.
      absolute: title,
    },
    description: description || undefined,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    openGraph: {
      type,
      locale: OG_LOCALE[locale] || OG_LOCALE.vi,
      url: canonicalUrl,
      siteName,
      title,
      description: description || undefined,
      images: ogImages.length ? ogImages : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || undefined,
      images: imageList.length ? imageList : undefined,
    },
  };
}

function normalizeImages(images) {
  const raw = Array.isArray(images) ? images : images ? [images] : [DEFAULT_OG_IMAGE];
  return raw.map((img) => toAbsoluteUrl(img)).filter(Boolean);
}

export { SITE_NAME, DEFAULT_OG_IMAGE };
