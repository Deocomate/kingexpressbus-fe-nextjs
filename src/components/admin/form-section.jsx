"use client";

import { cn } from "@/utils/cn";

export function FormSection({
  title,
  description,
  children,
  columns = 1,
  className,
}) {
  return (
    <section className={cn("space-y-3", className)}>
      {title ? (
        <div className="border-b border-admin-border pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-admin-muted">
            {title}
          </h3>
          {description ? (
            <p className="mt-0.5 text-xs text-admin-muted-fg">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div
        className={cn(
          "grid gap-3",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
        )}
      >
        {children}
      </div>
    </section>
  );
}
