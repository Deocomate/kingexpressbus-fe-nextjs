import Link from "next/link";
import { ArrowRight, Clock3, Globe2, MapPinned, Route as RouteIcon } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listProvinces, listRoutes } from "@/services/booking-api";
import { SearchBar } from "@/components/client/search-bar";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { formatMoney, routeThumbnail } from "@/utils/client-format";

function provinceName(provinces, id) {
  return provinces.find((p) => p.id === id)?.name ?? null;
}

function RouteCard({ route, locale, t, originName, destinationName }) {
  const priceDisplay =
    route.price_default > 0
      ? formatMoney(route.price_default, locale)
      : t("common.contact_price");

  return (
    <Link
      href={`${localePath(locale, CLIENT_ROUTES.routesIndex)}/${route.slug}`}
      className="ksb-route-card group grid overflow-hidden md:grid-cols-[200px_minmax(0,1fr)_auto]"
    >
      <div className="relative min-h-44 overflow-hidden md:min-h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={routeThumbnail(route)}
          alt={route.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent md:bg-linear-to-r" />
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-4 p-5">
        <div>
          <h3 className="line-clamp-2 font-display text-xl font-extrabold text-ink transition group-hover:text-brand-700">
            {route.name}
          </h3>
          {(originName || destinationName) && (
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              <MapPinned className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              <span>{originName ?? "—"}</span>
              <span className="text-line-strong" aria-hidden="true">
                →
              </span>
              <span>{destinationName ?? "—"}</span>
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              {route.duration || t("common.not_available")}
            </span>
            {route.distance_km ? (
              <span className="inline-flex items-center gap-1.5">
                <RouteIcon
                  className="h-3.5 w-3.5 text-brand-600"
                  aria-hidden="true"
                />
                {route.distance_km} km
              </span>
            ) : null}
          </div>
        </div>
        <div className="ksb-route-timeline text-line-strong" aria-hidden="true" />
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line bg-panel/50 p-5 md:min-w-45 md:flex-col md:items-end md:justify-center md:border-l md:border-t-0">
        <div className="md:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {t("routes.index.from")}
          </p>
          <p className="kx-price mt-1 text-2xl font-extrabold">{priceDisplay}</p>
        </div>
        <span className="kx-btn-primary px-4 text-sm">
          {t("routes.index.cta_button")}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function ChipLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-sm border px-3.5 py-2 text-sm font-semibold transition ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-line bg-surface text-muted hover:border-brand-300 hover:bg-brand-50 hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function RoutesIndexPage({ params, searchParams }) {
  const { locale } = await params;
  const { province: provinceParam } = await searchParams;
  setRequestLocale(locale);
  const selectedProvince = provinceParam ? Number(provinceParam) : null;

  const [t, provinces, routes] = await Promise.all([
    getTranslations("client"),
    listProvinces(),
    listRoutes(),
  ]);

  const provincesWithRoutes = provinces.filter((p) =>
    routes.some((r) => r.province_start_id === p.id),
  );
  const filteredRoutes = selectedProvince
    ? routes.filter((r) => r.province_start_id === selectedProvince)
    : routes;
  const popularRoutes = [...filteredRoutes]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8);
  const quickSuggestions = [...routes]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);
  const routesIndexHref = localePath(locale, CLIENT_ROUTES.routesIndex);

  return (
    <main>
      <section className="ksb-hero ksb-section-hero relative z-elevated px-4">
        <div className="ksb-hero-media-wrapper">
          <div
            className="ksb-hero-media"
            style={{
              backgroundImage:
                "url('/assets/client/images/city_imgs/sapa.jpg')",
            }}
          />
        </div>
        <div className="container relative mx-auto max-w-7xl">
          <div className="max-w-3xl text-white">
            <p className="kx-section-label text-brand-300">
              {t("routes.index.badge")}
            </p>
            <h1 className="mt-3 ksb-text-balance font-display text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
              {t("routes.index.hero_title")}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
              {t("routes.index.hero_subtitle")}
            </p>
          </div>
          <div className="ksb-hero-search mt-9 lg:mt-10">
            <SearchBar locale={locale} provinces={provinces} />
          </div>
        </div>
      </section>

      {quickSuggestions.length > 0 ? (
        <section className="ksb-trust-strip ksb-section-compact px-4 text-white">
          <div className="container mx-auto max-w-7xl">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <span className="mr-1 shrink-0 self-center text-sm font-semibold text-white/70">
                {t("routes.index.popular_searches")}
              </span>
              {quickSuggestions.map((route) => (
                <Link
                  key={route.id}
                  href={`${routesIndexHref}/${route.slug}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <MapPinned className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  {route.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="ksb-section px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="ksb-section-label">
              {t("routes.index.popular_highlight")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-ink md:text-4xl">
              {t("routes.index.popular_title")}
            </h2>
            <p className="mt-3 max-w-2xl text-muted">
              {t("routes.index.popular_subtitle")}
            </p>
          </div>

          {provincesWithRoutes.length > 0 ? (
            <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
              <ChipLink href={routesIndexHref} active={!selectedProvince}>
                <Globe2 className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
                {t("routes.index.all_provinces")}
              </ChipLink>
              {provincesWithRoutes.map((province) => (
                <ChipLink
                  key={province.id}
                  href={`${routesIndexHref}?province=${province.id}`}
                  active={selectedProvince === province.id}
                >
                  {province.name}
                </ChipLink>
              ))}
            </div>
          ) : null}

          {popularRoutes.length > 0 ? (
            <div className="space-y-4">
              {popularRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  locale={locale}
                  t={t}
                  originName={provinceName(provinces, route.province_start_id)}
                  destinationName={provinceName(
                    provinces,
                    route.province_end_id,
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
              <p className="text-sm text-muted md:text-base">
                {t("routes.index.empty")}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
