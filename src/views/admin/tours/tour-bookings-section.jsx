"use client";

import { ServiceBookingsSection } from "@/components/admin/service-bookings-section";

const currency = new Intl.NumberFormat("vi-VN");

const columns = [
  { accessorKey: "booking_code", header: "Mã" },
  { accessorKey: "customer_name", header: "Khách" },
  { accessorKey: "tour_name_snapshot", header: "Tour" },
  { accessorKey: "tour_date", header: "Ngày" },
  { accessorKey: "guests", header: "SL" },
  {
    accessorKey: "total_price",
    header: "Tổng",
    cell: ({ getValue }) => `${currency.format(getValue())}đ`,
  },
];

export function TourBookingsSection() {
  return (
    <ServiceBookingsSection
      title="Đặt tour"
      description="Xác nhận / hoàn thành / hủy đặt tour Sa Pa"
      resourcePath="/admin/tour-bookings"
      columns={columns}
      renderDetail={(viewing, { statusLabel }) => (
        <>
          <p>
            <strong>{viewing.customer_name}</strong> · {viewing.customer_email}
          </p>
          <p>{viewing.tour_name_snapshot}</p>
          <p>
            {viewing.tour_date} · {viewing.guests} khách
          </p>
          <p>{currency.format(viewing.total_price)}đ</p>
          <p>TT: {statusLabel[viewing.status] ?? viewing.status}</p>
        </>
      )}
    />
  );
}
