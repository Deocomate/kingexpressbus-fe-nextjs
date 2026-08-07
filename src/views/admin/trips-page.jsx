"use client";

import { PageHeader } from "@/components/admin/page-header";
import { TripsSection } from "@/views/admin/trips/trips-section";

export default function AdminTripsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Chuyến xe"
        description="Lịch chuyến, giá và chặn lịch"
      />
      <TripsSection />
    </div>
  );
}
