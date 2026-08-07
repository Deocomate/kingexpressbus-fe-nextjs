import { getTranslations, setRequestLocale } from "next-intl/server";
import { Bus, CalendarDays, Clock3, ShieldCheck } from "lucide-react";
import { ApiError } from "@/services/api-base";
import { getTripDetail } from "@/services/booking-api";
import { getWebProfile } from "@/services/client-api";
import { BookingForm } from "@/components/client/booking-form";

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default async function BookingCreatePage({ params, searchParams }) {
  const { locale } = await params;
  const { trip_id: tripIdParam, date } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("client.booking.create");
  const tripId = tripIdParam ? Number(tripIdParam) : NaN;

  if (!Number.isFinite(tripId) || !date) {
    return (
      <main className="ksb-container ksb-section text-center">
        <p className="font-semibold text-ink">{t("trip_not_found")}</p>
      </main>
    );
  }

  let trip;
  try {
    trip = await getTripDetail(tripId, date);
  } catch (err) {
    return (
      <main className="ksb-container ksb-section text-center">
        <p className="font-semibold text-ink">
          {err instanceof ApiError && err.status === 404
            ? t("trip_not_found")
            : t("invalid_date")}
        </p>
      </main>
    );
  }

  const webProfile = await getWebProfile();

  return (
    <main className="bg-page text-ink">
      <section className="booking-hero ksb-section-hero px-4 text-white">
        <div className="container mx-auto max-w-7xl py-2 md:py-4">
          <p className="kx-section-label text-brand-300">
            {t("header_subtitle")}
          </p>
          <h1 className="mt-2 max-w-3xl text-balance font-display text-3xl font-extrabold leading-tight md:text-5xl">
            {trip.route_name}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-brand-400" aria-hidden="true" />
              {trip.start_time.slice(0, 5)} – {trip.end_time.slice(0, 5)}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays
                className="h-4 w-4 text-brand-400"
                aria-hidden="true"
              />
              {formatDate(date)}
            </span>
            <span className="inline-flex min-w-0 items-center gap-2">
              <Bus className="h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
              <span className="truncate">{trip.bus_name}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {t("insurance_badge")}
            </span>
          </div>
        </div>
      </section>
      <BookingForm
        trip={trip}
        date={date}
        locale={locale}
        webProfile={{
          hotline: webProfile.hotline,
          zalo_url: webProfile.zalo_url,
        }}
      />
    </main>
  );
}
