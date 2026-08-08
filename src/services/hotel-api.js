import { apiFetch } from "@/services/api-base";

export function listHotels() {
  return apiFetch("/hotels", { revalidate: 60 });
}

export function getHotelBySlug(slug, params = {}) {
  const qs = new URLSearchParams();
  if (params.check_in) qs.set("check_in", params.check_in);
  if (params.check_out) qs.set("check_out", params.check_out);
  const query = qs.toString();
  return apiFetch(`/hotels/${encodeURIComponent(slug)}${query ? `?${query}` : ""}`, {
    revalidate: 30,
  });
}

export function createHotelBooking(payload) {
  return apiFetch("/hotel-bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
}

/** Full detail requires signed success URL query params (same contract as bus bookings). */
export function getSignedHotelBooking(bookingId, expires, signature) {
  const qs = new URLSearchParams({ expires, signature });
  return apiFetch(`/hotel-bookings/${bookingId}?${qs.toString()}`, {
    cache: "no-store",
  });
}
