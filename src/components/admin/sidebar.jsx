"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Bus,
  Route as RouteIcon,
  Truck,
  MapPin,
  CircleDollarSign,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { ADMIN_ROUTES } from "@/services/admin-routes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { label: "Tổng quan", href: ADMIN_ROUTES.dashboard, icon: LayoutDashboard },
  { label: "Đặt vé", href: ADMIN_ROUTES.bookings, icon: Ticket },
  { label: "Địa điểm", href: ADMIN_ROUTES.locations, icon: MapPin },
  { label: "Đội xe", href: ADMIN_ROUTES.buses, icon: Truck },
  { label: "Tuyến đường", href: ADMIN_ROUTES.routes, icon: RouteIcon },
  { label: "Chuyến xe", href: ADMIN_ROUTES.trips, icon: Bus },
  { label: "Phụ thu", href: ADMIN_ROUTES.surcharges, icon: CircleDollarSign },
  { label: "Cấu hình website", href: ADMIN_ROUTES.website, icon: Settings },
];

const STORAGE_KEY = "admin-sidebar-collapsed";

function NavLinks({ collapsed, onNavigate }) {
  const pathname = usePathname();

  return (
    <nav
      className="flex-1 space-y-0.5 overflow-y-auto p-2"
      aria-label="Điều hướng quản trị"
    >
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === ADMIN_ROUTES.dashboard
            ? pathname === item.href
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-admin-sm px-2.5 py-2 text-sm font-medium transition-colors",
              active
                ? "border-l-[3px] border-admin-sidebar-active bg-white/10 text-white"
                : "border-l-[3px] border-transparent text-admin-sidebar-text hover:bg-admin-sidebar-hover hover:text-white",
              collapsed && "justify-center px-2",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarToggle({ collapsed, onCollapsedChange }) {
  return (
    <button
      type="button"
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-admin-sm text-admin-sidebar-text transition-colors hover:bg-admin-sidebar-hover hover:text-white"
      onClick={() => onCollapsedChange(!collapsed)}
      aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
    >
      {collapsed ? (
        <PanelLeft className="size-4" />
      ) : (
        <PanelLeftClose className="size-4" />
      )}
    </button>
  );
}

export function AdminSidebar({
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
}) {
  return (
    <>
      <aside
        className={cn(
          "hidden h-full shrink-0 flex-col bg-admin-sidebar transition-[width] duration-200 md:flex",
          collapsed ? "w-14" : "w-56",
        )}
      >
        <div
          className={cn(
            "flex h-12 shrink-0 items-center border-b border-black/20 px-3",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed ? (
            <span className="truncate text-xs font-bold uppercase tracking-wide text-white">
              King Express
            </span>
          ) : null}
          <SidebarToggle
            collapsed={collapsed}
            onCollapsedChange={onCollapsedChange}
          />
        </div>
        <NavLinks collapsed={collapsed} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          size="sm"
          className="border-0 bg-admin-sidebar p-0 md:hidden [&_button]:text-white [&_button]:hover:bg-white/20"
        >
          <SheetHeader className="border-b border-black/20 bg-admin-sidebar">
            <SheetTitle className="text-white">King Express Bus</SheetTitle>
          </SheetHeader>
          <NavLinks
            collapsed={false}
            onNavigate={() => onMobileOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  function handleCollapsedChange(next) {
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
  }

  return {
    collapsed,
    setCollapsed: handleCollapsedChange,
    mobileOpen,
    setMobileOpen,
  };
}
