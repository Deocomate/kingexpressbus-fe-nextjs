"use client";

import { ServiceBookingsSection } from "@/components/admin/service-bookings-section";

const currency = new Intl.NumberFormat("vi-VN");

const columns = [
  { accessorKey: "booking_code", header: "Mã" },
  { accessorKey: "customer_name", header: "Khách" },
  { accessorKey: "hotel_name_snapshot", header: "Khách sạn" },
  { accessorKey: "room_name_snapshot", header: "Phòng" },
  { accessorKey: "check_in", header: "Nhận" },
  { accessorKey: "check_out", header: "Trả" },
  {
    accessorKey: "total_price",
    header: "Tổng",
    cell: ({ getValue }) => `${currency.format(getValue())}đ`,
  },
];

export function HotelBookingsSection() {
  return (
    <ServiceBookingsSection
      title="Đặt phòng"
      description="Xác nhận / hoàn thành / hủy đặt phòng khách sạn"
      resourcePath="/admin/hotel-bookings"
      columns={columns}
      renderDetail={(viewing, { statusLabel }) => (
        <>
          <p>
            <strong>{viewing.customer_name}</strong> · {viewing.customer_email}
          </p>
          <p>
            {viewing.hotel_name_snapshot} / {viewing.room_name_snapshot}
          </p>
          <p>
            {viewing.check_in} → {viewing.check_out} ({viewing.nights} đêm)
          </p>
          <p>{currency.format(viewing.total_price)}đ</p>
          <p>TT: {statusLabel[viewing.status] ?? viewing.status}</p>
        </>
      )}
    />
  );
}
