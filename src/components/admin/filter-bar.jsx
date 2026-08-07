"use client";

import { cn } from "@/utils/cn";

export function FilterBar({ children, className }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-2 border-b border-admin-border bg-slate-50 px-3 py-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FilterField({ label, children, className }) {
  return (
    <div className={cn("min-w-[10rem] flex-1 space-y-1", className)}>
      {label ? (
        <span className="text-[0.65rem] font-medium uppercase tracking-wide text-admin-muted">
          {label}
        </span>
      ) : null}
      {children}
    </div>
  );
}
