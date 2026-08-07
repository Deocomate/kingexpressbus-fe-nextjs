import { getTranslations, setRequestLocale } from "next-intl/server";
import { ApiError } from "@/services/api-base";
import { getSignedBooking, getTripDetail } from "@/services/booking-api";
import { getWebProfile } from "@/services/client-api";
import { parseBookingNotes } from "@/utils/booking-notes";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import {
  BookingPaymentStatusProvider,
  PaymentHeroBanner,
  PaymentSidebarNote,
  PaymentStatusBadge,
} from "@/components/client/payment-status-poller";
function formatMoney(amount, locale) {
  return `${amount.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}đ`;
}
function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function findStop(stops, id) {
  if (id == null) return null;
  return stops.find((s) => s.stop_id === id) ?? null;
}
export default async function BookingSuccessPage({ params, searchParams }) {
  const { locale, bookingId } = await params;
  const {
    expires,
    signature,
    sepay_returned: sepayReturned,
  } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("client.booking.success");
  const tCreate = await getTranslations("client.booking.create");
  const tCommon = await getTranslations("client.booking.common");
  if (!expires || !signature) {
    return (
      <main className="ksb-container ksb-section text-center">
        <p className="font-semibold text-dropoff">{t("meta_title")}</p>
      </main>
    );
  }
  let booking;
  try {
    booking = await getSignedBooking(Number(bookingId), expires, signature);
  } catch (err) {
    const denied =
      err instanceof ApiError && (err.status === 403 || err.status === 404);
    return (
      <main className="ksb-container ksb-section text-center">
        <p className="font-semibold text-dropoff">
          {denied ? t("meta_title") : t("meta_title")}
        </p>
      </main>
    );
  }
  const [webProfile, trip] = await Promise.all([
    getWebProfile(),
    getTripDetail(booking.trip_id, booking.booking_date).catch(() => null),
  ]);
  const isPaid = booking.payment_status === "paid";
  const isOnlineBanking = booking.payment_method === "online_banking";
  const isAwaitingPaymentRequest = isOnlineBanking && !isPaid;
  const pickupStop = findStop(trip?.stops ?? [], booking.pickup_stop_id);
  const dropoffStop = findStop(trip?.stops ?? [], booking.dropoff_stop_id);
  const { hotelPickupAddress } = parseBookingNotes(booking.notes);
  const pickupName = hotelPickupAddress
    ? tCreate("pickup_at_hotel")
    : (pickupStop?.name ?? tCommon("updating"));
  const pickupAddress = hotelPickupAddress ?? pickupStop?.address ?? "";
  // `sepay_returned=1` is appended by /dat-ve/sepay/thanh-cong/{code} right
  // before it redirects here — equivalent to
  // `sepay_payment_returned` flash session flag, since this app has no
  // server-side flash/session mechanism to carry that across the redirect.
  const isVerifying = isAwaitingPaymentRequest && sepayReturned === "1";
  return (
    <BookingPaymentStatusProvider
      code={booking.booking_code}
      initialPaid={isPaid}
      pollingEnabled={isAwaitingPaymentRequest}
    >
      <main className="bg-page">
        <section className="ksb-section-hero border-b border-amber-100 bg-amber-50 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-sm border border-green-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
                {t("title")}
              </span>
              <div className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-sm bg-green-600 text-3xl text-white" />
              <p
                className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base"
                dangerouslySetInnerHTML={{
                  __html: t
                    .raw("thank_you_message")
                    .replace(
                      ":email",
                      booking.customer_email ?? t("your_email"),
                    ),
                }}
              />
              <PaymentHeroBanner
                initialPaid={isPaid}
                isOnlineBanking={isOnlineBanking}
                verifying={isVerifying}
              />
            </div>
            <div className="mx-auto mt-8 max-w-2xl rounded-sm border border-amber-200 bg-white p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    {t("booking_code_label")}
                  </p>
                  <p className="ksb-price mt-2 text-2xl font-extrabold tracking-[0.16em] text-gray-900">
                    {booking.booking_code}
                  </p>
                </div>
                <PaymentStatusBadge initialPaid={isPaid} />
              </div>
            </div>
          </div>
        </section>
        <section className="ksb-section ksb-section-band px-4">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-7">
            <article className="space-y-6 lg:col-span-2">
              <section className="rounded-sm border border-amber-100 bg-white p-5 sm:p-6">
                <h2 className="mb-5 font-display text-lg font-bold text-gray-900">
                  {t("trip_info_title")}
                </h2>
                <div className="mb-6 rounded-sm border border-amber-100 bg-amber-50/60 p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="min-w-[72px] text-center">
                      <p className="text-2xl font-extrabold text-gray-900">
                        {trip?.start_time.slice(0, 5) ?? "--:--"}
                      </p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t("departure_time")}
                      </p>
                    </div>
                    <div className="relative flex-1 border-t-2 border-dashed border-primary-300" />
                    <div className="min-w-[72px] text-center">
                      <p className="text-2xl font-extrabold text-gray-900">
                        {trip?.end_time.slice(0, 5) ?? "--:--"}
                      </p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t("arrival_time")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <InfoCell
                    label={t("route")}
                    value={trip?.route_name ?? tCommon("updating")}
                  />
                  <InfoCell
                    label={t("departure_date")}
                    value={formatDate(booking.booking_date)}
                  />
                  <InfoCell
                    label={t("quantity")}
                    value={`${booking.quantity} ${t("tickets")}`}
                  />
                  <InfoCell
                    label={t("bus")}
                    value={trip?.bus_name ?? t("bus_name_fallback")}
                  />
                </div>
              </section>
              <section className="rounded-sm border border-amber-100 bg-white p-5 sm:p-6">
                <h2 className="mb-5 font-display text-lg font-bold text-gray-900">
                  {t("locations_title")}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-sm border border-green-100 bg-green-50/80 p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-green-700">
                      {t("pickup_point")}
                    </span>
                    <p className="mt-2 font-semibold text-gray-900">
                      {pickupName}
                    </p>
                    {pickupAddress && (
                      <p className="mt-1 text-sm text-gray-600">
                        {pickupAddress}
                      </p>
                    )}
                  </div>
                  <div className="rounded-sm border border-rose-100 bg-rose-50/80 p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                      {t("dropoff_point")}
                    </span>
                    <p className="mt-2 font-semibold text-gray-900">
                      {dropoffStop?.name ?? tCommon("updating")}
                    </p>
                    {dropoffStop?.address && (
                      <p className="mt-1 text-sm text-gray-600">
                        {dropoffStop.address}
                      </p>
                    )}
                  </div>
                </div>
              </section>
              <section className="rounded-sm border border-amber-100 bg-white p-5 sm:p-6">
                <h2 className="mb-5 font-display text-lg font-bold text-gray-900">
                  {t("passenger_info_title")}
                </h2>
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                  <InfoCell
                    label={t("passenger_name")}
                    value={booking.customer_name}
                  />
                  <InfoCell
                    label={t("passenger_phone")}
                    value={booking.customer_phone}
                  />
                  <InfoCell
                    label={t("passenger_email")}
                    value={booking.customer_email ?? tCommon("updating")}
                    breakAll
                  />
                </div>
              </section>
              <section className="rounded-sm border border-amber-100 bg-white p-5 sm:p-6">
                <h2 className="mb-5 font-display text-lg font-bold text-gray-900">
                  {t("next_steps_title")}
                </h2>
                <div className="space-y-4">
                  <NextStep
                    n={1}
                    title={
                      isAwaitingPaymentRequest
                        ? t("next_step_1_online_title")
                        : t("next_step_1_title")
                    }
                    desc={
                      isAwaitingPaymentRequest
                        ? t("next_step_1_online_desc")
                        : t("next_step_1_desc")
                    }
                  />
                  <NextStep
                    n={2}
                    title={
                      isAwaitingPaymentRequest
                        ? t("next_step_2_online_title")
                        : t("next_step_2_title")
                    }
                    desc={
                      isAwaitingPaymentRequest
                        ? t("next_step_2_online_desc")
                        : t("next_step_2_desc")
                    }
                  />
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-sm bg-primary-600 text-sm font-bold text-white">
                      3
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {t("next_step_3_title")}
                      </p>
                      <p
                        className="text-sm text-gray-600"
                        dangerouslySetInnerHTML={{
                          __html: t
                            .raw("next_step_3_desc")
                            .replace(
                              ":hotline",
                              webProfile.hotline ?? "0865 095 066",
                            ),
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </article>
            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <section className="rounded-sm border border-amber-100 bg-white p-5 sm:p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-gray-900">
                  {t("payment_info_title")}
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">{t("total_price")}</span>
                    <span className="ksb-price text-xl font-extrabold text-primary-700">
                      {booking.total_price
                        ? formatMoney(booking.total_price, locale)
                        : tCreate("summary_contact_price")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">{t("payment_method")}</span>
                    <span className="font-semibold text-gray-900">
                      {isOnlineBanking
                        ? t("payment_method_online")
                        : t("payment_method_cash")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-600">{t("payment_status")}</span>
                    <PaymentStatusBadge initialPaid={isPaid} size="sm" />
                  </div>
                </div>
                {isAwaitingPaymentRequest && (
                  <PaymentSidebarNote
                    initialPaid={isPaid}
                    verifying={isVerifying}
                  />
                )}
              </section>
              <section className="rounded-sm bg-slate-900 p-5 text-white sm:p-6">
                <h3 className="font-display text-lg font-bold">
                  {t("support_title")}
                </h3>
                <p className="mt-2 text-sm text-white/75">
                  {t("support_description")}
                </p>
                <a
                  href={`tel:${(webProfile.hotline ?? "0865095066").replace(/[^0-9+]/g, "")}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary-600 px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-primary-700"
                >
                  {t("call_button")}
                </a>
              </section>
              <section className="rounded-sm border border-amber-100 bg-white p-5 sm:p-6">
                <h3 className="font-display text-base font-bold text-gray-900">
                  {t("other_routes_title")}
                </h3>
                <a
                  href={localePath(locale, CLIENT_ROUTES.routesIndex)}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary-700 transition-colors duration-200 hover:text-primary-800"
                >
                  {t("other_routes_title")}
                </a>
              </section>
            </aside>
          </div>
        </section>
      </main>
    </BookingPaymentStatusProvider>
  );
}
function InfoCell({ label, value, breakAll }) {
  return (
    <div className="rounded-sm border border-gray-100 bg-gray-50 p-3.5">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p
        className={`mt-2 font-semibold text-gray-900 ${breakAll ? "break-all" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
function NextStep({ n, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-sm bg-primary-600 text-sm font-bold text-white">
        {n}
      </span>
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}
