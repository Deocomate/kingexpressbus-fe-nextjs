import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo/site-url";
import { SITE_NAME } from "@/lib/seo/build-page-metadata";

/**
 * Organization + WebSite graph from public web profile.
 * @param {object} webProfile
 * @param {string} locale
 */
export function buildOrganizationWebsiteJsonLd(webProfile, locale) {
  const siteUrl = getSiteUrl();
  const homeUrl = `${siteUrl}${localePath(locale, CLIENT_ROUTES.home)}`;
  const name = webProfile?.title || SITE_NAME;
  const logo = toAbsoluteUrl(
    webProfile?.logo_url || "/assets/client/images/web-information/logo.jpg",
  );
  const sameAs = [webProfile?.facebook_url, webProfile?.zalo_url].filter(Boolean);

  const organization = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name,
    url: siteUrl,
    logo: logo
      ? {
          "@type": "ImageObject",
          url: logo,
        }
      : undefined,
    email: webProfile?.email || undefined,
    telephone: webProfile?.hotline || webProfile?.phone || undefined,
    address: webProfile?.address
      ? {
          "@type": "PostalAddress",
          streetAddress: webProfile.address,
        }
      : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };

  const website = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name,
    url: siteUrl,
    inLanguage: locale === "en" ? "en" : "vi",
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}${localePath(locale, CLIENT_ROUTES.search)}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website],
  };
}

/**
 * @param {{ name: string, items: { name: string, path: string }[], locale: string }} opts
 */
export function buildBreadcrumbJsonLd({ name, items, locale }) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${localePath(locale, item.path)}`,
    })),
  };
}

/**
 * @param {object} hotel
 * @param {string} locale
 * @param {string} path - unprefixed path e.g. /khach-san/slug
 */
export function buildHotelJsonLd(hotel, locale, path) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.short_description || undefined,
    url: `${siteUrl}${localePath(locale, path)}`,
    image: toAbsoluteUrl(hotel.thumbnail_url) || undefined,
    address: hotel.address
      ? {
          "@type": "PostalAddress",
          streetAddress: hotel.address,
        }
      : undefined,
  };
}

/**
 * @param {object} tour
 * @param {string} locale
 * @param {string} path
 */
export function buildTourJsonLd(tour, locale, path) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.name,
    description: tour.short_description || undefined,
    url: `${siteUrl}${localePath(locale, path)}`,
    image: toAbsoluteUrl(tour.thumbnail_url) || undefined,
    touristType: "Sightseeing",
  };
}

/**
 * @param {object} route
 * @param {string} locale
 * @param {string} path
 */
export function buildRouteJsonLd(route, locale, path) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BusTrip",
    name: route.name,
    description: route.description || route.short_description || undefined,
    url: `${siteUrl}${localePath(locale, path)}`,
    image: toAbsoluteUrl(route.thumbnail_url) || undefined,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
  };
}
