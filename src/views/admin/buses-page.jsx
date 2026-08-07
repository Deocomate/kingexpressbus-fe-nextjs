"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { BusesSection } from "@/views/admin/fleet/buses-section";
import { BusServicesSection } from "@/views/admin/fleet/bus-services-section";

export default function AdminBusesPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Đội xe"
        description="Quản lý xe và tiện ích trên xe"
      />
      <Tabs defaultValue="buses">
        <TabsList>
          <TabsTrigger value="buses">Xe</TabsTrigger>
          <TabsTrigger value="services">Tiện ích</TabsTrigger>
        </TabsList>
        <TabsContent value="buses">
          <BusesSection />
        </TabsContent>
        <TabsContent value="services">
          <BusServicesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
