import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarX, MapPinned, Sliders, Tag, Ticket, X } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ApiError } from "@/services/api-base";
import {
  getRouteBySlug,
  listProvinces,
  searchTrips,
} from "@/services/booking-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { SearchBar } from "@/components/client/search-bar";
import {
  RouteFilterFields,
  RouteFilterClearLink,
} from "@/components/client/route-filter-fields";
import { RouteMobileFilterDrawer } from "@/components/client/route-mobile-filter-drawer";
import { TripRowCard } from "@/components/client/trip-row-card";
import { MobileStickyBookingBar } from "@/components/client/mobile-sticky-booking-bar";
import { formatIsoDate, formatMoney, routeThumbnail } from "@/utils/client-format";
import {
  JsonLd,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildRouteJsonLd,
} from "@/lib/seo";

const TIME_RANGE_KEYS = [
  "early_morning",
  "morning",
  "afternoon",
  "evening",
  "night",
];

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "client.route_show" });
  let route;
  try {
    route = await getRouteBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { title: t("meta_title") };
    }
    throw err;
  }
  const title = t("meta_title_dynamic").replace(":name", route.name);
  const description = t("meta_description_dynamic").replace(":name", route.name);
  return buildPageMetadata({
    title,
    description,
    locale,
    path: `${CLIENT_ROUTES.routesIndex}/${slug}`,
    images: route.thumbnail_url || undefined,
  });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function timeBucket(startTime) {
  const [h] = String(startTime).split(":").map(Number);
  if (h >= 5 && h < 8) return "early_morning";
  if (h >= 8 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}
export default async function RouteShowPage({ params, searchParams }) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  let route;
  try {
    route = await getRouteBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  const date = sp.date ?? todayIso();
  const returnDate = typeof sp.return_date === "string" ? sp.return_date : "";
  const [t, provinces, allTrips] = await Promise.all([
    getTranslations("client.route_show"),
    listProvinces(),
    searchTrips({
      originProvinceId: route.province_start_id,
      destinationProvinceId: route.province_end_id,
      date,
    }),
  ]);

  // --- Filter state from URL (mirrors TripController::show()'s $filterState) ---
  const filterState = {
    sort: sp.sort ?? "recommended",
    priceMin: sp.price_min ?? "",
    priceMax: sp.price_max ?? "",
    timeRanges: toArray(sp.time_ranges),
    services: toArray(sp.services),
  };
  const hasSeatsFilter = sp.has_seats === "1";

  // --- Facet option sets derived from the unfiltered day's trips ---
  const serviceOptions = Array.from(
    new Set(allTrips.flatMap((trip) => trip.bus_services)),
  ).sort();
  const prices = allTrips.map((trip) => trip.effective_price ?? trip.price);
  const priceRange = {
    min: prices.length ? Math.min(...prices) : 0,
    max: prices.length ? Math.max(...prices) : 0,
  };
  const timeRangeOptions = TIME_RANGE_KEYS.map((key) => ({
    key,
    label: t(`filters.time_range_${key}`),
  }));
  const sortOptions = [
    {
      value: "recommended",
      label: t("filters.sort_recommended"),
    },
    {
      value: "earliest",
      label: t("filters.sort_earliest"),
    },
    {
      value: "latest",
      label: t("filters.sort_latest"),
    },
    {
      value: "price_low",
      label: t("filters.sort_price_low"),
    },
    {
      value: "price_high",
      label: t("filters.sort_price_high"),
    },
    {
      value: "seats_available",
      label: t("filters.sort_seats"),
    },
  ];

  // --- Apply filters ---
  const priceMinNum = filterState.priceMin
    ? Number(filterState.priceMin)
    : null;
  const priceMaxNum = filterState.priceMax
    ? Number(filterState.priceMax)
    : null;
  let trips = allTrips.filter((trip) => {
    const price = trip.effective_price ?? trip.price;
    if (priceMinNum !== null && price < priceMinNum) return false;
    if (priceMaxNum !== null && price > priceMaxNum) return false;
    if (
      filterState.timeRanges.length > 0 &&
      !filterState.timeRanges.includes(timeBucket(trip.start_time))
    )
      return false;
    if (
      filterState.services.length > 0 &&
      !filterState.services.some((s) => trip.bus_services.includes(s))
    )
      return false;
    if (hasSeatsFilter && !(trip.available_seats > 0 && !trip.is_blocked))
      return false;
    return true;
  });

  // --- Apply sort ---
  const sorters = {
    earliest: (a, b) => a.start_time.localeCompare(b.start_time),
    latest: (a, b) => b.start_time.localeCompare(a.start_time),
    price_low: (a, b) =>
      (a.effective_price ?? a.price) - (b.effective_price ?? b.price),
    price_high: (a, b) =>
      (b.effective_price ?? b.price) - (a.effective_price ?? a.price),
    seats_available: (a, b) => b.available_seats - a.available_seats,
  };
  if (sorters[filterState.sort]) {
    trips = [...trips].sort(sorters[filterState.sort]);
  }
  const activeFilterCount =
    (priceMinNum !== null ? 1 : 0) +
    (priceMaxNum !== null ? 1 : 0) +
    filterState.timeRanges.length +
    filterState.services.length +
    (hasSeatsFilter ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;
  const showHref = `${localePath(locale, CLIENT_ROUTES.routesIndex)}/${slug}`;
  const clearFiltersUrl = `${showHref}?date=${date}`;
  const priceDisplay =
    route.price_default > 0
      ? t("price_from", { price: formatMoney(route.price_default, locale) })
      : t("price_contact");
  const dateLabel = formatIsoDate(date);

  function quickFilterHref(overrides) {
    const qs = new URLSearchParams();
    qs.set("date", date);
    if (filterState.sort !== "recommended") qs.set("sort", filterState.sort);
    if (filterState.priceMin) qs.set("price_min", filterState.priceMin);
    if (filterState.priceMax) qs.set("price_max", filterState.priceMax);
    filterState.services.forEach((s) => qs.append("services", s));
    let nextTimeRanges = filterState.timeRanges;
    if (overrides.time_range) {
      nextTimeRanges = filterState.timeRanges.includes(overrides.time_range)
        ? filterState.timeRanges.filter((r) => r !== overrides.time_range)
        : [...filterState.timeRanges, overrides.time_range];
    }
    nextTimeRanges.forEach((r) => qs.append("time_ranges", r));
    let nextHasSeats = hasSeatsFilter;
    if (overrides.has_seats !== undefined) nextHasSeats = overrides.has_seats;
    if (nextHasSeats) qs.set("has_seats", "1");
    return `${showHref}?${qs.toString()}`;
  }

  const quickTimeFilters = [
    "early_morning",
    "morning",
    "afternoon",
    "evening",
  ];
  const lowestPrice =
    trips.length > 0
      ? Math.min(...trips.map((trip) => trip.effective_price ?? trip.price))
      : 0;
  const filterLabels = {
    sort_title: t("filters.sort_title"),
    price_title: t("filters.price_title"),
    price_from: t("filters.price_from"),
    price_to: t("filters.price_to"),
    time_range_title: t("filters.time_range_title"),
    services_title: t("filters.services_title"),
    apply_button: t("filters.apply_button"),
    close: t("details_modal.close"),
  };
  return (
    <main>
      <JsonLd
        data={[
          buildRouteJsonLd(route, locale, `${CLIENT_ROUTES.routesIndex}/${slug}`),
          buildBreadcrumbJsonLd({
            name: route.name,
            locale,
            items: [
              { name: "Home", path: CLIENT_ROUTES.home },
              { name: "Routes", path: CLIENT_ROUTES.routesIndex },
              {
                name: route.name,
                path: `${CLIENT_ROUTES.routesIndex}/${slug}`,
              },
            ],
          }),
        ]}
      />
      <section
        id="search-section"
        className="ksb-hero ksb-section-hero relative z-elevated text-white"
      >
        <div className="ksb-hero-media-wrapper">
          <div
            className="ksb-hero-media"
            style={{
              backgroundImage: `url('${routeThumbnail(route)}')`,
            }}
          />
        </div>
        <div className="container relative z-10 mx-auto max-w-7xl px-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.55fr] lg:items-end">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/80">
                <MapPinned className="h-3.5 w-3.5" aria-hidden="true" />
                {t("hero_brand")}
              </span>
              <h1 className="ksb-text-balance font-display text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
                {route.name}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/86 lg:justify-end">
              <span className="inline-flex items-center gap-2 rounded-sm border border-white/15 bg-white/10 px-3 py-2">
                <Ticket
                  className="h-3.5 w-3.5 text-accent"
                  aria-hidden="true"
                />
                {trips.length} {t("hero_trips")}
              </span>
              <span className="inline-flex items-center gap-2 rounded-sm border border-white/15 bg-white/10 px-3 py-2">
                <Tag className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                {priceDisplay}
              </span>
            </div>
          </div>
          <div className="ksb-panel-strong ksb-hero-search mt-8 text-ink">
            <SearchBar
              locale={locale}
              provinces={provinces}
              initialOriginId={route.province_start_id}
              initialDestinationId={route.province_end_id}
              initialDate={date}
              initialReturnDate={returnDate}
            />
          </div>
        </div>
      </section>
      {allTrips.length > 0 || hasActiveFilters ? (
        <>
          <section className="ksb-section-compact border-y border-line bg-surface">
            <div className="container mx-auto max-w-7xl px-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="mr-1 whitespace-nowrap text-sm font-semibold text-muted">
                  {t("quick_filters.label")}
                </span>
                {quickTimeFilters.map((key) => {
                  const isActive = filterState.timeRanges.includes(key);
                  return (
                    <Link
                      key={key}
                      href={quickFilterHref({ time_range: key })}
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-line text-ink hover:border-line-strong hover:bg-panel"
                      }`}
                    >
                      {t(`filters.time_range_${key}`)}
                    </Link>
                  );
                })}
                <Link
                  href={quickFilterHref({ has_seats: !hasSeatsFilter })}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-3 py-1.5 text-xs font-semibold transition ${
                    hasSeatsFilter
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-line text-ink hover:border-line-strong hover:bg-panel"
                  }`}
                >
                  {t("quick_filters.has_seats")}
                </Link>
                {hasActiveFilters ? (
                  <Link
                    href={clearFiltersUrl}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                    {t("quick_filters.clear_all")}
                  </Link>
                ) : null}
              </div>
            </div>
          </section>
          <section id="availabilities" className="ksb-section ksb-section-band">
            <div className="container mx-auto max-w-7xl px-4">
              <div className="mb-8 flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-center">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-ink md:text-3xl">
                    {t("results_title")}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {trips.length < allTrips.length
                      ? t("results_subtitle_filtered", {
                          filtered: trips.length,
                          total: allTrips.length,
                          date: dateLabel,
                        })
                      : t("results_subtitle", {
                          filtered: trips.length,
                          total: allTrips.length,
                          date: dateLabel,
                        })}
                  </p>
                </div>
                <RouteMobileFilterDrawer
                  action={showHref}
                  filterState={filterState}
                  sortOptions={sortOptions}
                  timeRangeOptions={timeRangeOptions}
                  serviceOptions={serviceOptions}
                  priceRange={priceRange}
                  labels={filterLabels}
                  activeFilterCount={activeFilterCount}
                  dateValue={date}
                  hasSeats={hasSeatsFilter}
                  mobileButtonLabel={t("filters.mobile_button")}
                  mobileTitle={t("filters.mobile_title")}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <aside className="hidden lg:col-span-3 lg:block">
                  <div className="ksb-filter-shell">
                    <div className="flex items-center justify-between border-b border-line bg-brand-50/60 px-5 py-4">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                        <Sliders
                          className="h-4 w-4 text-brand-600"
                          aria-hidden="true"
                        />
                        {t("filters.sidebar_title")}
                      </h3>
                      {hasActiveFilters && (
                        <span className="inline-flex items-center justify-center rounded-sm bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                          {activeFilterCount} {t("filters.active")}
                        </span>
                      )}
                    </div>
                    <form
                      action={showHref}
                      method="get"
                      className="flex flex-col"
                    >
                      <input type="hidden" name="date" value={date} />
                      {hasSeatsFilter && (
                        <input type="hidden" name="has_seats" value="1" />
                      )}
                      <RouteFilterFields
                        filterState={filterState}
                        sortOptions={sortOptions}
                        timeRangeOptions={timeRangeOptions}
                        serviceOptions={serviceOptions}
                        priceRange={priceRange}
                        labels={filterLabels}
                      />
                    </form>
                    <div className="px-4 pb-4">
                      <RouteFilterClearLink
                        href={clearFiltersUrl}
                        label={t("filters.clear_button")}
                      />
                    </div>
                  </div>
                </aside>
                <div className="space-y-3 lg:col-span-9">
                  {trips.length > 0 ? (
                    trips.map((trip) => (
                      <TripRowCard
                        key={trip.trip_id}
                        trip={trip}
                        date={date}
                        locale={locale}
                      />
                    ))
                  ) : (
                    <div className="rounded-sm border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
                      <p className="font-semibold text-ink">
                        {t("no_trips.title")}
                      </p>
                      <p className="mt-2 text-sm text-muted">
                        {t("no_trips.description")}
                      </p>
                      {hasActiveFilters ? (
                        <Link
                          href={clearFiltersUrl}
                          className="ksb-btn-secondary mt-5 inline-flex px-5 text-sm"
                        >
                          {t("no_trips.clear_filters_button")}
                        </Link>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="ksb-section ksb-section-band">
          <div className="container mx-auto max-w-lg px-4 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-sm border border-line bg-panel">
              <CalendarX className="h-9 w-9 text-muted" aria-hidden="true" />
            </div>
            <h2 className="mb-3 font-display text-2xl font-extrabold text-ink">
              {t("no_trips.title")}
            </h2>
            <p className="mb-8 leading-relaxed text-muted">
              {t("no_trips.description")}
            </p>
            <a href="#search-section" className="ksb-btn-secondary px-6">
              {t("no_trips.research_button")}
            </a>
          </div>
        </section>
      )}
      {trips.length > 0 ? (
        <MobileStickyBookingBar lowestPrice={lowestPrice} locale={locale} />
      ) : null}
    </main>
  );
}
