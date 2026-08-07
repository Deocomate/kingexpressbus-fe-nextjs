"use client";

import { cn } from "@/utils/cn";

export function AdminCard({ title, actions, children, className, bodyClassName }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-admin-md border border-admin-border bg-admin-surface shadow-md",
        className,
      )}
    >
      {title ? (
        <div className="flex items-center justify-between gap-3 bg-admin-primary px-5 py-3.5">
          <h3 className="text-sm font-semibold leading-none text-white">
            {title}
          </h3>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      <div className={cn("bg-admin-surface p-4", bodyClassName)}>
        {children}
      </div>
    </div>
  );
}
