"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronUp,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Search,
  X,
} from "lucide-react";
import { ApiError } from "@/services/api-base";
import { createBooking } from "@/services/booking-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { BookingStopSection } from "@/components/client/booking-stop-section";
import { PhoneCountryInput } from "@/components/client/phone-country-input";
import { PriceSummary } from "@/components/client/price-summary";

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatMoney(amount, locale) {
  return `${amount.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}đ`;
}

function toBreakdown(source) {
  if (!source) {
    return {
      baseUnitPrice: 0,
      globalSurchargeUnit: 0,
      routeSurchargeUnit: 0,
      finalUnitPrice: 0,
      surchargeSnapshot: null,
    };
  }
  return {
    baseUnitPrice: Number(source.base_unit_price ?? source.baseUnitPrice ?? 0),
    globalSurchargeUnit: Number(
      source.global_surcharge_unit ?? source.globalSurchargeUnit ?? 0,
    ),
    routeSurchargeUnit: Number(
      source.route_surcharge_unit ?? source.routeSurchargeUnit ?? 0,
    ),
    finalUnitPrice: Number(
      source.final_unit_price ?? source.finalUnitPrice ?? 0,
    ),
    surchargeSnapshot:
      source.surcharge_reason_snapshot ?? source.surchargeSnapshot ?? null,
  };
}

function isPickupStop(stop) {
  return stop.stop_type === "pickup" || stop.stop_type === "both";
}

function isDropoffStop(stop) {
  return stop.stop_type === "dropoff" || stop.stop_type === "both";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

function clearFieldError(id) {
  document.getElementById(id)?.classList.remove("field-error");
}

function flagFieldError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("field-error");
  el.scrollIntoView({ behavior: "smooth", block: "center" });
}

function apiErrorMessage(err, fallback) {
  const body = err?.body;
  if (typeof body?.detail === "string") return body.detail;
  if (Array.isArray(body?.detail) && body.detail[0]?.msg) {
    return String(body.detail[0].msg);
  }
  return fallback;
}

/**
 * Client booking create form — trip/date come from the server page;
 * submits via POST /bookings and redirects to the signed success URL.
 */
