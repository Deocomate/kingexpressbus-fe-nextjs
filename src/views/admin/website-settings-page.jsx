"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { WebProfileSection } from "@/views/admin/website/web-profile-section";
import { MenuTreeEditor } from "@/views/admin/editors/menu-tree-editor";

export default function AdminWebsitePage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Cấu hình website"
        description="Hồ sơ thương hiệu và cấu trúc menu"
      />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Hồ sơ website</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <WebProfileSection />
        </TabsContent>
        <TabsContent value="menu">
          <MenuTreeEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
