"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Clock,
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
      const preferred = Array.from(routeCounts.entries())
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
        preferredRoutes: preferred,
      };
    }, [bookings, tripsByKey, tCommon]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // Best-effort clear.
    } finally {
      router.push(localePath(locale, CLIENT_ROUTES.home));
      router.refresh();
    }
  }

  if (loading) {
    return (
      <main className="ksb-section bg-page">
        <div className="ksb-container max-w-lg">
          <FeedbackLoading label={t("loading")} />
        </div>
      </main>
    );
  }
  if (error || !bookings || !user) {
    return (
      <main className="ksb-section bg-page">
        <div className="ksb-container max-w-lg">
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
  const initial = (user.name ?? "K").slice(0, 1).toUpperCase();

  return (
    <main className="bg-page">
      <section className="border-b border-line bg-linear-to-b from-amber-50 to-page">
        <div className="ksb-container ksb-section-hero py-8 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-ink text-xl font-bold text-white">
                {initial}
              </span>
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  {t("hero.badge")}
                </p>
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  {greeting}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                  {user.email ? (
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Mail
                        className="h-3.5 w-3.5 shrink-0 text-brand-600"
                        aria-hidden="true"
                      />
                      <span className="truncate">{user.email}</span>
                    </span>
                  ) : null}
                  {user.phone ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone
                        className="h-3.5 w-3.5 shrink-0 text-pickup"
                        aria-hidden="true"
                      />
                      {user.phone}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="kx-btn-secondary inline-flex shrink-0 items-center justify-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>{tNav("logout")}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="ksb-section">
        <div className="ksb-container space-y-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard
              icon={<Ticket className="h-5 w-5" aria-hidden="true" />}
              iconClass="bg-brand-50 text-brand-700"
              label={t("stats.total_tickets")}
              value={stats.total.toLocaleString("vi-VN")}
              hint={t("stats.total_tickets_desc")}
            />
            <StatCard
              icon={<Clock className="h-5 w-5" aria-hidden="true" />}
              iconClass="bg-amber-50 text-amber-700"
              label={t("stats.upcoming")}
              value={stats.upcoming.toLocaleString("vi-VN")}
              hint={t("stats.upcoming_desc")}
            />
            <StatCard
              icon={<Flag className="h-5 w-5" aria-hidden="true" />}
              iconClass="bg-emerald-50 text-emerald-700"
              label={t("stats.completed")}
              value={stats.completed.toLocaleString("vi-VN")}
              hint={t("stats.completed_desc")}
            />
            <StatCard
              icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
              iconClass="bg-slate-100 text-slate-700"
              label={t("stats.spending")}
              value={`${formatMoney(stats.totalSpent)}đ`}
              hint={t("stats.spending_desc")}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-5 lg:col-span-2">
              <div className="flex gap-1 border-b border-line">
                <TabButton
                  active={tab === "upcoming"}
                  onClick={() => setTab("upcoming")}
                  count={upcomingBookings.length}
                  accent
                >
                  {t("tabs.upcoming")}
                </TabButton>
                <TabButton
                  active={tab === "history"}
                  onClick={() => setTab("history")}
                  count={historyBookings.length}
                >
                  {t("tabs.history")}
                </TabButton>
              </div>

              <div id={tab === "history" ? "history" : undefined} className="space-y-4">
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
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              {preferredRoutes.length > 0 ? (
                <div className="border border-amber-100 bg-white p-5">
                  <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink">
                    <Heart
                      className="h-4 w-4 text-red-500"
                      aria-hidden="true"
                    />
                    {t("preferred_routes.title")}
                  </h2>
                  <ul className="space-y-2">
                    {preferredRoutes.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`${localePath(locale, CLIENT_ROUTES.routesIndex)}/${item.slug}`}
                          className="group flex items-center justify-between gap-3 px-2 py-2.5 transition-colors hover:bg-brand-50"
                        >
                          <span className="text-sm font-semibold text-ink group-hover:text-brand-700">
                            {item.name}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-sm bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                            {item.count}
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
              ) : null}

              <div className="bg-slate-900 p-5 text-white">
                <h2 className="font-display text-base font-bold">
                  {t("support.title")}
                </h2>
                <ul className="mt-3 space-y-2.5 text-sm text-white/75">
                  <li className="flex gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-400"
                      aria-hidden="true"
                    />
                    <span>{t("support.item_1")}</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-400"
                      aria-hidden="true"
                    />
                    <span>{t("support.item_2")}</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-400"
                      aria-hidden="true"
                    />
                    <span>{t("support.item_3")}</span>
                  </li>
                </ul>
                <Link
                  href={localePath(locale, CLIENT_ROUTES.contact)}
                  className="mt-5 block w-full rounded-sm bg-white px-4 py-3 text-center text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  {t("support.cta")}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ icon, iconClass, label, value, hint }) {
  return (
    <div className="border border-amber-100 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-sm ${iconClass}`}
        >
          {icon}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted sm:text-xs">
          {label}
        </span>
      </div>
      <p className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted sm:text-sm">{hint}</p>
    </div>
  );
}

function TabButton({ active, onClick, count, children, accent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
        active
          ? "border-brand-600 text-brand-700"
          : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {children}
      <span
        className={`rounded-sm px-1.5 py-0.5 text-xs font-semibold ${
          active && accent
            ? "bg-brand-100 text-brand-700"
            : "bg-neutral-100 text-neutral-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
