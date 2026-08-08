"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { getTripDetail } from "@/services/booking-api";
import {
  adminCreateBooking,
  adminUpdateBooking,
} from "@/services/admin-bookings";
import { parseBookingNotes } from "@/utils/booking-notes";
import { adminGet, getErrorMessage } from "@/services/admin-api";
import { ApiError } from "@/services/api-base";
import { OptionsCombobox } from "@/components/admin/options-combobox";
import { DatePicker } from "@/components/admin/date-picker";
import { FormSection } from "@/components/admin/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  trip: z
    .object({ id: z.number(), text: z.string() })
    .nullable(),
  booking_date: z.string().min(1, "Bắt buộc"),
  quantity: z.number().min(1),
  customer_name: z.string().min(1, "Bắt buộc"),
  customer_phone: z.string().min(1, "Bắt buộc"),
  customer_email: z.string().nullable(),
  is_hotel_pickup: z.boolean(),
  pickup_stop_id: z.number().nullable(),
  hotel_pickup_address: z.string().nullable(),
  dropoff_stop_id: z.number().nullable(),
  payment_method: z.enum(["cash_on_pickup", "online_banking"]),
  notes: z.string().nullable(),
});

function emptyValues() {
  return {
    trip: null,
    booking_date: "",
    quantity: 1,
    customer_name: "",
    customer_phone: "",
    customer_email: null,
    is_hotel_pickup: false,
    pickup_stop_id: null,
    hotel_pickup_address: null,
    dropoff_stop_id: null,
    payment_method: "cash_on_pickup",
    notes: null,
  };
}

