"use client";

import { PageHeader } from "@/components/admin/page-header";
import { SurchargesSection } from "@/views/admin/surcharges/surcharges-section";

export default function AdminSurchargesPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Phụ thu"
        description="Cấu hình phụ thu theo khoảng thời gian và tuyến"
      />
      <SurchargesSection />
    </div>
  );
}
