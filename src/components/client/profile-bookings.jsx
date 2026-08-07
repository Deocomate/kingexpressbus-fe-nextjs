"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Clock,
  Crown,
  Flag,
  Heart,
  LogOut,
  Mail,
  Phone,
  Search,
  Ticket,
  Wallet,
} from "lucide-react";
import { ApiError } from "@/services/api-base";
import { getMe, logout } from "@/services/client-auth";
import { listMyBookings, getTripDetail } from "@/services/booking-api";
import { BookingCard } from "@/components/client/booking-card";
import {
  FeedbackEmpty,
  FeedbackError,
  FeedbackLoading,
} from "@/components/client/feedback-state";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
function tripKey(tripId, bookingDate) {
  return `${tripId}::${bookingDate}`;
}
function isUpcoming(booking, today) {
  return new Date(booking.booking_date) >= today;
}
function formatMoney(amount) {
  return `${amount.toLocaleString("vi-VN")}`;
}
export function ProfileBookings({ locale }) {
  const t = useTranslations("client.profile_page");
  const tCommon = useTranslations("client.common");
  const tNav = useTranslations("client.nav");
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [tripsByKey, setTripsByKey] = useState(new Map());
  const [tab, setTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const me = await getMe();
        if (cancelled) return;
        if (!me) {
          router.replace(
            `${localePath(locale, CLIENT_ROUTES.login)}?redirect_to=${encodeURIComponent(pathname)}`,
          );
          return;
        }
        const myBookings = await listMyBookings();
        if (cancelled) return;
        setUser(me);
        setBookings(myBookings);
        const uniqueKeys = new Map();
        for (const booking of myBookings) {
          uniqueKeys.set(tripKey(booking.trip_id, booking.booking_date), {
            tripId: booking.trip_id,
            date: booking.booking_date,
          });
        }
        const entries = await Promise.all(
          Array.from(uniqueKeys.entries()).map(
            async ([key, { tripId, date }]) => {
              try {
                const trip = await getTripDetail(tripId, date);
                return [key, trip];
              } catch {
                return [key, null];
              }
            },
          ),
        );
        if (cancelled) return;
        setTripsByKey(new Map(entries));
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace(
            `${localePath(locale, CLIENT_ROUTES.login)}?redirect_to=${encodeURIComponent(pathname)}`,
          );
          return;
        }
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);
  const { upcomingBookings, historyBookings, stats, preferredRoutes } =
    useMemo(() => {
      if (!bookings) {
        return {
          upcomingBookings: [],
          historyBookings: [],
          stats: {
            total: 0,
            upcoming: 0,
            completed: 0,
            totalSpent: 0,
          },
          preferredRoutes: [],
        };
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const toCardData = (booking) => {
        const trip =
          tripsByKey.get(tripKey(booking.trip_id, booking.booking_date)) ??
          null;
        const pickupStop =
          trip?.stops.find((s) => s.stop_id === booking.pickup_stop_id) ?? null;
        const dropoffStop =
          trip?.stops.find((s) => s.stop_id === booking.dropoff_stop_id) ??
          null;
        return {
          status: booking.status,
          bookingCode: booking.booking_code,
          routeName: trip?.route_name ?? tCommon("not_available"),
          routeSlug: trip?.route_slug ?? "",
          bookingDate: booking.booking_date,
          pickupName: pickupStop?.name ?? null,
          dropoffName: dropoffStop?.name ?? null,
          totalPrice: booking.total_price,
        };
      };
      const upcoming = [];
      const history = [];
      let completedCount = 0;
      let totalSpent = 0;
      const routeCounts = new Map();
      for (const booking of bookings) {
        if (isUpcoming(booking, today)) {
          upcoming.push(toCardData(booking));
        } else {
          history.push(toCardData(booking));
        }
        if (booking.status === "completed") completedCount += 1;
        if (booking.status === "confirmed" || booking.status === "completed")
          totalSpent += booking.total_price;
        const trip = tripsByKey.get(
          tripKey(booking.trip_id, booking.booking_date),
        );
        if (trip?.route_slug) {
          const existing = routeCounts.get(trip.route_slug);
          routeCounts.set(trip.route_slug, {
            name: trip.route_name,
            count: (existing?.count ?? 0) + 1,
          });
        }
      }
      const preferredRoutes = Array.from(routeCounts.entries())
        .map(([slug, { name, count }]) => ({
          slug,
          name,
          count,
        }))
        .sort((a, b) => b.count - a.count);
      return {
        upcomingBookings: upcoming,
        historyBookings: history,
        stats: {
          total: bookings.length,
          upcoming: upcoming.length,
          completed: completedCount,
          totalSpent,
        },
        preferredRoutes,
      };
    }, [bookings, tripsByKey, tCommon]);
  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // Best-effort: even if the API call fails, clear local state and send
      // the user home — same UX outcome as Blade's session-invalidate-then-
      // redirect, which never surfaces a logout error to the user either.
    } finally {
      router.push(localePath(locale, CLIENT_ROUTES.home));
      router.refresh();
    }
  }
  if (loading) {
    return (
      <main className="ksb-section">
        <div className="container mx-auto max-w-lg px-4">
          <FeedbackLoading label={t("loading")} />
        </div>
      </main>
    );
  }
  if (error || !bookings || !user) {
    return (
      <main className="ksb-section">
        <div className="container mx-auto max-w-lg px-4">
          <FeedbackError
            title={t("load_error.title")}
            description={t("load_error.description")}
            action={
              <button
                type="button"
                className="kx-btn-primary px-6 py-3 text-sm"
                onClick={() => window.location.reload()}
              >
                {t("load_error.retry")}
              </button>
            }
          />
        </div>
      </main>
    );
  }
  const greeting = t("hero.greeting", {
    name: user.name ?? t("default_user_name"),
  });
  const visibleBookings =
    tab === "upcoming" ? upcomingBookings : historyBookings;
  return (
    <>
      <section className="relative border-b border-line bg-page text-ink">
        <div className="ksb-section-hero container relative mx-auto flex flex-col items-center justify-between gap-8 px-4 md:flex-row">
          <div className="space-y-4 text-center md:text-left">
            <span className="kx-badge uppercase tracking-wide">
              <Crown className="mr-2 h-3.5 w-3.5" aria-hidden="true" />{" "}
              {t("hero.badge")}
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              {greeting}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-6 text-base text-muted md:justify-start">
              {user.email && (
                <span className="inline-flex items-center gap-2 transition-colors hover:text-ink">
                  <Mail className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  {user.email}
                </span>
              )}
              {user.phone && (
                <span className="inline-flex items-center gap-2 transition-colors hover:text-ink">
                  <Phone className="h-4 w-4 text-pickup" aria-hidden="true" />
                  {user.phone}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="kx-btn-secondary group shrink-0 px-6 py-3 text-sm disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-2">
              <LogOut
                className="h-4 w-4 text-red-400 transition-colors group-hover:text-red-300"
                aria-hidden="true"
              />
              <span>{tNav("logout")}</span>
            </span>
          </button>
        </div>
      </section>
      <section className="ksb-section min-h-screen bg-page">
        <div className="container mx-auto space-y-12 px-4">
          {" "}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="kx-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary-50 text-xl text-brand-600">
                  <Ticket className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold uppercase text-neutral-400">
                  {t("stats.total_tickets")}
                </span>
              </div>
              <p className="text-4xl font-semibold text-neutral-800">
                {stats.total.toLocaleString("vi-VN")}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {t("stats.total_tickets_desc")}
              </p>
            </div>
            <div className="kx-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-accent-50 text-xl text-accent-600">
                  <Clock className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold uppercase text-neutral-400">
                  {t("stats.upcoming")}
                </span>
              </div>
              <p className="text-4xl font-semibold text-neutral-800">
                {stats.upcoming.toLocaleString("vi-VN")}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {t("stats.upcoming_desc")}
              </p>
            </div>
            <div className="kx-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-emerald-50 text-xl text-emerald-600">
                  <Flag className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold uppercase text-neutral-400">
                  {t("stats.completed")}
                </span>
              </div>
              <p className="text-4xl font-semibold text-neutral-800">
                {stats.completed.toLocaleString("vi-VN")}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {t("stats.completed_desc")}
              </p>
            </div>
            <div className="kx-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-indigo-50 text-xl text-indigo-600">
                  <Wallet className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold uppercase text-neutral-400">
                  {t("stats.spending")}
                </span>
              </div>
              <p className="flex items-baseline text-3xl font-semibold text-neutral-800">
                <span>{formatMoney(stats.totalSpent)}</span>
                <span className="ml-1 text-lg font-medium text-neutral-500">
                  đ
                </span>
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {t("stats.spending_desc")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {" "}
            <div className="space-y-8 lg:col-span-2">
              {" "}
              <div className="flex flex-nowrap gap-2 overflow-x-auto border-b border-neutral-200 pb-1">
                <button
                  type="button"
                  onClick={() => setTab("upcoming")}
                  className={`whitespace-nowrap rounded-t-sm border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${tab === "upcoming" ? "border-brand-600 text-brand-600 hover:bg-brand-50" : "border-transparent text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"}`}
                >
                  {t("tabs.upcoming")}{" "}
                  <span className="ml-2 rounded-sm bg-brand-100 px-2 py-0.5 text-xs text-brand-600">
                    {upcomingBookings.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab("history")}
                  className={`whitespace-nowrap rounded-t-sm border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${tab === "history" ? "border-brand-600 text-brand-600 hover:bg-brand-50" : "border-transparent text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"}`}
                >
                  {t("tabs.history")}{" "}
                  <span className="ml-2 rounded-sm bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                    {historyBookings.length}
                  </span>
                </button>
              </div>{" "}
              <div className="space-y-4">
                {visibleBookings.length === 0 ? (
                  tab === "upcoming" ? (
                    <FeedbackEmpty
                      title={t("empty_upcoming.title")}
                      description={t("empty_upcoming.description")}
                      action={
                        <Link
                          href={localePath(locale, CLIENT_ROUTES.routesIndex)}
                          className="kx-btn-primary inline-flex px-6 py-3"
                        >
                          <Search className="h-4 w-4" aria-hidden="true" />
                          {t("empty_upcoming.cta")}
                        </Link>
                      }
                    />
                  ) : (
                    <FeedbackEmpty
                      title={t("empty_history.title")}
                      description={t("empty_history.description")}
                    />
                  )
                ) : (
                  visibleBookings.map((booking) => (
                    <BookingCard
                      key={booking.bookingCode}
                      locale={locale}
                      booking={booking}
                      type={tab}
                    />
                  ))
                )}
              </div>
            </div>{" "}
            <aside className="space-y-6">
              {preferredRoutes.length > 0 && (
                <div className="kx-panel p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-800">
                    <Heart
                      className="h-4 w-4 text-red-500"
                      aria-hidden="true"
                    />{" "}
                    {t("preferred_routes.title")}
                  </h2>
                  <ul className="space-y-3">
                    {preferredRoutes.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`${localePath(locale, CLIENT_ROUTES.routesIndex)}/${item.slug}`}
                          className="group flex items-center justify-between rounded-sm border border-transparent p-3 transition-colors hover:border-neutral-100 hover:bg-neutral-50"
                        >
                          <span className="text-sm font-semibold text-neutral-700 transition-colors group-hover:text-brand-600">
                            {item.name}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-sm bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-600">
                            {item.count}{" "}
                            <CheckCircle2
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rounded-sm bg-contrast-900 p-6 text-white shadow-card">
                <h2 className="mb-4 text-lg font-semibold">
                  {t("support.title")}
                </h2>
                <ul className="mb-6 space-y-3 text-sm text-primary-100">
                  <li className="flex gap-2">
                    <CheckCircle2
                      className="mt-1 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />{" "}
                    <span>{t("support.item_1")}</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2
                      className="mt-1 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />{" "}
                    <span>{t("support.item_2")}</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2
                      className="mt-1 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />{" "}
                    <span>{t("support.item_3")}</span>
                  </li>
                </ul>
                <Link
                  href={localePath(locale, CLIENT_ROUTES.contact)}
                  className="block w-full rounded-sm bg-white px-4 py-3 text-center font-semibold text-brand-600 transition-colors duration-200 hover:bg-neutral-50"
                >
                  {t("support.cta")}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
