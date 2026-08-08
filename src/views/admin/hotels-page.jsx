"use client";

import { PageHeader } from "@/components/admin/page-header";
import { HotelsSection } from "@/views/admin/hotels/hotels-section";

export default function AdminHotelsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Khách sạn"
        description="Quản lý khách sạn và loại phòng"
      />
      <HotelsSection />
    </div>
  );
}
