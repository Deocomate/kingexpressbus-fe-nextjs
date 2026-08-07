"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Clock } from "lucide-react";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

/**
 * Booking history/upcoming card.
 * Takes an explicit view-model (route name, pickup/dropoff labels) rather
 * than the raw Booking API type, which does not include those labels.
 */

export function BookingCard({ locale, booking, type = "history" }) {
  const t = useTranslations("client.booking_card");
  const tCommon = useTranslations("client.common");
  const statusColor = STATUS_COLORS[booking.status] ?? "bg-panel text-muted";
  const isUpcoming = type === "upcoming";
  const pickupName = booking.pickupName ?? tCommon("not_available");
  const dropoffName = booking.dropoffName ?? tCommon("not_available");
  const departureLabel = new Date(booking.bookingDate).toLocaleString(
    locale === "vi" ? "vi-VN" : "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );
  return (
    <article
      className={`kx-card p-5 ${isUpcoming ? "ring-2 ring-brand-600/15" : ""}`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-sm px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusColor}`}
            >
              {booking.status}
            </span>
            <span className="rounded-sm bg-panel px-3 py-1 text-xs font-semibold text-muted">
              #{booking.bookingCode}
            </span>
          </div>
          <div>
            <h3 className="line-clamp-1 text-lg font-extrabold text-ink md:text-xl">
              {booking.routeName}
            </h3>
            <div className="mt-2 inline-flex items-center gap-2 rounded-sm bg-brand-50 px-3 py-1.5 text-sm text-muted">
              <Clock
                className={`h-3.5 w-3.5 ${isUpcoming ? "text-brand-600" : ""}`}
                aria-hidden="true"
              />
              <span>
                {t("departure")}:{" "}
                <span className="font-bold text-ink">{departureLabel}</span>
              </span>
            </div>
          </div>
          <div className="grid gap-3 border-t border-dashed border-line-strong pt-4 md:grid-cols-2">
            <div className="rounded-sm bg-panel p-3">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted">
                {t("pickup")}
              </p>
              <div className="flex items-start gap-2 text-sm text-ink">
                <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-sm bg-pickup" />
                <span className="line-clamp-2 font-semibold" title={pickupName}>
                  {pickupName}
                </span>
              </div>
            </div>
            <div className="rounded-sm bg-panel p-3">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted">
                {t("dropoff")}
              </p>
              <div className="flex items-start gap-2 text-sm text-ink">
                <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-sm bg-dropoff" />
                <span
                  className="line-clamp-2 font-semibold"
                  title={dropoffName}
                >
                  {dropoffName}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-row items-center justify-between gap-4 border-t border-line-strong pt-4 lg:w-auto lg:flex-col lg:items-end lg:justify-start lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="text-left lg:text-right">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
              {t("total_payment")}
            </p>
            <p className="kx-price text-xl font-extrabold lg:text-2xl">
              {booking.totalPrice.toLocaleString("vi-VN")} đ
            </p>
          </div>
          <Link
            href={`${localePath(locale, CLIENT_ROUTES.routesIndex)}/${booking.routeSlug}`}
            className="kx-btn-secondary px-4 py-2 text-sm"
          >
            {isUpcoming ? t("actions.details") : t("actions.rebook")}
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
