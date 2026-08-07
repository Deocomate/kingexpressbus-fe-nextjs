import "react-day-picker/style.css";
import { Toaster } from "@/components/ui/sonner";
export const metadata = {
  title: "King Express Bus — Quản trị"
};

// Shell root for every /quan-tri/* route, including the unauthenticated
// login page — sidebar/topbar/auth-gate live one level down in
// (dashboard)/layout.tsx so the login screen doesn't render them.
// Admin tokens live in admin.css, imported via globals.css for Tailwind.
export default function AdminRootLayout({
  children
}) {
  return <div className="admin-shell">{children}<Toaster /></div>;
}