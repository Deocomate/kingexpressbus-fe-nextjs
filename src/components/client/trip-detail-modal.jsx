"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Clock3,
  Info,
  Loader2,
  MapPin,
  Ticket,
  Zap,
} from "lucide-react";
import { getTripDetail } from "@/services/booking-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import {
  FALLBACK_BUS_IMAGE,
  formatDurationMinutes,
  formatIsoDate,
  formatMoney,
  normalizeImageList,
  primaryBusImage,
  tripDurationMinutes,
} from "@/utils/client-format";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function isPickup(stop) {
  return stop.stop_type === "pickup" || stop.stop_type === "both";
}

function isDropoff(stop) {
  return stop.stop_type === "dropoff" || stop.stop_type === "both";
}

function StopList({ title, stops, accentClass, emptyLabel }) {
  return (
    <div>
      <h4 className={`mb-2 text-xs font-bold uppercase tracking-[0.14em] ${accentClass}`}>
        {title}
      </h4>
      {stops.length === 0 ? (
        <p className="text-sm text-muted">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {stops.map((stop) => (
            <li
              key={stop.stop_id}
              className="rounded-sm border border-line bg-panel px-3 py-2"
            >
              <p className="text-sm font-semibold text-ink">
                {stop.name || stop.stop_name}
              </p>
              {stop.address ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                  {stop.address}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Trip detail dialog opened from a trip row.
 * Loads full trip detail (stops, images) when opened — search rows omit those fields.
 */
export function TripDetailModal({ trip, date, locale, hasSeats }) {
  const t = useTranslations("client.route_show");
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    getTripDetail(trip.trip_id, date)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, trip.trip_id, date]);

  const view = detail ?? trip;
  const images = useMemo(() => {
    const list = normalizeImageList(view.bus_images);
    if (list.length) return list;
    return [primaryBusImage(view, FALLBACK_BUS_IMAGE)];
  }, [view]);

  const pickupStops = (view.stops || []).filter(isPickup);
  const dropoffStops = (view.stops || []).filter(isDropoff);
  const price = view.effective_price ?? view.price ?? 0;
  const durationLabel = formatDurationMinutes(
    tripDurationMinutes(view.start_time, view.end_time),
    t,
  );
  const bookingHref = `${localePath(locale, CLIENT_ROUTES.booking)}?trip_id=${trip.trip_id}&date=${date}`;
  const canBook = hasSeats && !(view.is_blocked && view.block_type === "off_day");
  const seatLabel = hasSeats
    ? t("trip_card.seats_available")
    : t("trip_card.seats_full");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="ksb-btn-secondary min-h-10 px-3 text-xs">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          {t("trip_card.details_button")}
        </button>
      </DialogTrigger>
      <DialogContent
        size="lg"
        className="border-line bg-surface text-ink shadow-card ring-0"
      >
        <DialogHeader className="border-line bg-panel/80">
          <DialogTitle className="font-display text-lg font-extrabold text-ink">
            {t("details_modal.title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted">
            {view.route_name} · {formatIsoDate(date)}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-5">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted">
              <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
              {t("details_modal.not_updated")}
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-sm border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[0]}
                  alt={t("details_modal.bus_image_alt")}
                  className="aspect-video w-full object-cover"
                />
              </div>

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-extrabold text-ink">
                    {view.bus_name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {view.bus_model || t("details_modal.not_updated")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="kx-price text-2xl font-extrabold">
                    {formatMoney(price, locale)}
                  </p>
                  {view.has_surcharge ? (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-sm bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      <Zap className="h-2.5 w-2.5" aria-hidden="true" />
                      {t("trip_card.holiday_surcharge_badge")}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-sm border border-line bg-panel p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                  {t("details_modal.journey_summary")}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-display text-2xl font-extrabold text-ink">
                      {String(view.start_time).slice(0, 5)}
                    </p>
                  </div>
                  <div className="flex flex-1 items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-pickup" />
                    <span className="h-px flex-1 border-t border-dashed border-line-strong" />
                    <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-muted">
                      <Clock3 className="h-3 w-3" aria-hidden="true" />
                      {durationLabel}
                    </span>
                    <span className="h-px flex-1 border-t border-dashed border-line-strong" />
                    <span className="h-2 w-2 rounded-full bg-dropoff" />
                  </div>
                  <div className="sm:text-right">
                    <p className="font-display text-2xl font-extrabold text-ink">
                      {String(view.end_time).slice(0, 5)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted">
                  {t("details_modal.status")} {seatLabel}
                  {typeof view.available_seats === "number"
                    ? ` · ${t("trip_card.seats_left", { count: view.available_seats })}`
                    : null}
                </p>
              </div>

              {(view.bus_services?.length ?? 0) > 0 ? (
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                    {t("details_modal.services_title")}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {view.bus_services.map((service) => (
                      <span
                        key={service}
                        className="rounded-sm border border-line bg-panel px-2.5 py-1 text-xs font-medium text-ink"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                  <MapPin className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                  {t("details_modal.stops_info_title")}
                </h4>
                {error ? (
                  <p className="text-sm text-muted">{t("details_modal.not_updated")}</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <StopList
                      title={t("details_modal.pickup_points_title")}
                      stops={pickupStops}
                      accentClass="text-pickup"
                      emptyLabel={t("details_modal.not_updated")}
                    />
                    <StopList
                      title={t("details_modal.dropoff_points_title")}
                      stops={dropoffStops}
                      accentClass="text-dropoff"
                      emptyLabel={t("details_modal.not_updated")}
                    />
                  </div>
                )}
              </div>

              {images.length > 1 ? (
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                    {t("details_modal.gallery_title")}
                  </h4>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {images.slice(0, 4).map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={src}
                        src={src}
                        alt=""
                        className="aspect-video w-full rounded-sm border border-line object-cover"
                        loading="lazy"
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </DialogBody>

        <DialogFooter className="border-line bg-panel/60 sm:justify-between">
          <button
            type="button"
            className="ksb-btn-secondary min-h-10 px-4 text-sm"
            onClick={() => setOpen(false)}
          >
            {t("details_modal.close")}
          </button>
          {canBook ? (
            <Link
              href={bookingHref}
              className="ksb-btn-primary min-h-10 px-5 text-sm"
              onClick={() => setOpen(false)}
            >
              <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
              {t("details_modal.book_now_button")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : (
            <span className="ksb-btn-primary pointer-events-none min-h-10 px-5 text-sm opacity-50">
              <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
              {t("trip_card.sold_out_button")}
            </span>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
