import Link from "next/link";
import { ArrowRight, Clock, Route as RouteIcon } from "lucide-react";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
const FALLBACK_THUMBNAIL = "/assets/client/images/city_imgs/sapa.jpg";
const POPULAR_ROUTES_LIMIT = 4;

/**
 * Port of the "Popular routes" section. Blade sorts by a `trip_count`
 * subquery (COUNT of trips per route) with `MIN(price)` as `min_price`;
 * `/public/routes` has neither aggregate (see Phase 3 report deviation #2),
 * so this takes the first 4 routes as returned by the API (same priority
 * ordering the backend already applies) and uses `price_default` in place
 * of `min_price`. The per-row trip-count badge is dropped rather than
 * showing a fabricated "0 chuyến" — same call Phase 3 made on the home page.
 */
export function AboutPopularRoutesSection({ t, routes, locale }) {
  const popularRoutes = routes.slice(0, POPULAR_ROUTES_LIMIT);
  const routesIndexHref = localePath(locale, CLIENT_ROUTES.routesIndex);
  return (
    <section className="ksb-section bg-white px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ksb-section-label">
              {t("about_page.popular_routes.label")}
            </p>
            <h2 className="ksb-text-balance mt-2 font-display text-3xl font-extrabold text-slate-950 md:text-4xl">
              {t("about_page.popular_routes.title")}
            </h2>
          </div>
          <Link
            href={routesIndexHref}
            className="ksb-btn-secondary px-4 text-sm"
          >
            {t("about_page.popular_routes.view_all")}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {popularRoutes.length > 0 ? (
            popularRoutes.map((route) => (
              <Link
                key={route.id}
                href={`${routesIndexHref}/${route.slug}`}
                className="about-route-row group grid overflow-hidden sm:grid-cols-[164px_1fr]"
              >
                <div className="relative min-h-40 overflow-hidden">
                  {" "}
                  <img
                    src={route.thumbnail_url || FALLBACK_THUMBNAIL}
                    alt={route.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-lg font-extrabold text-slate-950">
                      {route.name}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <Clock
                          className="h-4 w-4 text-primary-600"
                          aria-hidden="true"
                        />
                        {route.duration || t("booking.common.updating")}
                      </span>
                      {route.distance_km ? (
                        <span className="inline-flex items-center gap-2">
                          <RouteIcon
                            className="h-4 w-4 text-primary-600"
                            aria-hidden="true"
                          />
                          {route.distance_km} km
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.04em] text-slate-400">
                      {t("about_page.popular_routes.price_from")}
                    </p>
                    <p className="mt-1 whitespace-nowrap font-display text-xl font-extrabold text-primary-700">
                      {route.price_default > 0
                        ? `${route.price_default.toLocaleString("vi-VN")}đ`
                        : t("common.contact")}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="col-span-full rounded-sm border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              {t("about_page.popular_routes.empty")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
