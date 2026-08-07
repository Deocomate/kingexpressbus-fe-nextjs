"use client";

/**
 * Auth gate: GET /auth/me with browser cookies; redirect non-admins to login.
 * Client-side because the FE/API origin split makes RSC cookie forwarding impractical.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/services/api-base";
import { getMe } from "@/services/admin-auth";
import { ADMIN_ROUTES } from "@/services/admin-routes";

const AdminUserContext = createContext(null);

export function AuthGate({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState("checking");
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((u) => {
        if (cancelled) return;
        if (u.role !== "admin") {
          setStatus("redirecting");
          router.replace(ADMIN_ROUTES.login);
          return;
        }
        setUser(u);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("redirecting");
        router.replace(ADMIN_ROUTES.login);
        if (!(err instanceof ApiError && err.status === 401)) {
          // Still redirect; gate never renders children on failure.
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status !== "ready" || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-admin-muted">
        Đang kiểm tra đăng nhập…
      </div>
    );
  }

  return (
    <AdminUserContext.Provider value={user}>{children}</AdminUserContext.Provider>
  );
}

export function useAdminUser() {
  const user = useContext(AdminUserContext);
  if (!user) throw new Error("useAdminUser must be used within AuthGate");
  return user;
}
