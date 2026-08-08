import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ApiError } from "@/services/api-base";
import { getTourBooking } from "@/services/tour-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { formatIsoDate, formatMoney } from "@/utils/client-format";

export default async function TourBookingSuccessPage({ params }) {
  const { locale, bookingId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("client.tours.success");

  let booking = null;
  try {
    booking = await getTourBooking(Number(bookingId));
  } catch (err) {
    if (!(err instanceof ApiError)) throw err;
  }

  return (
    <main className="ksb-container ksb-section">
      <div className="mx-auto max-w-2xl border border-line bg-white p-6 md:p-8">
        <p className="kx-section-label text-brand-700">{t("eyebrow")}</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">{t("title")}</h1>
        <p className="mt-3 text-muted">{t("subtitle")}</p>
        {booking ? (
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t("code")}</dt>
              <dd className="font-semibold">#{booking.booking_code}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t("tour")}</dt>
              <dd className="font-semibold">{booking.tour_name_snapshot}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t("date")}</dt>
              <dd className="font-semibold">{formatIsoDate(booking.tour_date)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t("guests")}</dt>
              <dd className="font-semibold">{booking.guests}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-3">
              <dt className="font-semibold">{t("total")}</dt>
              <dd className="kx-price text-xl font-extrabold">
                {formatMoney(booking.total_price, locale)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-6 text-muted">{t("missing")}</p>
        )}
        <Link
          href={localePath(locale, CLIENT_ROUTES.tours)}
          className="kx-btn-primary mt-8 inline-flex"
        >
          {t("back")}
        </Link>
      </div>
    </main>
  );
}
