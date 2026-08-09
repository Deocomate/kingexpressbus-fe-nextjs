import Link from "next/link";
import { Ticket, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { TripDetailModal } from "@/components/client/trip-detail-modal";
import {
  formatDurationMinutes,
  formatMoney,
  primaryBusImage,
  tripDurationMinutes,
} from "@/utils/client-format";

function tripStatus(trip, t) {
  const hasSeats = trip.available_seats > 0 && !trip.is_blocked;
  const isOffDay = trip.is_blocked && trip.block_type === "off_day";
  if (isOffDay) {
    return {
      hasSeats,
      isOffDay,
      canBook: false,
      badge: t("trip_card.off_day_badge"),
      bookLabel: t("trip_card.off_day_button"),
      badgeClass: "bg-rose-100 text-rose-700",
    };
  }
  if (!hasSeats) {
    return {
      hasSeats,
      isOffDay,
      canBook: false,
      badge: t("trip_card.seats_full"),
      bookLabel: t("trip_card.sold_out_button"),
      badgeClass: "bg-rose-100 text-rose-700",
    };
  }
  return {
    hasSeats,
    isOffDay,
    canBook: true,
    badge: t("trip_card.seats_left", { count: trip.available_seats }),
    bookLabel: t("trip_card.book_button"),
    badgeClass: "bg-emerald-100 text-emerald-700",
  };
}

export async function TripRowCard({ trip, date, locale }) {
  const t = await getTranslations("client.route_show");
  const status = tripStatus(trip, t);
  const durationLabel = formatDurationMinutes(
    tripDurationMinutes(trip.start_time, trip.end_time),
    t,
  );
  const tripPrice = trip.effective_price ?? trip.price;
  const bookingHref = `${localePath(locale, CLIENT_ROUTES.booking)}?trip_id=${trip.trip_id}&date=${date}`;
  const services = Array.isArray(trip.bus_services) ? trip.bus_services : [];
  const thumbnailSrc = primaryBusImage(trip);

  return (
    <article className="ksb-trip-row group" id={`trip-card-${trip.trip_id}`}>
      <div className="grid gap-4 p-4 md:grid-cols-[148px_minmax(0,1fr)] lg:p-5">
        <div className="relative aspect-16/10 overflow-hidden rounded-sm bg-panel md:aspect-square md:h-36 md:w-37">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailSrc}
            alt={trip.bus_name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <span
            className={`absolute left-2 top-2 inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold ${status.badgeClass}`}
          >
            {status.badge}
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-extrabold leading-tight text-ink">
                {trip.bus_name}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {trip.bus_model ?? t("trip_card.not_updated")}
              </p>
            </div>
            <div className="shrink-0 sm:text-right">
              <p className="kx-price text-xl font-extrabold leading-none sm:text-2xl">
                {formatMoney(tripPrice, locale)}
              </p>
              {trip.has_surcharge ? (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-sm bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  <Zap className="h-2.5 w-2.5" aria-hidden="true" />
                  {t("trip_card.holiday_surcharge_badge")}
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-sm border border-line bg-panel px-3 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <p className="font-display text-xl font-extrabold tabular-nums text-ink sm:min-w-14">
                {String(trip.start_time).slice(0, 5)}
              </p>
              <div className="flex flex-1 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-pickup" />
                <span className="h-px flex-1 border-t border-dashed border-line-strong" />
                <span className="whitespace-nowrap text-[11px] font-semibold text-muted">
                  {durationLabel}
                </span>
                <span className="h-px flex-1 border-t border-dashed border-line-strong" />
                <span className="h-2 w-2 shrink-0 rounded-full bg-dropoff" />
              </div>
              <p className="font-display text-xl font-extrabold tabular-nums text-ink sm:min-w-14 sm:text-right">
                {String(trip.end_time).slice(0, 5)}
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {services.slice(0, 3).map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center rounded-sm border border-line bg-panel px-2 py-0.5 text-[11px] font-medium text-muted"
                >
                  {service}
                </span>
              ))}
              {services.length > 3 ? (
                <span className="rounded-sm border border-line bg-panel px-2 py-0.5 text-[11px] font-medium text-muted">
                  +{services.length - 3}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <TripDetailModal
                trip={trip}
                date={date}
                locale={locale}
                hasSeats={status.hasSeats}
              />
              {status.canBook ? (
                <Link
                  href={bookingHref}
                  className="ksb-btn-primary min-h-10 px-4 text-xs"
                >
                  <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                  {status.bookLabel}
                </Link>
              ) : (
                <span className="ksb-btn-primary pointer-events-none min-h-10 px-4 text-xs opacity-50">
                  <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                  {status.bookLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
