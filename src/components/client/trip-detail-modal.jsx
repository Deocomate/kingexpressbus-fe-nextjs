"use client";

import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Lightweight trip detail dialog used from trip row cards.
 * Props mirror historical usage in trip-row-card.jsx.
 */
export function TripDetailModal({ trip, date, locale, primaryImage, hasSeats }) {
  const t = useTranslations("client.route_show");
  const pickupPoints = (trip.stops || []).filter((s) =>
    ["pickup", "both"].includes(s.stop_type),
  );
  const dropoffPoints = (trip.stops || []).filter((s) =>
    ["dropoff", "both"].includes(s.stop_type),
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="ksb-btn-ghost min-h-10 px-3 text-xs">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          {t("trip_card.details_button")}
        </button>
      </DialogTrigger>
      <DialogContent size="lg" className="bg-white text-ink">
        <DialogHeader>
          <DialogTitle>{trip.bus_name}</DialogTitle>
          <DialogDescription>
            {trip.route_name} · {date} · {trip.start_time?.slice(0, 5)} →{" "}
            {trip.end_time?.slice(0, 5)}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage}
              alt={trip.bus_name}
              className="aspect-video w-full rounded-sm object-cover"
            />
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 text-sm font-semibold">{t("pickup_title")}</h4>
              <div className="space-y-1">
                {pickupPoints.length ? (
                  pickupPoints.map((point) => (
                    <p key={point.stop_id} className="text-sm font-medium text-ink">
                      {point.name || point.stop_name}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-muted">{t("trip_card.not_updated")}</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold">{t("dropoff_title")}</h4>
              <div className="space-y-1">
                {dropoffPoints.length ? (
                  dropoffPoints.map((point) => (
                    <p key={point.stop_id} className="text-sm font-medium text-ink">
                      {point.name || point.stop_name}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-muted">{t("trip_card.not_updated")}</p>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted">
            {hasSeats
              ? t("trip_card.seats_available")
              : t("trip_card.seats_full")}
            {" · "}
            {locale?.toUpperCase?.() || locale}
          </p>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
