/** Shared display helpers for client booking/route surfaces. */

const FALLBACK_BUS_IMAGE = "/assets/client/images/kingexpressbus/sleeper/1.jpg";
const FALLBACK_CITY_IMAGE = "/assets/client/images/city_imgs/ha-noi.jpg";

export function formatMoney(amount, locale) {
  const n = Number(amount) || 0;
  return `${n.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}đ`;
}

export function formatIsoDate(iso) {
  if (!iso || typeof iso !== "string") return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function tripDurationMinutes(startTime, endTime) {
  const [sh, sm] = String(startTime).slice(0, 5).split(":").map(Number);
  const [eh, em] = String(endTime).slice(0, 5).split(":").map(Number);
  const start = sh * 60 + sm;
  let end = eh * 60 + em;
  if (end < start) end += 24 * 60;
  return end - start;
}

export function formatDurationMinutes(minutes, t) {
  const total = Math.max(0, Number(minutes) || 0);
  return t("trip_card.duration_format", {
    hours: Math.floor(total / 60),
    minutes: total % 60,
  });
}

/** Normalize bus/route image JSON (array | string | null) to a string[]. */
export function normalizeImageList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim());
  }
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

export function primaryBusImage(trip, fallback = FALLBACK_BUS_IMAGE) {
  const fromList = normalizeImageList(trip?.bus_images);
  if (fromList[0]) return fromList[0];
  if (typeof trip?.thumbnail_url === "string" && trip.thumbnail_url) {
    return trip.thumbnail_url;
  }
  return fallback;
}

export function routeThumbnail(route, fallback = FALLBACK_CITY_IMAGE) {
  if (typeof route?.thumbnail_url === "string" && route.thumbnail_url) {
    return route.thumbnail_url;
  }
  return fallback;
}

export { FALLBACK_BUS_IMAGE, FALLBACK_CITY_IMAGE };