export function BookingFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}) {
  const [tripDetail, setTripDetail] = useState(null);
  const [loadingTrip, setLoadingTrip] = useState(false);

  const { data: webProfiles } = useQuery({
    queryKey: ["admin-web-profiles"],
    queryFn: () => adminGet("/admin/web-profiles"),
    enabled: open && !editing,
  });
  const defaultProfile =
    (webProfiles ?? []).find((p) => p.is_default) ?? (webProfiles ?? [])[0];
  const onlinePaymentEnabled =
    defaultProfile?.online_payment_enabled !== false;

  const form = useForm({
    resolver: zodResolver(schema),
    values: open
      ? editing
        ? (() => {
            const { hotelPickupAddress, customerNotes } = parseBookingNotes(
              editing.notes,
            );
            return {
              trip: { id: editing.trip_id, text: `#${editing.trip_id}` },
              booking_date: editing.booking_date,
              quantity: editing.quantity,
              customer_name: editing.customer_name,
              customer_phone: editing.customer_phone,
              customer_email: editing.customer_email,
              is_hotel_pickup: editing.pickup_stop_id == null,
              pickup_stop_id: editing.pickup_stop_id,
              hotel_pickup_address: hotelPickupAddress,
              dropoff_stop_id: editing.dropoff_stop_id,
              payment_method: editing.payment_method,
              notes: customerNotes,
            };
          })()
        : emptyValues()
      : undefined,
  });

  const trip = form.watch("trip");
  const bookingDate = form.watch("booking_date");
  const isHotelPickup = form.watch("is_hotel_pickup");
  const quantity = form.watch("quantity");
  const availableStops = tripDetail?.stops ?? [];
  const finalUnitPrice = tripDetail?.price_breakdown?.final_unit_price ?? null;

  useEffect(() => {
    if (!trip || !bookingDate) {
      setTripDetail(null);
      return;
    }
    let cancelled = false;
    setLoadingTrip(true);
    getTripDetail(trip.id, bookingDate)
      .then((d) => !cancelled && setTripDetail(d))
      .catch(() => !cancelled && setTripDetail(null))
      .finally(() => !cancelled && setLoadingTrip(false));
    return () => {
      cancelled = true;
    };
  }, [trip, bookingDate]);

  useEffect(() => {
    if (editing || onlinePaymentEnabled) return;
    if (form.getValues("payment_method") === "online_banking") {
      form.setValue("payment_method", "cash_on_pickup");
    }
  }, [editing, onlinePaymentEnabled, form]);

  async function onSubmit(values) {
    try {
      if (editing) {
        if (values.is_hotel_pickup && !values.hotel_pickup_address?.trim()) {
          toast.error("Nhập địa chỉ đón tại khách sạn.");
          return;
        }
        await adminUpdateBooking(editing.id, {
          customer_name: values.customer_name,
          customer_phone: values.customer_phone,
          customer_email: values.customer_email,
          dropoff_stop_id: values.dropoff_stop_id,
          pickup_stop_id: values.is_hotel_pickup ? null : values.pickup_stop_id,
          quantity: values.quantity,
          notes: values.notes,
          hotel_pickup_address: values.is_hotel_pickup
            ? values.hotel_pickup_address
            : null,
        });
      } else {
        if (!tripDetail?.price_breakdown) {
          toast.error("Chưa tính được giá — chọn chuyến và ngày trước.");
          return;
        }
        const totalPrice =
          tripDetail.price_breakdown.final_unit_price * values.quantity;
        await adminCreateBooking({
          trip_id: values.trip.id,
          booking_date: values.booking_date,
          quantity: values.quantity,
          customer_name: values.customer_name,
          customer_phone: values.customer_phone,
          customer_email: values.customer_email || "",
          dropoff_stop_id: values.dropoff_stop_id,
          total_price: totalPrice,
          payment_method: values.payment_method,
          pickup_stop_id: values.is_hotel_pickup ? null : values.pickup_stop_id,
          is_hotel_pickup: values.is_hotel_pickup,
          hotel_pickup_address: values.hotel_pickup_address,
          notes: values.notes,
        });
      }
      toast.success("Đã lưu");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error(
          "Giá đã thay đổi — vui lòng thử lại để lấy giá mới nhất.",
        );
        return;
      }
      if (err instanceof ApiError && err.status === 422) {
        toast.error(
          getErrorMessage(err, "Không đủ chỗ hoặc dữ liệu không hợp lệ."),
        );
        return;
      }
      toast.error(getErrorMessage(err, "Không thể lưu."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? `Sửa đặt vé ${editing.booking_code}`
              : "Tạo đặt vé mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
            noValidate
          >
            <DialogBody className="space-y-4">
              {!editing ? (
                <FormSection title="Chuyến & ngày" columns={2}>
                  <FormField
                    control={form.control}
                    name="trip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chuyến xe</FormLabel>
                        <FormControl>
                          <OptionsCombobox
                            resource="trips"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="booking_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày đi</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {loadingTrip ? (
                    <p className="text-sm text-admin-muted sm:col-span-2">
                      Đang tải giá…
                    </p>
                  ) : finalUnitPrice != null ? (
                    <p className="text-sm text-admin-ink sm:col-span-2">
                      Đơn giá:{" "}
                      {new Intl.NumberFormat("vi-VN").format(finalUnitPrice)}đ
                      × {quantity} ={" "}
                      <strong>
                        {new Intl.NumberFormat("vi-VN").format(
                          finalUnitPrice * quantity,
                        )}
                        đ
                      </strong>
                    </p>
                  ) : null}
                </FormSection>
              ) : null}

              <FormSection title="Khách hàng" columns={2}>
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên khách</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customer_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điện thoại</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customer_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng vé</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <FormSection title="Điểm đón/trả">
                <FormField
                  control={form.control}
                  name="is_hotel_pickup"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0 sm:col-span-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">
                        Đón tại khách sạn
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {isHotelPickup ? (
                  <FormField
                    control={form.control}
                    name="hotel_pickup_address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Địa chỉ khách sạn</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="pickup_stop_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Điểm đón</FormLabel>
                        <FormControl>
                          <Select
                            value={
                              field.value != null
                                ? String(field.value)
                                : undefined
                            }
                            onValueChange={(v) => field.onChange(Number(v))}
                            disabled={availableStops.length === 0}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Chọn điểm đón" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableStops
                                .filter((s) => s.stop_type !== "dropoff")
                                .map((s) => (
                                  <SelectItem
                                    key={s.stop_id}
                                    value={String(s.stop_id)}
                                  >
                                    {s.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="dropoff_stop_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điểm trả</FormLabel>
                      <FormControl>
                        <Select
                          value={
                            field.value != null
                              ? String(field.value)
                              : undefined
                          }
                          onValueChange={(v) => field.onChange(Number(v))}
                          disabled={availableStops.length === 0}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Chọn điểm trả" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableStops
                              .filter((s) => s.stop_type !== "pickup")
                              .map((s) => (
                                <SelectItem
                                  key={s.stop_id}
                                  value={String(s.stop_id)}
                                >
                                  {s.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              {!editing ? (
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hình thức thanh toán</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash_on_pickup">
                              Tiền mặt khi lên xe
                            </SelectItem>
                            {onlinePaymentEnabled ? (
                              <SelectItem value="online_banking">
                                Chuyển khoản (SePay)
                              </SelectItem>
                            ) : null}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : null}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} rows={2} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Đang lưu…" : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/** @deprecated Use BookingFormDialog */
export const BookingFormSheet = BookingFormDialog;
