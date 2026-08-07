import { apiFetch } from "@/services/api-base";

/**
 * @typedef {Object} Booking
 * @property {number} id
 * @property {string} booking_code
 * @property {number} trip_id
 * @property {string} booking_date
 * @property {string} customer_name
 * @property {string|null} customer_email
 * @property {string} customer_phone
 * @property {number|null} pickup_stop_id
 * @property {number} dropoff_stop_id
 * @property {number} quantity
 * @property {number} base_unit_price
 * @property {number} global_surcharge_unit
 * @property {number} route_surcharge_unit
 * @property {number} final_unit_price
 * @property {number} total_surcharge_amount
 * @property {number} total_price
 * @property {string|null} surcharge_reason_snapshot
 * @property {string} status
 * @property {string|null} confirmed_at
 * @property {string} payment_method
 * @property {string} payment_status
 * @property {string|null} payment_transaction_id
 * @property {string|null} notes
 * @property {string|null} success_url
 */

/**
 * @typedef {Object} PriceBreakdown
 * @property {string} travel_date
 * @property {number} base_unit_price
 * @property {number} global_surcharge_unit
 * @property {number} route_surcharge_unit
 * @property {number} total_surcharge_unit
 * @property {number} final_unit_price
 * @property {boolean} has_surcharge
 * @property {string[]} surcharge_reasons
 * @property {string|null} surcharge_reason_snapshot
 */

/**
 * @typedef {PriceBreakdown & {quantity: number, server_total: number, total_surcharge_amount: number}} PriceChangedBreakdown
 */

/**
 * @typedef {Object} PriceChangedBody
 * @property {"price_changed"} error
 * @property {number} submitted_total
 * @property {PriceChangedBreakdown} breakdown
 */

/**
 * @typedef {Object} TripStop
 * @property {number} route_stop_id
 * @property {number} stop_id
 * @property {string} name
 * @property {string|null} address
 * @property {"pickup"|"dropoff"|"both"} stop_type
 * @property {number} priority
 */

/**
 * @typedef {Object} SepayCheckoutOut
 * @property {string} booking_code
 * @property {string} payment_url
 * @property {Record<string, string>} form_fields
 */

/**
 * @typedef {Object} SepayAlreadyPaid
 * @property {true} already_paid
 * @property {string} success_url
 */

/**
 * @typedef {Object} SepayReturnOut
 * @property {string} booking_code
 * @property {string} payment_status
 * @property {string} success_url
 */

export function listProvinces() {
  return apiFetch("/public/provinces", {
    revalidate: 300
  });
}
export function listRoutes(params) {
  const qs = new URLSearchParams();
  if (params?.originProvinceId) qs.set("origin_province_id", String(params.originProvinceId));
  if (params?.destinationProvinceId) qs.set("destination_province_id", String(params.destinationProvinceId));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/public/routes${suffix}`, {
    revalidate: 60
  });
}
export function getRouteBySlug(slug) {
  return apiFetch(`/public/routes/${encodeURIComponent(slug)}`, {
    revalidate: 60
  });
}
export function searchTrips(params) {
  const qs = new URLSearchParams({
    origin_province_id: String(params.originProvinceId),
    destination_province_id: String(params.destinationProvinceId),
    date: params.date
  });
  return apiFetch(`/public/trips/search?${qs.toString()}`, {
    revalidate: 30
  });
}
export function getTripDetail(tripId, date) {
  return apiFetch(`/public/trips/${tripId}?date=${encodeURIComponent(date)}`, {
    revalidate: 30
  });
}
export function createBooking(body) {
  return apiFetch("/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}
export function getSignedBooking(bookingId, expires, signature) {
  const qs = new URLSearchParams({
    expires,
    signature
  });
  return apiFetch(`/bookings/${bookingId}?${qs.toString()}`);
}
export function getPaymentStatus(code) {
  return apiFetch(`/payments/status/${encodeURIComponent(code)}`);
}
/** @param {string} code @returns {Promise<SepayCheckoutOut | SepayAlreadyPaid>} */
export function getSepayCheckout(code) {
  return apiFetch(`/payments/sepay/checkout/${encodeURIComponent(code)}`);
}
/** @param {string} code @returns {Promise<SepayReturnOut>} */
export function getSepayReturn(code) {
  return apiFetch(`/payments/sepay/return/${encodeURIComponent(code)}`);
}
export function listMyBookings() {
  return apiFetch("/bookings/mine", {
    credentials: "include"
  });
}