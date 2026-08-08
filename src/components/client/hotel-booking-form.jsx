"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ApiError } from "@/services/api-base";
import { createHotelBooking } from "@/services/hotel-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { formatMoney } from "@/utils/client-format";

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(`${checkIn}T00:00:00`);
  const b = new Date(`${checkOut}T00:00:00`);
  const diff = Math.round((b - a) / 86400000);
  return diff > 0 ? diff : 0;
}

export function HotelBookingForm({ hotel, locale, initialRoomId, initialCheckIn, initialCheckOut }) {
  const t = useTranslations("client.hotels.booking");
  const router = useRouter();
  const rooms = hotel.rooms || [];
  const [roomId, setRoomId] = useState(
    initialRoomId && rooms.some((r) => r.id === Number(initialRoomId))
      ? Number(initialRoomId)
      : rooms[0]?.id || ""
  );
  const [checkIn, setCheckIn] = useState(initialCheckIn || "");
  const [checkOut, setCheckOut] = useState(initialCheckOut || "");
  const [roomsCount, setRoomsCount] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [breakfastCount, setBreakfastCount] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_at_property");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const room = useMemo(
    () => rooms.find((r) => r.id === Number(roomId)) || null,
    [rooms, roomId]
  );
  const nights = nightsBetween(checkIn, checkOut);
  const total = room
    ? room.sale_price * nights * roomsCount +
      room.breakfast_price * breakfastCount * nights
    : 0;

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (!room || nights < 1) {
      setError(t("errors.dates"));
      return;
    }
    setSubmitting(true);
    try {
      const result = await createHotelBooking({
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
        rooms_count: Number(roomsCount),
        adults: Number(adults),
        children: Number(children),
        breakfast_count: Number(breakfastCount),
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
      router.push(localePath(locale, CLIENT_ROUTES.hotels));
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

  if (!rooms.length) {
    return <p className="text-muted">{t("no_rooms")}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6 border border-line bg-white p-5 md:p-6">
        <div>
          <label className="mb-1.5 block text-sm font-semibold">{t("room")}</label>
          <select
            className="w-full border border-line bg-page px-3 py-2"
            value={roomId}
            onChange={(e) => setRoomId(Number(e.target.value))}
            required
          >
            {rooms.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — {formatMoney(item.sale_price, locale)}/{t("night")}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("check_in")}</label>
            <input
              type="date"
              className="w-full border border-line bg-page px-3 py-2"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("check_out")}</label>
            <input
              type="date"
              className="w-full border border-line bg-page px-3 py-2"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("rooms_count")}</label>
            <input
              type="number"
              min={1}
              className="w-full border border-line bg-page px-3 py-2"
              value={roomsCount}
              onChange={(e) => setRoomsCount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("adults")}</label>
            <input
              type="number"
              min={1}
              className="w-full border border-line bg-page px-3 py-2"
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("children")}</label>
            <input
              type="number"
              min={0}
              className="w-full border border-line bg-page px-3 py-2"
              value={children}
              onChange={(e) => setChildren(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("breakfast")}</label>
            <input
              type="number"
              min={0}
              className="w-full border border-line bg-page px-3 py-2"
              value={breakfastCount}
              onChange={(e) => setBreakfastCount(e.target.value)}
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
        <h2 className="font-display text-lg font-extrabold">{hotel.name}</h2>
        <p className="text-sm text-muted">{room?.name}</p>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">{t("nights")}</dt>
            <dd className="font-semibold">{nights || "—"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">{t("unit_price")}</dt>
            <dd className="font-semibold">
              {room ? formatMoney(room.sale_price, locale) : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-line pt-2">
            <dt className="font-semibold">{t("total")}</dt>
            <dd className="kx-price text-xl font-extrabold">
              {formatMoney(total, locale)}
            </dd>
          </div>
        </dl>
        <Link
          href={`${localePath(locale, CLIENT_ROUTES.hotels)}/${hotel.slug}`}
          className="inline-flex text-sm font-semibold text-brand-700"
        >
          {t("back_to_hotel")}
        </Link>
      </aside>
    </form>
  );
}
