import Link from "next/link";
import { ArrowRight, Bus, Clock, Headset, Ticket } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listProvinces, listRoutes } from "@/services/booking-api";
import { SearchBar } from "@/components/client/search-bar";
import { DestinationMosaic } from "@/components/client/destination-mosaic";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
const POPULAR_ROUTES_LIMIT = 8;
const FALLBACK_THUMBNAIL = "/assets/client/images/city_imgs/ha-noi.jpg";
function formatMoney(amount, locale) {
  return `${amount.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}đ`;
}
function PopularRouteCard({ route, locale, t }) {
  return (
    <Link
      href={`${localePath(locale, CLIENT_ROUTES.routesIndex)}/${route.slug}`}
      className="kx-card group grid overflow-hidden sm:grid-cols-[180px_1fr]"
    >
      <div className="relative min-h-40 overflow-hidden">
        {" "}
        <img
          src={route.thumbnail_url || FALLBACK_THUMBNAIL}
          alt={route.name}
          width={360}
          height={288}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col justify-between gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-lg font-extrabold text-ink">
            {route.name}
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <Clock
                className="h-3.5 w-3.5 text-brand-600"
                aria-hidden="true"
              />
              {route.duration || t("booking.common.updating")}
            </span>
            <span className="inline-flex items-center gap-2">
              <Bus className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              {route.distance_km
                ? `${route.distance_km} km`
                : t("common.contact")}
            </span>
          </div>
        </div>
        <div className="flex items-end justify-between border-t border-line pt-3">
          <span className="text-sm text-muted">
            {t("home_page.popular_routes.price_from")}
          </span>
          <span className="kx-price text-xl font-extrabold">
            {route.price_default > 0
              ? formatMoney(route.price_default, locale)
              : t("common.contact")}
          </span>
        </div>
      </div>
    </Link>
  );
}
export default async function ClientHomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, provinces, routes] = await Promise.all([
    getTranslations("client"),
    listProvinces(),
    listRoutes(),
  ]);
  const popularRoutes = routes.slice(0, POPULAR_ROUTES_LIMIT);
  const routesIndexHref = localePath(locale, CLIENT_ROUTES.routesIndex);
  const contactHref = localePath(locale, CLIENT_ROUTES.contact);
  return (
    <main>
      {" "}
      <section className="ksb-hero ksb-home-hero relative z-elevated overflow-visible">
        <div className="ksb-hero-media-wrapper">
          <div
            className="ksb-hero-media"
            style={{
              backgroundImage:
                "url('/assets/client/images/city_imgs/sapa.jpg')",
            }}
          />
        </div>
        <div className="ksb-home-hero-body">
          <div className="ksb-home-hero-main">
            <div className="max-w-2xl text-white">
              <h1 className="ksb-text-balance font-display text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
                {t("home_page.hero.title_line_1")}
                <span className="block text-brand-400">
                  {t("home_page.hero.title_line_2")}
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-100/90 md:text-base">
                {t("home_page.hero.description")}
              </p>
            </div>
            <div className="ksb-hero-search mt-6 md:mt-8">
              <SearchBar locale={locale} provinces={provinces} />
            </div>
          </div>
          <div className="ksb-home-hero-features border-t border-white/15 pt-6 md:pt-8">
            {[
              {
                icon: Bus,
                title: t("home_page.advantages.item_1_title"),
                desc: t("home_page.advantages.item_1_desc"),
              },
              {
                icon: Clock,
                title: t("home_page.advantages.item_2_title"),
                desc: t("home_page.advantages.item_2_desc"),
              },
              {
                icon: Headset,
                title: t("home_page.advantages.item_3_title"),
                desc: t("home_page.advantages.item_3_desc"),
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="ksb-trust-item">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-brand-500/20 text-brand-400">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-white">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-200/80">
                      {desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>{" "}
      <section className="ksb-section px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="kx-section-label">
                {t("home_page.popular_routes.label")}
              </p>
              <h2 className="text-balance mt-1 font-display text-2xl font-extrabold text-ink md:text-3xl">
                {t("home_page.popular_routes.title")}
              </h2>
            </div>
            <Link
              href={routesIndexHref}
              className="kx-btn-secondary px-4 text-sm"
            >
              {t("home_page.popular_routes.view_all")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {popularRoutes.length > 0 ? (
              popularRoutes.map((route) => (
                <PopularRouteCard
                  key={route.id}
                  route={route}
                  locale={locale}
                  t={t}
                />
              ))
            ) : (
              <p className="col-span-full rounded-sm border border-dashed border-line-strong bg-surface p-6 text-center text-muted">
                {t("home_page.popular_routes.empty")}
              </p>
            )}
          </div>
        </div>
      </section>{" "}
      <section className="ksb-section bg-white px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="kx-section-label">
                {t("home_page.destinations.label")}
              </p>
              <h2 className="text-balance mt-1 font-display text-2xl font-extrabold text-ink md:text-3xl">
                {t("home_page.destinations.title")}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
                {t("home_page.destinations.description")}
              </p>
            </div>
            <Link
              href={routesIndexHref}
              className="kx-btn-secondary shrink-0 px-4 text-sm"
            >
              {t("home_page.destinations.view_all")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <DestinationMosaic href={routesIndexHref} />
        </div>
      </section>
      <section className="ksb-section-cta px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-sm border border-line bg-contrast-900 p-5 text-white md:p-8">
            <div className="grid items-center gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <h3 className="text-balance text-xl font-extrabold leading-tight md:text-3xl">
                  {t("home_page.cta.title")}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                  {t("home_page.cta.description")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link
                  href={routesIndexHref}
                  className="kx-btn-primary px-5 text-sm"
                >
                  <Ticket className="h-4 w-4" aria-hidden="true" />
                  {t("home_page.cta.primary_button")}
                </Link>
                <Link href={contactHref} className="kx-btn-ghost px-5 text-sm">
                  <Headset className="h-4 w-4" aria-hidden="true" />
                  {t("home_page.cta.secondary_button")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
