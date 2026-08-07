import { setRequestLocale } from "next-intl/server";
import { PaymentStatusPoller } from "@/components/client/payment-status-poller";
export default async function PaymentStatusPage({ params }) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  return (
    <main className="ksb-container ksb-section-hero mx-auto max-w-md">
      <PaymentStatusPoller code={code} />
    </main>
  );
}
