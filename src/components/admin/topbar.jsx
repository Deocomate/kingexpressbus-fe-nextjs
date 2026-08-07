"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { logout } from "@/services/admin-auth";
import { ADMIN_ROUTES } from "@/services/admin-routes";
import { useAdminUser } from "@/components/admin/auth-gate";
import { useAdminPage } from "@/components/admin/page-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminTopbar({ onMenuClick }) {
  const user = useAdminUser();
  const { title } = useAdminPage();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.replace(ADMIN_ROUTES.login);
      router.refresh();
    } catch {
      toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
      setLoggingOut(false);
    }
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-admin-border bg-admin-surface px-3 shadow-sm md:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 md:hidden"
          onClick={onMenuClick}
          aria-label="Mở menu"
        >
          <Menu className="size-4" />
        </Button>
        {title ? (
          <h2 className="truncate text-sm font-semibold text-admin-ink">
            {title}
          </h2>
        ) : (
          <span className="text-sm font-semibold text-admin-muted">
            Quản trị
          </span>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex max-w-[12rem] items-center gap-2 rounded-admin-md px-2 py-1.5 text-sm font-medium text-admin-ink hover:bg-admin-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-ring"
          aria-label="Tài khoản quản trị"
        >
          <span className="truncate">{user.name}</span>
          <ChevronDown className="size-4 shrink-0 text-admin-muted" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            destructive
            disabled={loggingOut}
            onSelect={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
