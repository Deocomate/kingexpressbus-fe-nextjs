// Mirrors app/application/booking/booking_notes.py's prefix convention so the admin
// UI can show/edit the hotel-pickup address and free-text note as separate
// fields instead of the raw encoded string — editing the raw string and
// losing the [HOTEL_PICKUP]: prefix permanently destroys the pickup address
// (nothing re-derives it; mail service reads it back via this same convention).
const HOTEL_PICKUP_PREFIX = "[HOTEL_PICKUP]: ";
const LEGACY_HOTEL_PICKUP_PREFIX = "[Đón tại khách sạn]: ";
const CUSTOMER_NOTE_PREFIX = "[CUSTOMER_NOTE]: ";
export function parseBookingNotes(notes) {
  if (!notes) return {
    hotelPickupAddress: null,
    customerNotes: null
  };
  for (const prefix of [HOTEL_PICKUP_PREFIX, LEGACY_HOTEL_PICKUP_PREFIX]) {
    const idx = notes.indexOf(prefix);
    if (idx === -1) continue;
    const afterPrefix = notes.slice(idx + prefix.length);
    const [addressLine, ...rest] = afterPrefix.split("\n");
    const remainder = rest.join("\n");
    const customerIdx = remainder.indexOf(CUSTOMER_NOTE_PREFIX);
    const customerNotes = customerIdx === -1 ? null : remainder.slice(customerIdx + CUSTOMER_NOTE_PREFIX.length).trim() || null;
    return {
      hotelPickupAddress: addressLine.trim(),
      customerNotes
    };
  }
  return {
    hotelPickupAddress: null,
    customerNotes: notes
  };
}