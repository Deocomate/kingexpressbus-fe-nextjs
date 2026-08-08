import { apiFetch } from "@/services/api-base";

export function listTours() {
  return apiFetch("/tours", { revalidate: 60 });
}

export function getTourBySlug(slug) {
  return apiFetch(`/tours/${encodeURIComponent(slug)}`, { revalidate: 30 });
}

export function createTourBooking(payload) {
  return apiFetch("/tour-bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
}

/** Full detail requires signed success URL query params (same contract as bus bookings). */
export function getSignedTourBooking(bookingId, expires, signature) {
  const qs = new URLSearchParams({ expires, signature });
  return apiFetch(`/tour-bookings/${bookingId}?${qs.toString()}`, {
    cache: "no-store",
  });
}
