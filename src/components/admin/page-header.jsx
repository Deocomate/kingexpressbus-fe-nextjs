"use client";

import { useEffect } from "react";
import { useAdminPage } from "@/components/admin/page-context";
import { cn } from "@/utils/cn";

export function PageHeader({
  title,
  description,
  actions,
  filters,
  className,
}) {
  const { setTitle } = useAdminPage();

  useEffect(() => {
    setTitle(title);
    return () => setTitle("");
  }, [title, setTitle]);

  return (
    <div
      className={cn(
        "mb-4 border-b border-admin-border bg-admin-surface px-4 py-3 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-admin-ink">{title}</h1>
          {description ? (
            <p className="mt-0.5 text-sm text-admin-muted">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      {filters ? <div className="mt-3">{filters}</div> : null}
    </div>
  );
}
