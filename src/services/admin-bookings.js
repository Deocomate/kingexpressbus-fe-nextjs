// Admin booking helpers — shapes match `app/schemas/booking.py`
// (BookingOut, BookingActionOut, BookingCancelIn, BookingAdminUpdateIn).
// Named actions cover the UI; PATCH /admin/bookings/{id}/status exists on BE
// but is unused here (confirm/complete/cancel are enough).
import { apiFetch } from "@/services/api-base";

/**
 * @typedef {Object} BookingActionResult
 * @property {string} message
 * @property {object|null} [booking] BookingOut when present; nullable per BookingActionOut
 */

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

export function getBookingCounts() {
  return apiFetch("/admin/bookings/counts", {
    credentials: "include",
  });
}

export function adminCreateBooking(body) {
  return apiFetch("/admin/bookings", {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify(body),
  });
}

export function adminUpdateBooking(id, body) {
  return apiFetch(`/admin/bookings/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify(body),
  });
}

/** @param {number} id @returns {Promise<BookingActionResult>} */
export function adminConfirmBooking(id) {
  return apiFetch(`/admin/bookings/${id}/confirm`, {
    method: "POST",
    credentials: "include",
  });
}

/** @param {number} id @returns {Promise<BookingActionResult>} */
export function adminCompleteBooking(id) {
  return apiFetch(`/admin/bookings/${id}/complete`, {
    method: "POST",
    credentials: "include",
  });
}

/** @param {number} id @param {string|null} [reason] @returns {Promise<BookingActionResult>} */
export function adminCancelBooking(id, reason) {
  return apiFetch(`/admin/bookings/${id}/cancel`, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: "include",
    body: JSON.stringify({
      reason: reason || null,
    }),
  });
}