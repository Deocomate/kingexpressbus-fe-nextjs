"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Pencil, Plus } from "lucide-react";
import { getBookingCounts } from "@/services/admin-bookings";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/data-table/data-table";
import { AdminCard } from "@/components/admin/admin-card";
import { BookingDetailDialog } from "@/views/admin/bookings/booking-detail-sheet";
import { BookingFormDialog } from "@/views/admin/bookings/booking-form";

const TABS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

const STATUS_VARIANT = {
  pending: "warning",
  confirmed: "default",
  completed: "success",
  cancelled: "destructive",
};

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const currency = new Intl.NumberFormat("vi-VN");

export function BookingsSection() {
  const [tab, setTab] = useState("all");
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const tableHandle = useRef(null);

  const { data: counts, refetch: refetchCounts } = useQuery({
    queryKey: ["admin-booking-counts"],
    queryFn: getBookingCounts,
  });

  function refreshAll() {
    tableHandle.current?.invalidate();
    refetchCounts();
  }

  const columns = [
    { accessorKey: "booking_code", header: "Mã vé" },
    { accessorKey: "customer_name", header: "Khách hàng" },
    { accessorKey: "customer_phone", header: "Điện thoại" },
    {
      accessorKey: "created_at",
      header: "Ngày đặt",
      cell: ({ getValue }) => {
        const value = getValue();
        if (!value) return "—";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    { accessorKey: "booking_date", header: "Ngày đi" },
    { accessorKey: "quantity", header: "SL" },
    {
      accessorKey: "total_price",
      header: "Tổng tiền",
      cell: ({ getValue }) => `${currency.format(getValue())}đ`,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ getValue }) => {
        const status = getValue();
        return (
          <Badge variant={STATUS_VARIANT[status]}>
            {STATUS_LABEL[status] ?? status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Xem"
            onClick={() => setViewing(row.original)}
          >
            <Eye className="size-3.5" />
          </Button>
          {row.original.status !== "cancelled" &&
          row.original.status !== "completed" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Sửa"
              onClick={() => setEditing(row.original)}
            >
              <Pencil className="size-3.5" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Đặt vé"
        description="Quản lý đặt vé và trạng thái chuyến đi"
        actions={
          <Button type="button" size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-3.5" />
            Tạo đặt vé
          </Button>
        }
        filters={
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="h-auto flex-wrap">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                  {counts ? ` (${counts[t.value]})` : ""}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      />

      <AdminCard title="Danh sách đặt vé" bodyClassName="p-0">
        <DataTable
          resourcePath="/admin/bookings"
          columns={columns}
          enableSelection={false}
          extraParams={{ status: tab === "all" ? undefined : tab }}
          onReady={(h) => {
            tableHandle.current = h;
          }}
        />
      </AdminCard>

      <BookingDetailDialog
        booking={viewing}
        open={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        onChanged={() => {
          refreshAll();
          setViewing(null);
        }}
      />
      <BookingFormDialog
        open={!!editing}
        editing={editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSaved={refreshAll}
      />
      <BookingFormDialog
        open={creating}
        editing={null}
        onOpenChange={setCreating}
        onSaved={refreshAll}
      />
    </div>
  );
}
