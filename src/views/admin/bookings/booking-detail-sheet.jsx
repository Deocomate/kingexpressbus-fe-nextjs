"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  adminCancelBooking,
  adminCompleteBooking,
  adminConfirmBooking,
} from "@/services/admin-bookings";
import { parseBookingNotes } from "@/utils/booking-notes";
import { getErrorMessage } from "@/services/admin-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConfirmDialog } from "@/components/admin/confirm-dialog";

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const currency = new Intl.NumberFormat("vi-VN");

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-admin-border py-2 text-sm last:border-0">
      <span className="shrink-0 text-admin-muted">{label}</span>
      <span className="text-right text-admin-ink">{value}</span>
    </div>
  );
}

export function BookingDetailDialog({
  booking,
  open,
  onOpenChange,
  onChanged,
}) {
  const [pending, setPending] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const { confirm, dialog } = useConfirmDialog();

  if (!booking) return null;

  const { hotelPickupAddress, customerNotes } = parseBookingNotes(
    booking.notes,
  );

  async function run(action) {
    setPending(true);
    try {
      await action();
      toast.success("Đã cập nhật");
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể cập nhật."));
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" headerVariant="primary">
        <DialogHeader variant="primary">
          <DialogTitle variant="primary">Đặt vé {booking.booking_code}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Row
            label="Trạng thái"
            value={
              <Badge>{STATUS_LABEL[booking.status] ?? booking.status}</Badge>
            }
          />
          <Row label="Khách hàng" value={booking.customer_name} />
          <Row label="Điện thoại" value={booking.customer_phone} />
          <Row label="Email" value={booking.customer_email ?? "—"} />
          <Row label="Ngày đi" value={booking.booking_date} />
          <Row label="Số lượng" value={booking.quantity} />
          <Row
            label="Tổng tiền"
            value={`${currency.format(booking.total_price)}đ`}
          />
          <Row
            label="Thanh toán"
            value={`${booking.payment_method === "online_banking" ? "Chuyển khoản" : "Tiền mặt"} — ${booking.payment_status}`}
          />
          {booking.surcharge_reason_snapshot ? (
            <Row
              label="Lý do phụ thu"
              value={booking.surcharge_reason_snapshot}
            />
          ) : null}
          {hotelPickupAddress ? (
            <Row label="Đón tại khách sạn" value={hotelPickupAddress} />
          ) : null}
          {customerNotes ? <Row label="Ghi chú" value={customerNotes} /> : null}
        </DialogBody>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {booking.status === "pending" ? (
            <Button
              type="button"
              className="w-full"
              size="sm"
              disabled={pending}
              onClick={() =>
                confirm({
                  title: "Xác nhận đặt vé này?",
                  destructive: false,
                  onConfirm: () => run(() => adminConfirmBooking(booking.id)),
                })
              }
            >
              Xác nhận đặt vé
            </Button>
          ) : null}
          {booking.status === "confirmed" ? (
            <Button
              type="button"
              className="w-full"
              size="sm"
              disabled={pending}
              onClick={() =>
                confirm({
                  title: "Đánh dấu hoàn thành chuyến đi?",
                  destructive: false,
                  onConfirm: () => run(() => adminCompleteBooking(booking.id)),
                })
              }
            >
              Hoàn thành
            </Button>
          ) : null}
          {booking.status !== "cancelled" &&
          booking.status !== "completed" ? (
            <div className="w-full space-y-2">
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Lý do hủy (tùy chọn)"
                rows={2}
              />
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                size="sm"
                disabled={pending}
                onClick={() =>
                  confirm({
                    title: "Hủy đặt vé này?",
                    onConfirm: () =>
                      run(() =>
                        adminCancelBooking(booking.id, cancelReason),
                      ),
                  })
                }
              >
                Hủy đặt vé
              </Button>
            </div>
          ) : null}
        </DialogFooter>
        {dialog}
      </DialogContent>
    </Dialog>
  );
}

/** @deprecated Use BookingDetailDialog */
export const BookingDetailSheet = BookingDetailDialog;
