import Link from "next/link";
import messagesVi from "@/messages/vi.json";
import { localePath, CLIENT_ROUTES } from "@/services/client-routes";

const t = messagesVi.client.booking.sepay;

/** SePay cancel return — bare chrome; clear pending/cancelled copy. */
export default async function SepayCancelledReturnPage({ params }) {
  const { code } = await params;
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6 py-12 font-sans">
      <div className="kx-panel-strong max-w-[420px] p-8 text-center">
        <h1 className="font-display text-xl font-extrabold text-ink">
          {t.payment_cancelled}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Mã đặt chỗ <span className="font-semibold text-ink">{code}</span> chưa
          được thanh toán. Bạn có thể quay lại trạng thái vé bất cứ lúc nào.
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
