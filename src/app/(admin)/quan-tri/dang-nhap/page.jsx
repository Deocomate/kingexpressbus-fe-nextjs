export { default } from "@/views/admin/login-page";
// Admin login uses static `metadata` (robots noindex) on the view module;
// App Router only picks it up if re-exported from this page file.
export { metadata } from "@/views/admin/login-page";
