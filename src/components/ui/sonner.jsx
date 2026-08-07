"use client";
import { Toaster as Sonner } from "sonner";

// sonner renders its live region with aria-live="polite" internally —
// satisfies the phase-07 toast accessibility baseline without extra wiring.
function Toaster(props) {
  return <Sonner {...props} position="top-right" toastOptions={{
    classNames: {
      toast: "rounded-admin-md! border! border-admin-border! bg-admin-surface! text-admin-ink! shadow-lg!",
      description: "text-admin-muted!"
    }
  }} />;
}
export { Toaster };