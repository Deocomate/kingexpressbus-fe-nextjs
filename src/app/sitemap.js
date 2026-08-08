import { routing } from "@/i18n/routing";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { listRoutes } from "@/services/booking-api";
import { listHotels } from "@/services/hotel-api";
import { listTours } from "@/services/tour-api";
import { getSiteUrl } from "@/lib/seo";
import { CMS_PAGE_SLUGS } from "@/services/client-api";

const STATIC_PATHS = [
  { path: CLIENT_ROUTES.home, changeFrequency: "daily", priority: 1 },
  { path: CLIENT_ROUTES.about, changeFrequency: "monthly", priority: 0.8 },
  { path: CLIENT_ROUTES.contact, changeFrequency: "monthly", priority: 0.7 },
  { path: CLIENT_ROUTES.routesIndex, changeFrequency: "daily", priority: 0.9 },
  { path: CLIENT_ROUTES.hotels, changeFrequency: "weekly", priority: 0.85 },
  { path: CLIENT_ROUTES.tours, changeFrequency: "weekly", priority: 0.85 },
  ...CMS_PAGE_SLUGS.filter((slug) => slug !== "gioi-thieu").map((slug) => ({
    path: `${CLIENT_ROUTES.page}/${slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  })),
];

function entry(locale, path, { changeFrequency, priority, lastModified } = {}) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${localePath(locale, path)}`;
  return {
    url,
    lastModified: lastModified || new Date(),
    changeFrequency: changeFrequency || "weekly",
    priority: priority ?? 0.6,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((loc) => [
          loc,
          `${siteUrl}${localePath(loc, path)}`,
        ]),
      ),
    },
  };
}

export default async function sitemap() {
  const [routes, hotels, tours] = await Promise.all([
    listRoutes().catch(() => []),
    listHotels().catch(() => []),
    listTours().catch(() => []),
  ]);

  const entries = [];

  for (const locale of routing.locales) {
    for (const item of STATIC_PATHS) {
      entries.push(entry(locale, item.path, item));
    }
    for (const route of routes) {
      if (!route?.slug) continue;
      entries.push(
        entry(locale, `${CLIENT_ROUTES.routesIndex}/${route.slug}`, {
          changeFrequency: "daily",
          priority: 0.8,
        }),
      );
    }
    for (const hotel of hotels) {
      if (!hotel?.slug) continue;
      entries.push(
        entry(locale, `${CLIENT_ROUTES.hotels}/${hotel.slug}`, {
          changeFrequency: "weekly",
          priority: 0.75,
        }),
      );
    }
    for (const tour of tours) {
      if (!tour?.slug) continue;
      entries.push(
        entry(locale, `${CLIENT_ROUTES.tours}/${tour.slug}`, {
          changeFrequency: "weekly",
          priority: 0.75,
        }),
      );
    }
  }

  return entries;
}
