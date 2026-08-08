"use client";

import { PageHeader } from "@/components/admin/page-header";
import { ToursSection } from "@/views/admin/tours/tours-section";

export default function AdminToursPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Tour" description="Quản lý tour Sa Pa" />
      <ToursSection />
    </div>
  );
}
