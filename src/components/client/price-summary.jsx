import { useTranslations } from "next-intl";
function formatMoney(amount, locale) {
  return `${amount.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}đ`;
}
export function PriceSummary({
  baseUnitPrice,
  globalSurchargeUnit,
  routeSurchargeUnit,
  finalUnitPrice,
  surchargeSnapshot,
  quantity,
  totalPrice,
  locale,
}) {
  const t = useTranslations("client.booking.create");
  return (
    <>
      <div className="space-y-2 text-sm text-muted">
        <div className="flex items-center justify-between">
          <span>{t("summary_base_price")}</span>
          <span className="font-semibold text-ink">
            {baseUnitPrice > 0
              ? formatMoney(baseUnitPrice, locale)
              : t("summary_contact_price")}
          </span>
        </div>
        {globalSurchargeUnit > 0 && (
          <div className="flex items-center justify-between">
            <span>{t("summary_global_surcharge")}</span>
            <span className="font-semibold text-brand-700">
              +{formatMoney(globalSurchargeUnit, locale)}
            </span>
          </div>
        )}
        {routeSurchargeUnit > 0 && (
          <div className="flex items-center justify-between">
            <span>{t("summary_route_surcharge")}</span>
            <span className="font-semibold text-brand-700">
              +{formatMoney(routeSurchargeUnit, locale)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span>{t("summary_price_per_ticket")}</span>
          <span className="font-semibold text-ink">
            {finalUnitPrice > 0
              ? formatMoney(finalUnitPrice, locale)
              : t("summary_contact_price")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>{t("summary_quantity")}</span>
          <span className="font-semibold text-ink">{quantity}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{t("summary_service_fee")}</span>
          <span className="font-semibold text-green-600">
            {t("summary_free")}
          </span>
        </div>
        {surchargeSnapshot && (
          <p className="pt-1 text-xs leading-relaxed text-brand-800">
            {t("summary_surcharge_note")}: {surchargeSnapshot}
          </p>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-lg font-bold text-ink">
        <span>{t("summary_total")}</span>
        <span className="ksb-price">{formatMoney(totalPrice, locale)}</span>
      </div>
    </>
  );
}
