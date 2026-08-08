import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ApiError } from "@/services/api-base";
import { getHotelBooking } from "@/services/hotel-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { formatIsoDate, formatMoney } from "@/utils/client-format";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "client.hotels.success",
  });
  return buildPageMetadata({
    title: t("meta_title"),
    description: t("meta_description"),
    locale,
    path: CLIENT_ROUTES.hotelBooking,
    noIndex: true,
  });
}

export default async function HotelBookingSuccessPage({ params }) {
  const { locale, bookingId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("client.hotels.success");

  let booking = null;
  try {
    booking = await getHotelBooking(Number(bookingId));
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
              <dt className="text-muted">{t("hotel")}</dt>
              <dd className="font-semibold">{booking.hotel_name_snapshot}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t("room")}</dt>
              <dd className="font-semibold">{booking.room_name_snapshot}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t("dates")}</dt>
              <dd className="font-semibold">
                {formatIsoDate(booking.check_in)} → {formatIsoDate(booking.check_out)}
              </dd>
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
          href={localePath(locale, CLIENT_ROUTES.hotels)}
          className="kx-btn-primary mt-8 inline-flex"
        >
          {t("back")}
        </Link>
      </div>
    </main>
  );
}
