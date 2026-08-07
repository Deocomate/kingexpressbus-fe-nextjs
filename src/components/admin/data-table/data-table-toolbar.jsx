"use client";

import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DataTableToolbar({
  onSearch,
  selectedCount,
  onBulkDelete,
  actions,
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="relative w-full max-w-xs">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-admin-muted-fg"
          aria-hidden="true"
        />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tìm kiếm…"
          className="pl-8"
          aria-label="Tìm kiếm"
        />
      </div>
      <div className="flex items-center gap-2">
        {selectedCount > 0 && onBulkDelete ? (
          <Button variant="destructive" size="sm" onClick={onBulkDelete}>
            <Trash2 className="size-3.5" />
            Xóa ({selectedCount})
          </Button>
        ) : null}
        {actions}
      </div>
    </div>
  );
}
