/** Pure helpers for the client bus booking create form. */

export function formatBookingDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function formatBookingMoney(amount, locale) {
  return `${amount.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}đ`;
}

export function toPriceBreakdown(source) {
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

export function isPickupStop(stop) {
  return stop.stop_type === "pickup" || stop.stop_type === "both";
}

export function isDropoffStop(stop) {
  return stop.stop_type === "dropoff" || stop.stop_type === "both";
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function clearFieldError(id) {
  document.getElementById(id)?.classList.remove("field-error");
}

export function flagFieldError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("field-error");
  el.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function apiErrorMessage(err, fallback) {
  const body = err?.body;
  if (typeof body?.detail === "string") return body.detail;
  if (Array.isArray(body?.detail) && body.detail[0]?.msg) {
    return String(body.detail[0].msg);
  }
  return fallback;
}
