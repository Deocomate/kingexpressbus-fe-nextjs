"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getPaymentStatus } from "@/services/booking-api";
import {
  FeedbackError,
  FeedbackLoading,
} from "@/components/client/feedback-state";

/** Standalone panel used by /dat-ve/trang-thai-thanh-toan/{code}. */
export function PaymentStatusPoller({ code }) {
  const t = useTranslations("client.booking");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer;
    async function poll() {
      try {
        const result = await getPaymentStatus(code);
        if (cancelled) return;
        setStatus(result);
        if (result.payment_status !== "paid") {
          timer = setTimeout(poll, 3000);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code]);

  if (error) {
    return (
      <FeedbackError
        title={t("store.system_error")}
        description={t("common.updating")}
      />
    );
  }
  if (!status || !status.found) {
    return <FeedbackLoading label={t("common.updating")} />;
  }

  const paid = status.payment_status === "paid";
  return (
    <div className="kx-panel-strong space-y-3 p-6 text-center">
      <p className="font-header text-xl font-bold text-ink">
        {status.booking_code}
      </p>
      <p
        className={`text-sm font-semibold ${paid ? "text-pickup" : "text-warn"}`}
        role="status"
        aria-live="polite"
      >
        {paid ? t("success.paid") : t("success.unpaid")}
      </p>
      {!paid ? (
        <p className="text-sm text-muted">{t("common.updating")}</p>
      ) : null}
    </div>
  );
}

const PaidContext = createContext(null);

export function BookingPaymentStatusProvider({
  code,
  initialPaid,
  pollingEnabled,
  children,
}) {
  const [paid, setPaid] = useState(initialPaid);
  useEffect(() => {
    if (paid || !pollingEnabled) return;
    let cancelled = false;
    let attempts = 0;
    let timer;
    async function poll() {
      attempts += 1;
      try {
        const result = await getPaymentStatus(code);
        if (!cancelled && result.payment_status === "paid") {
          setPaid(true);
          return;
        }
      } catch {
        // Keep polling briefly; IPN may arrive after redirect.
      }
      if (!cancelled && attempts < 20) timer = setTimeout(poll, 3000);
    }
    timer = setTimeout(poll, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, paid, pollingEnabled]);
  return <PaidContext.Provider value={paid}>{children}</PaidContext.Provider>;
}

function usePaid(fallback) {
  const ctx = useContext(PaidContext);
  return ctx ?? fallback;
}

export function PaymentStatusBadge({ initialPaid, size = "md" }) {
  const t = useTranslations("client.booking.success");
  const paid = usePaid(initialPaid);
  const base =
    size === "sm" ? "gap-1 px-3 py-1 text-xs" : "gap-2 px-4 py-2 text-xs";
  return (
    <span
      data-payment-status-badge
      className={`inline-flex items-center rounded-sm font-semibold ${base} ${paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
    >
      {paid ? t("paid") : t("unpaid")}
    </span>
  );
}

export function PaymentHeroBanner({ initialPaid, isOnlineBanking, verifying }) {
  const t = useTranslations("client.booking.success");
  const paid = usePaid(initialPaid);
  if (paid) {
    return (
      <div
        id="online-payment-success-message"
        className="mx-auto mt-5 max-w-2xl rounded-sm border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold leading-relaxed text-green-800"
      >
        {t("online_payment_success_message")}
      </div>
    );
  }
  if (!isOnlineBanking) return null;
  return (
    <div
      id="online-payment-pending-message"
      className="mx-auto mt-5 max-w-2xl rounded-sm border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold leading-relaxed text-amber-800"
    >
      {verifying
        ? t("online_payment_verifying_message")
        : t("online_payment_pending_message")}
    </div>
  );
}

export function PaymentSidebarNote({ initialPaid, verifying }) {
  const t = useTranslations("client.booking.success");
  const paid = usePaid(initialPaid);
  if (paid) return null;
  return (
    <div
      id="online-payment-note"
      className="mt-4 rounded-sm border border-primary-100 bg-primary-50 p-3 text-xs text-primary-700"
    >
      {verifying
        ? t("online_payment_verifying_note")
        : t("online_payment_note")}
    </div>
  );
}
