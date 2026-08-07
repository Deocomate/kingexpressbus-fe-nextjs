"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { ProvincesSection } from "@/views/admin/locations/provinces-section";
import { DistrictTypesSection } from "@/views/admin/locations/district-types-section";
import { DistrictsSection } from "@/views/admin/locations/districts-section";
import { StopsSection } from "@/views/admin/locations/stops-section";

export default function AdminLocationsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Địa điểm"
        description="Quản lý tỉnh, quận/huyện và điểm đón trả"
      />
      <Tabs defaultValue="provinces">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="provinces">Tỉnh/Thành phố</TabsTrigger>
          <TabsTrigger value="district-types">Loại khu vực</TabsTrigger>
          <TabsTrigger value="districts">Quận/Huyện</TabsTrigger>
          <TabsTrigger value="stops">Điểm đón/trả</TabsTrigger>
        </TabsList>
        <TabsContent value="provinces">
          <ProvincesSection />
        </TabsContent>
        <TabsContent value="district-types">
          <DistrictTypesSection />
        </TabsContent>
        <TabsContent value="districts">
          <DistrictsSection />
        </TabsContent>
        <TabsContent value="stops">
          <StopsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
