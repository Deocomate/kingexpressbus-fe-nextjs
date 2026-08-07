"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminGet } from "@/services/admin-api";
import { AdminCard } from "@/components/admin/admin-card";
import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const SMALL_BOX_VARIANTS = {
  info: "bg-admin-info",
  success: "bg-admin-success",
  warning: "bg-admin-warn text-admin-ink",
  danger: "bg-admin-danger",
};

function SmallBox({ label, value, variant = "info" }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-admin-md shadow-md",
        SMALL_BOX_VARIANTS[variant],
      )}
    >
      <div className="px-4 py-3 text-white">
        <p
          className={cn(
            "text-[0.65rem] font-medium uppercase tracking-wide",
            variant === "warning" ? "text-admin-ink/70" : "text-white/80",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "mt-1 text-2xl font-bold tabular-nums",
            variant === "warning" ? "text-admin-ink" : "text-white",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => adminGet("/admin/dashboard/stats"),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <PageHeader title="Tổng quan" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const tiles = [
    { label: "Vé hôm nay", value: data.total_today, variant: "info" },
    { label: "Chờ xử lý", value: data.pending_total, variant: "warning" },
    {
      label: "Doanh thu hôm nay",
      value: currency.format(data.revenue_today),
      variant: "success",
    },
    {
      label: "Tổng doanh thu",
      value: currency.format(data.total_revenue),
      variant: "danger",
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tổng quan"
        description="Thống kê vận hành hôm nay"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <SmallBox
            key={tile.label}
            label={tile.label}
            value={tile.value}
            variant={tile.variant}
          />
        ))}
      </div>

      <AdminCard title="Doanh thu 12 tháng gần nhất" bodyClassName="p-3">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthly_revenue}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-admin-border)"
              />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(
                    v,
                  )
                }
              />
              <Tooltip formatter={(v) => currency.format(Number(v))} />
              <Bar
                dataKey="total"
                fill="var(--color-admin-primary)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AdminCard>

      <AdminCard title="Theo trạng thái" bodyClassName="p-3">
        <ul className="flex flex-wrap gap-2 text-xs">
          {Object.entries(data.status_counts).map(([status, count]) => (
            <li
              key={status}
              className="rounded-admin-sm bg-admin-surface-hover px-2.5 py-1 text-admin-muted"
            >
              {STATUS_LABELS[status] ?? status}:{" "}
              <span className="font-semibold text-admin-ink">{count}</span>
            </li>
          ))}
        </ul>
      </AdminCard>
    </div>
  );
}
