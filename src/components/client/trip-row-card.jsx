import Link from "next/link";
import { Ticket, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { TripDetailModal } from "@/components/client/trip-detail-modal";
const FALLBACK_BUS_IMAGE = "/assets/client/images/kingexpressbus/sleeper/1.jpg";
function formatMoney(amount, locale) {
  return `${amount.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}đ`;
}
function formatDurationMinutes(minutes, t) {
  return t("trip_card.duration_format", {
    hours: Math.floor(minutes / 60),
    minutes: minutes % 60,
  });
}
function tripDurationMinutes(startTime, endTime) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const start = sh * 60 + sm;
  let end = eh * 60 + em;
  if (end < start) end += 24 * 60;
  return end - start;
}
export async function TripRowCard({ trip, date, locale }) {
  const t = await getTranslations("client.route_show");
  const hasSeats = trip.available_seats > 0 && !trip.is_blocked;
  const isOffDay = trip.is_blocked && trip.block_type === "off_day";
  const durationLabel = formatDurationMinutes(
    tripDurationMinutes(trip.start_time, trip.end_time),
    t,
  );
  const tripPrice = trip.effective_price ?? trip.price;
  const bookingHref = `${localePath(locale, CLIENT_ROUTES.booking)}?trip_id=${trip.trip_id}&date=${date}`;
  const canBook = hasSeats && !isOffDay;
  const bookLabel = isOffDay
    ? t("trip_card.off_day_button")
    : hasSeats
      ? t("trip_card.book_button")
      : t("trip_card.sold_out_button");
  const badgeLabel = isOffDay
    ? t("trip_card.off_day_badge")
    : hasSeats
      ? t("trip_card.seats_available")
      : t("trip_card.seats_full");
  return (
    <article className="ksb-trip-row" id={`trip-card-${trip.trip_id}`}>
      <div className="grid gap-4 p-4 md:grid-cols-[160px_1fr] lg:p-5">
        <div className="relative aspect-video w-full overflow-hidden rounded-sm md:aspect-square md:w-40 md:shrink-0">
          {" "}
          <img
            src={FALLBACK_BUS_IMAGE}
            alt={trip.bus_name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-extrabold leading-tight text-ink">
                {trip.bus_name}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {trip.bus_model ?? t("trip_card.not_updated")}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end sm:text-right">
              <p className="kx-price text-xl font-extrabold leading-none">
                {formatMoney(tripPrice, locale)}
                {trip.has_surcharge && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-sm bg-amber-100 px-2 py-0.5 align-middle text-[10px] font-semibold text-amber-700">
                    <Zap className="h-2.5 w-2.5" aria-hidden="true" />
                    {t("trip_card.holiday_surcharge_badge")}
                  </span>
                )}
              </p>
              <span
                className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-semibold ${isOffDay || !hasSeats ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
              >
                {badgeLabel}
              </span>
            </div>
          </div>
          <div className="rounded-sm border border-line bg-panel p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="font-display text-xl font-extrabold leading-none text-ink">
                  {trip.start_time.slice(0, 5)}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:flex-1 sm:px-2">
                <span className="h-2 w-2 rounded-sm bg-amber-500" />
                <span className="h-px flex-1 border-t border-dashed border-line-strong" />
                <span className="whitespace-nowrap text-[11px] font-semibold text-muted">
                  {durationLabel}
                </span>
                <span className="h-px flex-1 border-t border-dashed border-line-strong" />
                <span className="h-2 w-2 rounded-sm bg-emerald-500" />
              </div>
              <div className="min-w-0 sm:text-right">
                <p className="font-display text-xl font-extrabold leading-none text-ink">
                  {trip.end_time.slice(0, 5)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {trip.bus_services.slice(0, 3).map((service) => (
                <span key={service} className="hidden items-center gap-1 rounded-md bg-panel px-2 py-0.5 text-[11px] font-medium text-muted sm:inline-flex">
                  {service}
                </span>
              ))}
              {trip.bus_services.length > 3 && (
                <span className="hidden rounded-md bg-panel px-2 py-0.5 text-[11px] font-medium text-muted sm:inline-flex">
                  +{trip.bus_services.length - 3}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <TripDetailModal
                trip={trip}
                date={date}
                locale={locale}
                primaryImage={FALLBACK_BUS_IMAGE}
                hasSeats={hasSeats}
              />
              {canBook ? (
                <Link
                  href={bookingHref}
                  className="ksb-btn-primary min-h-10 px-4 text-xs"
                >
                  <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                  {bookLabel}
                </Link>
              ) : (
                <span className="ksb-btn-primary pointer-events-none min-h-10 px-4 text-xs opacity-50">
                  <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                  {bookLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
