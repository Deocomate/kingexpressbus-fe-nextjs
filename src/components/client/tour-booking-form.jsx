"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ApiError } from "@/services/api-base";
import { createTourBooking } from "@/services/tour-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { formatMoney } from "@/utils/client-format";

export function TourBookingForm({ tour, locale }) {
  const t = useTranslations("client.tours.booking");
  const router = useRouter();
  const [tourDate, setTourDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_at_property");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(
    () => Number(tour.base_price || 0) * Number(guests || 0),
    [tour.base_price, guests]
  );

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await createTourBooking({
        tour_id: tour.id,
        tour_date: tourDate,
        guests: Number(guests),
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim() || null,
        payment_method: paymentMethod,
        total_price: total,
        notes: notes.trim() || null,
      });
      if (result?.success_url) {
        window.location.assign(result.success_url);
        return;
      }
      router.push(localePath(locale, CLIENT_ROUTES.tours));
    } catch (err) {
      const detail =
        err instanceof ApiError
          ? err.body?.detail || t("errors.generic")
          : t("errors.generic");
      setError(typeof detail === "string" ? detail : t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-5 border border-line bg-white p-5 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("date")}</label>
            <input
              type="date"
              className="w-full border border-line bg-page px-3 py-2"
              value={tourDate}
              onChange={(e) => setTourDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("guests")}</label>
            <input
              type="number"
              min={1}
              max={tour.max_guests}
              className="w-full border border-line bg-page px-3 py-2"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold">{t("name")}</label>
            <input
              className="w-full border border-line bg-page px-3 py-2"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("email")}</label>
            <input
              type="email"
              className="w-full border border-line bg-page px-3 py-2"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("phone")}</label>
            <input
              className="w-full border border-line bg-page px-3 py-2"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">{t("payment")}</label>
          <select
            className="w-full border border-line bg-page px-3 py-2"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cash_at_property">{t("pay_cash")}</option>
            <option value="bank_transfer">{t("pay_bank")}</option>
          </select>
          <p className="mt-2 text-sm text-muted">{t("payment_note")}</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold">{t("notes")}</label>
          <textarea
            className="min-h-24 w-full border border-line bg-page px-3 py-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="kx-btn-primary w-full disabled:opacity-60"
        >
          {submitting ? t("submitting") : t("submit")}
        </button>
      </div>
      <aside className="h-fit space-y-3 border border-line bg-white p-5">
        <h2 className="font-display text-lg font-extrabold">{tour.name}</h2>
        <p className="text-sm text-muted">{tour.duration_label}</p>
        <div className="flex justify-between border-t border-line pt-3 text-sm">
          <span className="font-semibold">{t("total")}</span>
          <span className="kx-price text-xl font-extrabold">
            {formatMoney(total, locale)}
          </span>
        </div>
        <Link
          href={`${localePath(locale, CLIENT_ROUTES.tours)}/${tour.slug}`}
          className="inline-flex text-sm font-semibold text-brand-700"
        >
          {t("back_to_tour")}
        </Link>
      </aside>
    </form>
  );
}
