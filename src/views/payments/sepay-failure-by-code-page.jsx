import Link from "next/link";
import messagesVi from "@/messages/vi.json";
import { localePath, CLIENT_ROUTES } from "@/services/client-routes";

const t = messagesVi.client.booking.sepay;

/**
 * SePay failure return — bare chrome (merchant return URL has no locale).
 * Clear failure copy + link to payment status for the booking.
 */
export default async function SepayFailedReturnPage({ params }) {
  const { code } = await params;
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6 py-12 font-sans">
      <div className="kx-panel-strong max-w-[420px] p-8 text-center">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-rose-50 text-lg font-extrabold text-dropoff"
          aria-hidden="true"
        >
          !
        </div>
        <h1 className="font-display text-xl font-extrabold text-ink">
          {t.payment_failed}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Mã đặt chỗ <span className="font-semibold text-ink">{code}</span>. Bạn
          có thể kiểm tra trạng thái thanh toán hoặc thử lại sau.
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
