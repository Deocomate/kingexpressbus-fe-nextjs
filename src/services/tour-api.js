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

export function getTourBooking(bookingId) {
  return apiFetch(`/tour-bookings/${bookingId}`, {
    credentials: "include",
    cache: "no-store",
  });
}
