import { redirect } from "next/navigation";
import { getSepayReturn } from "@/services/booking-api";

// Backend already polls ~5x500ms for the IPN to land before returning
// (see GET /payments/sepay/return/{code}); we just await it and redirect.
export default async function SepaySuccessReturnPage({ params }) {
  const { code } = await params;
  const result = await getSepayReturn(code);
  // `sepay_returned=1` mirrors `sepay_payment_returned` session
  // flash (set in SePayController::success before its redirect) — this app
  // has no server session to carry that flag, so it rides the query string
  // to the success page instead, distinguishing "still verifying with SePay"
  // from "plain awaiting payment" messaging.
  const separator = result.success_url.includes("?") ? "&" : "?";
  redirect(`${result.success_url}${separator}sepay_returned=1`);
}
