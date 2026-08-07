"use client";

import { PageHeader } from "@/components/admin/page-header";
import { RoutesSection } from "@/views/admin/routes/routes-section";

export default function AdminRoutesPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Tuyến đường"
        description="Quản lý tuyến, giá và điểm dừng"
      />
      <RoutesSection />
    </div>
  );
}
