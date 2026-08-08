import { getTranslations, setRequestLocale } from "next-intl/server";
import { PaymentStatusPoller } from "@/components/client/payment-status-poller";
import { buildPageMetadata } from "@/lib/seo";
import { CLIENT_ROUTES } from "@/services/client-routes";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "client.booking.success",
  });
  return buildPageMetadata({
    title: t("meta_title"),
    description: t("meta_description"),
    locale,
    path: CLIENT_ROUTES.paymentStatus,
    noIndex: true,
  });
}

export default async function PaymentStatusPage({ params }) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  return (
    <main className="ksb-container ksb-section-hero mx-auto max-w-md">
      <PaymentStatusPoller code={code} />
    </main>
  );
}
