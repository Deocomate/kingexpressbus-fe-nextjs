import { redirect } from "next/navigation";
import Link from "next/link";
import { ApiError } from "@/services/api-base";
import { getSepayCheckout } from "@/services/booking-api";
import { SepayAutoSubmitForm } from "@/components/client/sepay-auto-submit-form";
import { localePath, CLIENT_ROUTES } from "@/services/client-routes";
import messagesVi from "@/messages/vi.json";

const t = messagesVi.client.booking.sepay;

export default async function SepayRedirectPage({ params }) {
  const { code } = await params;
  let result;
  try {
    result = await getSepayCheckout(code);
  } catch (err) {
    const message =
      err instanceof ApiError &&
      typeof err.body === "object" &&
      err.body &&
      "detail" in err.body
        ? String(err.body.detail)
        : t.payment_failed;
    return (
      <main className="flex min-h-screen items-center justify-center bg-page px-6 py-12 font-sans">
        <div className="kx-panel-strong max-w-[420px] p-8 text-center">
          <h1 className="font-display text-xl font-extrabold text-dropoff">
            {message}
          </h1>
          <p className="mt-3 text-sm text-muted">
            Không thể chuyển sang cổng thanh toán cho mã{" "}
            <span className="font-semibold text-ink">{code}</span>.
          </p>
          <Link
            href={`${localePath("vi", CLIENT_ROUTES.paymentStatus)}/${code}`}
            className="kx-btn-primary mt-6 inline-flex px-5 py-2.5 text-sm"
          >
            Xem trạng thái thanh toán
          </Link>
        </div>
      </main>
    );
  }
  if ("already_paid" in result) {
    redirect(result.success_url);
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6 py-12 font-sans text-ink">
      <div className="kx-panel-strong max-w-[420px] p-8 text-center">
        <div
          className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600"
          aria-hidden="true"
        />
        <h1 className="mb-3 font-display text-xl font-extrabold text-ink">
          {t.redirect_heading}
        </h1>
        <p className="leading-relaxed text-muted" role="status" aria-live="polite">
          {t.redirect_message.replace(":code", code)}
        </p>
        <SepayAutoSubmitForm htmlForm={result.html_form} />
      </div>
    </main>
  );
}