export function BookingForm({ trip, date, locale, webProfile }) {
  const t = useTranslations("client.booking.create");
  const tStore = useTranslations("client.booking.store");
  const tPrice = useTranslations("client.booking.price_changed");
  const router = useRouter();

  const availableSeats = Math.max(0, Number(trip.available_seats ?? 0));
  const stops = Array.isArray(trip.stops) ? trip.stops : [];
  const pickupStops = useMemo(() => stops.filter(isPickupStop), [stops]);
  const dropoffStops = useMemo(() => stops.filter(isDropoffStop), [stops]);
  const showStopSearch = pickupStops.length + dropoffStops.length > 6;

  const initialBreakdown = useMemo(
    () =>
      toBreakdown(
        trip.price_breakdown ?? {
          base_unit_price: trip.base_unit_price ?? trip.price ?? 0,
          global_surcharge_unit: 0,
          route_surcharge_unit: 0,
          final_unit_price:
            trip.effective_price ?? trip.price_breakdown?.final_unit_price ?? trip.price ?? 0,
          surcharge_reason_snapshot: null,
        },
      ),
    [trip],
  );

  const [quantity, setQuantity] = useState(1);
  const [breakdown, setBreakdown] = useState(initialBreakdown);
  const [priceChanged, setPriceChanged] = useState(false);

  const [pickupStopId, setPickupStopId] = useState("");
  const [dropoffStopId, setDropoffStopId] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [stopSearch, setStopSearch] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const onlinePaymentEnabled = webProfile?.online_payment_enabled !== false;
  const [paymentMethod, setPaymentMethod] = useState("cash_on_pickup");
  const [confirmInfo, setConfirmInfo] = useState(false);

  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [priceSheetOpen, setPriceSheetOpen] = useState(false);

  const isHotelPickup = pickupStopId === "hotel_pickup";
  const totalPrice = breakdown.finalUnitPrice * quantity;

  const pickupLabel = isHotelPickup
    ? t("pickup_at_hotel")
    : (pickupStops.find((s) => String(s.stop_id) === pickupStopId)?.name ??
      t("not_selected"));
  const dropoffLabel =
    dropoffStops.find((s) => String(s.stop_id) === dropoffStopId)?.name ??
    t("not_selected");

  const step2Done = Boolean(pickupStopId) && Boolean(dropoffStopId);
  const step3Done =
    Boolean(customerName.trim()) &&
    Boolean(customerPhone) &&
    Boolean(customerEmail.trim());

  const policyHref = `${localePath(locale, CLIENT_ROUTES.page)}/chinh-sach`;
  const termsHtml = t.raw("terms_agreement").replace(":link", policyHref);

  function changeQuantity(next) {
    const max = Math.max(1, availableSeats || 1);
    setQuantity(Math.min(max, Math.max(1, next)));
  }

  function validate() {
    if (!pickupStopId) {
      flagFieldError("pickup-stops-container");
      return t("frontend_pickup_required");
    }
    if (isHotelPickup && !hotelAddress.trim()) {
      flagFieldError("hotel_pickup_address");
      return t("frontend_hotel_address_required");
    }
    if (!dropoffStopId) {
      flagFieldError("dropoff-stops-container");
      return t("frontend_dropoff_required");
    }
    if (!customerName.trim()) {
      flagFieldError("customer_name");
      return t("frontend_name_required");
    }
    if (!customerPhone) {
      flagFieldError("phone-input-wrapper");
      return t("frontend_phone_required");
    }
    if (!isValidPhone(customerPhone)) {
      flagFieldError("phone-input-wrapper");
      return t("frontend_phone_invalid");
    }
    if (!customerEmail.trim()) {
      flagFieldError("customer_email");
      return t("frontend_email_required");
    }
    if (!isValidEmail(customerEmail.trim())) {
      flagFieldError("customer_email");
      return t("frontend_email_invalid");
    }
    if (!confirmInfo) {
      return t("frontend_confirm_required");
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setPriceChanged(false);

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const result = await createBooking({
        trip_id: trip.trip_id,
        booking_date: date,
        quantity,
        customer_name: customerName.trim(),
        customer_phone: customerPhone,
        customer_email: customerEmail.trim(),
        dropoff_stop_id: Number(dropoffStopId),
        total_price: totalPrice,
        payment_method: paymentMethod,
        pickup_stop_id: isHotelPickup ? null : Number(pickupStopId),
        is_hotel_pickup: isHotelPickup,
        hotel_pickup_address: isHotelPickup ? hotelAddress.trim() : null,
        notes: notes.trim() || null,
      });

      if (result?.success_url) {
        window.location.assign(result.success_url);
        return;
      }
      router.push(localePath(locale, CLIENT_ROUTES.home));
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === 409 &&
        err.body?.error === "price_changed"
      ) {
        const next = toBreakdown(err.body.breakdown);
        if (err.body.breakdown?.server_total != null && next.finalUnitPrice <= 0) {
          const qty = Number(err.body.breakdown.quantity ?? quantity) || 1;
          next.finalUnitPrice = Math.round(
            Number(err.body.breakdown.server_total) / qty,
          );
        }
        setBreakdown(next);
        setPriceChanged(true);
        setFormError(tPrice("description"));
        return;
      }

      const message = apiErrorMessage(
        err,
        err instanceof ApiError && err.status === 400
          ? tStore("system_error")
          : t("general_validation_error"),
      );
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="ksb-section-compact border-b border-line bg-surface px-4 py-4">
        <div className="container mx-auto max-w-7xl">
          <div className="step-progress ksb-booking-step mx-auto max-w-lg">
            <div className="step-item">
              <div className="step-circle active">1</div>
              <span className="step-label active">{t("step_trip")}</span>
            </div>
            <div className="step-item">
              <div
                className={`step-circle ${step2Done ? "active" : "pending"}`}
              >
                2
              </div>
              <span className={`step-label ${step2Done ? "active" : ""}`}>
                {t("step_passenger")}
              </span>
            </div>
            <div className="step-item">
              <div
                className={`step-circle ${step3Done ? "active" : "pending"}`}
              >
                3
              </div>
              <span className={`step-label ${step3Done ? "active" : ""}`}>
                {t("step_confirm")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="ksb-section ksb-section-band px-4 pb-28 xl:pb-16">
        <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <form
            id="booking-form"
            className="space-y-6"
            onSubmit={handleSubmit}
            noValidate
          >
            {formError && (
              <div
                className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-red-700"
                role="alert"
              >
                <strong className="font-bold">
                  {priceChanged ? tPrice("title") : t("validation_error_title")}
                </strong>
                <p className="mt-2">{formError}</p>
                {priceChanged && (
                  <p className="mt-2 text-sm font-semibold text-brand-800">
                    {tPrice("confirm_new_price")}
                  </p>
                )}
              </div>
            )}

            <section className="booking-panel space-y-5 p-5 md:p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand-600 text-sm text-white">
                  1
                </span>
                {t("trip_info_title")}
              </h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="booking_date"
                    className="mb-2 block text-sm font-semibold text-ink"
                  >
                    {t("departure_date_label")}
                  </label>
                  <div className="relative">
                    <CalendarDays
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                      aria-hidden="true"
                    />
                    <input
                      id="booking_date"
                      type="text"
                      readOnly
                      value={formatDate(date)}
                      className="kx-form-control w-full px-3 py-3 pl-10 text-base"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="quantity"
                    className="mb-2 block text-sm font-semibold text-ink"
                  >
                    {t("quantity_label")}
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center rounded-sm border border-line-strong bg-panel p-1">
                      <button
                        type="button"
                        aria-label="-"
                        className="quantity-btn flex h-10 w-10 items-center justify-center rounded-sm border border-line bg-surface text-ink"
                        onClick={() => changeQuantity(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="flex w-16 flex-col items-center justify-center">
                        <input
                          id="quantity"
                          type="number"
                          readOnly
                          value={quantity}
                          className="w-full border-0 bg-transparent p-0 text-center text-xl font-bold text-ink focus:ring-0"
                        />
                        <span className="-mt-1 text-[10px] uppercase tracking-wide text-muted">
                          {t("tickets_unit")}
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label="+"
                        className="quantity-btn flex h-10 w-10 items-center justify-center rounded-sm bg-brand-600 text-white"
                        onClick={() => changeQuantity(quantity + 1)}
                        disabled={availableSeats > 0 && quantity >= availableSeats}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-sm border border-green-100 bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                      {t("seats_left", { count: availableSeats })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="booking-panel space-y-5 p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand-600 text-sm text-white">
                    2
                  </span>
                  {t("location_title")}
                </h2>
                {showStopSearch && (
                  <div className="relative w-full sm:w-64">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={stopSearch}
                      onChange={(e) => setStopSearch(e.target.value)}
                      placeholder={t("search_stop_placeholder")}
                      className="kx-form-control w-full px-3 py-2 pl-9 text-sm"
                      autoComplete="off"
                    />
                  </div>
                )}
              </div>

              <fieldset>
                <legend className="mb-3 block text-sm font-semibold text-ink">
                  <MapPin className="mr-1 inline h-4 w-4 text-green-500" />
                  {t("pickup_label")}
                </legend>
                <div
                  id="pickup-stops-container"
                  className="grid grid-cols-1 gap-3 md:grid-cols-2"
                >
                  {trip.available_hotel_pickup && (
                    <label
                      className={`stop-card hotel-pickup-badge flex items-start gap-3 rounded-sm p-4${isHotelPickup ? " selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="pickup_stop_id"
                        value="hotel_pickup"
                        checked={isHotelPickup}
                        onChange={() => {
                          setPickupStopId("hotel_pickup");
                          clearFieldError("pickup-stops-container");
                        }}
                        className="sr-only stop-input"
                      />
                      <span className="stop-radio" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink">
                          {t("pickup_at_hotel")}
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-xs text-amber-800">
                          {t("hotel_pickup_hanoi_only")}
                        </span>
                      </span>
                    </label>
                  )}
                  <BookingStopSection
                    stops={pickupStops}
                    dataType="pickup"
                    selectedId={isHotelPickup ? "" : pickupStopId}
                    searchQuery={stopSearch}
                    onSelect={(id) => {
                      setPickupStopId(id);
                      clearFieldError("pickup-stops-container");
                    }}
                  />
                </div>
              </fieldset>

              {isHotelPickup && (
                <div id="hotel-pickup-address-wrapper">
                  <label
                    htmlFor="hotel_pickup_address"
                    className="mb-2 block text-sm font-semibold text-ink"
                  >
                    {t("hotel_address_label")}
                  </label>
                  <input
                    id="hotel_pickup_address"
                    type="text"
                    value={hotelAddress}
                    onChange={(e) => {
                      setHotelAddress(e.target.value);
                      clearFieldError("hotel_pickup_address");
                    }}
                    placeholder={t("hotel_address_placeholder")}
                    className="kx-form-control w-full px-3 py-3 text-base"
                  />
                </div>
              )}

              <fieldset>
                <legend className="mb-3 block text-sm font-semibold text-ink">
                  <MapPin className="mr-1 inline h-4 w-4 text-dropoff" />
                  {t("dropoff_label")}
                </legend>
                <div
                  id="dropoff-stops-container"
                  className="grid grid-cols-1 gap-3 md:grid-cols-2"
                >
                  <BookingStopSection
                    stops={dropoffStops}
                    dataType="dropoff"
                    selectedId={dropoffStopId}
                    searchQuery={stopSearch}
                    onSelect={(id) => {
                      setDropoffStopId(id);
                      clearFieldError("dropoff-stops-container");
                    }}
                  />
                </div>
              </fieldset>
            </section>

            <section className="booking-panel space-y-5 p-5 md:p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand-600 text-sm text-white">
                  3
                </span>
                {t("passenger_info_title")}
              </h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="customer_name"
                    className="mb-2 block text-sm font-semibold text-ink"
                  >
                    {t("name_label")}
                  </label>
                  <input
                    id="customer_name"
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      clearFieldError("customer_name");
                    }}
                    placeholder={t("name_placeholder")}
                    className="kx-form-control w-full px-3 py-3 text-base"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone-input-wrapper"
                    className="mb-2 block text-sm font-semibold text-ink"
                  >
                    {t("phone_label")}
                  </label>
                  <PhoneCountryInput
                    id="phone-input-wrapper"
                    placeholder={t("phone_placeholder")}
                    onChange={(value) => {
                      setCustomerPhone(value);
                      clearFieldError("phone-input-wrapper");
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="customer_email"
                    className="mb-2 block text-sm font-semibold text-ink"
                  >
                    {t("email_label")}
                  </label>
                  <input
                    id="customer_email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      clearFieldError("customer_email");
                    }}
                    placeholder={t("email_placeholder")}
                    className="kx-form-control w-full px-3 py-3 text-base"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-semibold text-ink"
                  >
                    {t("notes_label")}
                  </label>
                  <textarea
                    id="notes"
                    rows={1}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("notes_placeholder")}
                    className="kx-form-control w-full px-3 py-3 text-base"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-ink">
                  {t("payment_method_title")}
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    onlinePaymentEnabled
                      ? {
                          key: "online_banking",
                          label: t("payment_online_label"),
                          description: t("payment_online_desc"),
                        }
                      : null,
                    {
                      key: "cash_on_pickup",
                      label: t("payment_cash_label"),
                      description: t("payment_cash_desc"),
                    },
                  ]
                    .filter(Boolean)
                    .map((method) => {
                    const selected = paymentMethod === method.key;
                    return (
                      <label
                        key={method.key}
                        className={`payment-method-label block rounded-sm border border-line-strong p-4${selected ? " selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={method.key}
                          checked={selected}
                          onChange={() => setPaymentMethod(method.key)}
                          className="sr-only payment-method-input"
                        />
                        <span className="flex items-start gap-3">
                          <span className="radio-icon mt-0.5 flex h-5 w-5 items-center justify-center rounded-sm border-2 border-line-strong">
                            <span
                              className={`${selected ? "block" : "hidden"} h-2.5 w-2.5 rounded-sm bg-brand-600`}
                            />
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm font-semibold text-ink">
                              {method.label}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted">
                              {method.description}
                            </span>
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="booking-panel space-y-4 p-5 md:p-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[t("trust_secure"), t("trust_support"), t("trust_instant")].map(
                  (label) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1.5 rounded-sm bg-panel p-3"
                    >
                      <CheckCircle2
                        className="h-5 w-5 text-brand-600"
                        aria-hidden="true"
                      />
                      <span className="text-[11px] font-medium text-muted">
                        {label}
                      </span>
                    </div>
                  ),
                )}
              </div>

              <label
                htmlFor="confirm_info"
                className="flex cursor-pointer items-start gap-3 rounded-sm border border-line-strong p-4 transition hover:border-brand-600 hover:bg-brand-50/40"
              >
                <input
                  id="confirm_info"
                  type="checkbox"
                  checked={confirmInfo}
                  onChange={(e) => setConfirmInfo(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-ink">{t("confirm_info_label")}</span>
              </label>

              <p
                className="text-xs text-muted"
                dangerouslySetInnerHTML={{ __html: termsHtml }}
              />

              <button
                type="submit"
                disabled={submitting || availableSeats <= 0}
                className="ksb-btn-primary hidden w-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60 xl:inline-flex xl:w-auto"
              >
                <span>
                  {priceChanged ? tPrice("confirm_new_price") : t("submit_button")}
                </span>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </section>
          </form>

          <aside className="sticky-summary hidden space-y-5 xl:block">
            <div className="booking-sidebar-card space-y-4 p-5 md:p-6">
              <h2 className="font-display text-lg font-bold text-ink">
                {t("summary_title")}
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <span className="text-xs text-muted">{t("pickup_label")}</span>
                    <p className="font-medium text-ink">{pickupLabel}</p>
                  </div>
                </div>
                <div className="ksb-route-timeline mx-3" />
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <span className="text-xs text-muted">{t("dropoff_label")}</span>
                    <p className="font-medium text-ink">{dropoffLabel}</p>
                  </div>
                </div>
              </div>
              <hr className="border-line" />
              <PriceSummary
                {...breakdown}
                quantity={quantity}
                totalPrice={totalPrice}
                locale={locale}
              />
            </div>
            <div className="booking-sidebar-card booking-sidebar-card--soft space-y-3 p-5 text-sm text-ink md:p-6">
              <h3 className="text-sm font-semibold text-ink">
                {t("amenities_title")}
              </h3>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
                {trip.bus_services?.length > 0 ? (
                  trip.bus_services.map((service) => (
                    <li
                      key={service}
                      className="flex items-center gap-2 text-xs text-muted"
                    >
                      {service}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center gap-2 text-xs text-muted">
                      {t("amenity_ac")}
                    </li>
                    <li className="flex items-center gap-2 text-xs text-muted">
                      {t("amenity_blanket")}
                    </li>
                    <li className="flex items-center gap-2 text-xs text-muted">
                      {t("amenity_water")}
                    </li>
                    <li className="flex items-center gap-2 text-xs text-muted">
                      {t("amenity_wifi")}
                    </li>
                  </>
                )}
              </ul>
            </div>
            <div className="booking-sidebar-card space-y-3 p-5 md:p-6">
              <h3 className="text-sm font-semibold text-ink">
                {t("support_title")}
              </h3>
              <div className="space-y-2">
                {webProfile?.hotline && (
                  <a
                    href={`tel:${webProfile.hotline.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-2 rounded-sm bg-panel p-2.5 text-sm transition hover:bg-brand-50"
                  >
                    <span className="font-medium text-ink">
                      {webProfile.hotline}
                    </span>
                  </a>
                )}
                {webProfile?.zalo_url && (
                  <a
                    href={webProfile.zalo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-sm bg-panel p-2.5 text-sm transition hover:bg-brand-50"
                  >
                    <span className="font-medium text-ink">Zalo</span>
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="ksb-alert ksb-mobile-action-bar fixed bottom-0 left-0 right-0 border-t border-line bg-surface shadow-card xl:hidden">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            className="text-left"
            onClick={() => setPriceSheetOpen(true)}
          >
            <span className="block text-[11px] text-muted">
              {t("mobile_total_label")}
            </span>
            <span className="ksb-price block text-xl font-bold text-brand-600">
              {formatMoney(totalPrice, locale)}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600">
              <ChevronUp className="h-3 w-3" />
              {t("view_price_details")}
            </span>
          </button>
          <button
            type="submit"
            form="booking-form"
            disabled={submitting || availableSeats <= 0}
            className="ksb-btn-primary max-w-[200px] flex-1 px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {priceChanged ? tPrice("confirm_new_price") : t("submit_button")}
            </span>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {priceSheetOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 xl:hidden"
            aria-label={t("hide_price_details")}
            onClick={() => setPriceSheetOpen(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 xl:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t("price_details_title")}
          >
            <div className="max-h-[80vh] overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-card">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-sm bg-line-strong" />
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display font-bold text-ink">
                  {t("price_details_title")}
                </h3>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-sm bg-panel text-muted"
                  aria-label={t("hide_price_details")}
                  onClick={() => setPriceSheetOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-3 space-y-2 rounded-sm bg-panel p-3 text-sm">
                <div>
                  <span className="text-xs text-muted">{t("pickup_label")}</span>
                  <p className="font-medium text-ink">{pickupLabel}</p>
                </div>
                <div>
                  <span className="text-xs text-muted">{t("dropoff_label")}</span>
                  <p className="font-medium text-ink">{dropoffLabel}</p>
                </div>
              </div>
              <PriceSummary
                {...breakdown}
                quantity={quantity}
                totalPrice={totalPrice}
                locale={locale}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
