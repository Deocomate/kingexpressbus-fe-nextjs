"use client";

import { AdminQueryProvider } from "@/components/admin/query-provider";
import { AuthGate } from "@/components/admin/auth-gate";
import {
  AdminSidebar,
  useSidebarState,
} from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { AdminPageProvider } from "@/components/admin/page-context";

export default function AdminDashboardLayout({ children }) {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } =
    useSidebarState();

  return (
    <AdminQueryProvider>
      <AuthGate>
        <AdminPageProvider>
          <div className="flex h-screen overflow-hidden">
            <AdminSidebar
              collapsed={collapsed}
              onCollapsedChange={setCollapsed}
              mobileOpen={mobileOpen}
              onMobileOpenChange={setMobileOpen}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <AdminTopbar onMenuClick={() => setMobileOpen(true)} />
              <main className="min-h-0 flex-1 overflow-y-auto p-3 md:p-4">
                {children}
              </main>
            </div>
          </div>
        </AdminPageProvider>
      </AuthGate>
    </AdminQueryProvider>
  );
}
