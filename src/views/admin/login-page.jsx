import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Đăng nhập quản trị — King Express Bus",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-bg px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-admin-lg border border-admin-border bg-admin-surface shadow-lg">
        <div className="bg-admin-primary px-6 py-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-white/80">
            King Express Bus
          </p>
          <h1 className="mt-1 text-base font-semibold text-white">
            Bảng điều khiển
          </h1>
          <p className="mt-0.5 text-xs text-white/80">
            Đăng nhập để quản trị hệ thống
          </p>
        </div>
        <div className="p-6">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
