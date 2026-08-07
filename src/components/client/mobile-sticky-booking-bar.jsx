"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Port of the `#mobile-booking-bar` IntersectionObserver toggle in
 * routes/show.blade.php: hidden while `#availabilities` is on screen,
 * slides up once the user scrolls past it.
 */
export function MobileStickyBookingBar({ lowestPrice, locale }) {
  const t = useTranslations("client.route_show");
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const target = document.getElementById("availabilities");
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      {
        threshold: 0.3,
      },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`ksb-alert ksb-mobile-action-bar fixed bottom-0 left-0 right-0 transform border-t border-line bg-surface shadow-card transition-transform duration-300 lg:hidden ${visible ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted">{t("mobile_bar.from")}</p>
            <p className="text-xl font-bold text-brand-600">
              {lowestPrice.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}đ
            </p>
          </div>
          <a
            href="#availabilities"
            className="ksb-btn-primary max-w-40 flex-1 px-6 text-sm"
          >
            {t("mobile_bar.view_trips")}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
