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
import { BookingSuccessAccountCta } from "@/components/client/booking-success-account-cta";

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
  const isVerifying = isAwaitingPaymentRequest && sepayReturned === "1";
  const hotlineDisplay = webProfile.hotline ?? "0865 095 066";
  const hotlineTel = (webProfile.hotline ?? "0865095066").replace(/[^0-9+]/g, "");

  return (
    <BookingPaymentStatusProvider
      code={booking.booking_code}
      initialPaid={isPaid}
      pollingEnabled={isAwaitingPaymentRequest}
    >
      <main className="bg-page">
        <section className="ksb-section-hero border-b border-amber-100 bg-linear-to-b from-amber-50 to-page px-4 pb-10 pt-8 sm:pt-12">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-sm bg-green-600 text-white shadow-sm"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                {t("title")}
              </h1>
              <p
                className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base"
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

            <div className="mx-auto mt-8 max-w-xl border border-amber-200/80 bg-white px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    {t("booking_code_label")}
                  </p>
                  <p className="ksb-price mt-1.5 break-all text-2xl font-extrabold tracking-[0.12em] text-ink">
                    {booking.booking_code}
                  </p>
                </div>
                <PaymentStatusBadge initialPaid={isPaid} />
              </div>
            </div>
          </div>
        </section>

        <section className="ksb-section ksb-section-band px-4">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <article className="space-y-5 lg:col-span-2">
              <section className="border border-amber-100 bg-white p-5 sm:p-6">
                <h2 className="mb-5 font-display text-lg font-bold text-ink">
                  {t("trip_info_title")}
                </h2>
                <div className="mb-5 bg-amber-50/70 px-4 py-4 sm:px-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="min-w-[72px] text-center">
                      <p className="text-2xl font-extrabold text-ink">
                        {trip?.start_time.slice(0, 5) ?? "--:--"}
                      </p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">
                        {t("departure_time")}
                      </p>
                    </div>
                    <div className="relative flex-1 border-t-2 border-dashed border-primary-300" />
                    <div className="min-w-[72px] text-center">
                      <p className="text-2xl font-extrabold text-ink">
                        {trip?.end_time.slice(0, 5) ?? "--:--"}
                      </p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">
                        {t("arrival_time")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
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

              <section className="border border-amber-100 bg-white p-5 sm:p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-ink">
                  {t("locations_title")}
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="bg-green-50/80 px-4 py-3.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-green-700">
                      {t("pickup_point")}
                    </span>
                    <p className="mt-1.5 font-semibold text-ink">{pickupName}</p>
                    {pickupAddress ? (
                      <p className="mt-1 text-sm text-muted">{pickupAddress}</p>
                    ) : null}
                  </div>
                  <div className="bg-rose-50/80 px-4 py-3.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                      {t("dropoff_point")}
                    </span>
                    <p className="mt-1.5 font-semibold text-ink">
                      {dropoffStop?.name ?? tCommon("updating")}
                    </p>
                    {dropoffStop?.address ? (
                      <p className="mt-1 text-sm text-muted">
                        {dropoffStop.address}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="border border-amber-100 bg-white p-5 sm:p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-ink">
                  {t("passenger_info_title")}
                </h2>
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
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

              <section className="border border-amber-100 bg-white p-5 sm:p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-ink">
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
                  <NextStep
                    n={3}
                    title={t("next_step_3_title")}
                    descHtml={t
                      .raw("next_step_3_desc")
                      .replace(":hotline", hotlineDisplay)}
                  />
                </div>
              </section>
            </article>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <section className="border border-amber-100 bg-white p-5 sm:p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-ink">
                  {t("payment_info_title")}
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted">{t("total_price")}</span>
                    <span className="ksb-price text-xl font-extrabold text-primary-700">
                      {booking.total_price
                        ? formatMoney(booking.total_price, locale)
                        : tCreate("summary_contact_price")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted">{t("payment_method")}</span>
                    <span className="font-semibold text-ink">
                      {isOnlineBanking
                        ? t("payment_method_online")
                        : t("payment_method_cash")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted">{t("payment_status")}</span>
                    <PaymentStatusBadge initialPaid={isPaid} size="sm" />
                  </div>
                </div>
                {isAwaitingPaymentRequest ? (
                  <PaymentSidebarNote
                    initialPaid={isPaid}
                    verifying={isVerifying}
                  />
                ) : null}
              </section>

              <BookingSuccessAccountCta
                locale={locale}
                email={booking.customer_email}
                name={booking.customer_name}
              />

              <section className="bg-slate-900 p-5 text-white sm:p-6">
                <h3 className="font-display text-lg font-bold">
                  {t("support_title")}
                </h3>
                <p className="mt-2 text-sm text-white/75">
                  {t("support_description")}
                </p>
                <a
                  href={`tel:${hotlineTel}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary-600 px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-primary-700"
                >
                  {t("call_button")}
                </a>
              </section>

              <a
                href={localePath(locale, CLIENT_ROUTES.routesIndex)}
                className="block border border-amber-100 bg-white px-5 py-4 text-sm font-medium text-primary-700 transition-colors duration-200 hover:border-primary-200 hover:text-primary-800"
              >
                {t("other_routes_title")} →
              </a>
            </aside>
          </div>
        </section>
      </main>
    </BookingPaymentStatusProvider>
  );
}

function InfoCell({ label, value, breakAll }) {
  return (
    <div className="bg-gray-50 px-3.5 py-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p
        className={`mt-1.5 font-semibold text-ink ${breakAll ? "break-all" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function NextStep({ n, title, desc, descHtml }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary-600 text-sm font-bold text-white">
        {n}
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-ink">{title}</p>
        {descHtml ? (
          <p
            className="text-sm text-muted"
            dangerouslySetInnerHTML={{ __html: descHtml }}
          />
        ) : (
          <p className="text-sm text-muted">{desc}</p>
        )}
      </div>
    </div>
  );
}
