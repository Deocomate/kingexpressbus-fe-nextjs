// Admin-only auth calls. Shares the same httpOnly session cookie as the
// client portal (see src/services/client-auth.js) — /admin/auth/login just adds a
// role="admin" check + stricter rate limit server-side. /auth/me and
// /auth/logout are reused as-is since the cookie/role model is shared.
import { apiFetch } from "@/services/api-base";
import { getMe, logout } from "@/services/client-auth";
export { getMe, logout };
export function adminLogin(input) {
  return apiFetch("/admin/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(input)
  });
}
