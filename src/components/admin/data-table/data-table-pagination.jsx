"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DataTablePagination({ page, pageSize, total, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-admin-muted">
      <p>
        {total === 0 ? "Không có dữ liệu" : `${from}–${to} / ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Trang trước"
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        <span className="min-w-[4.5rem] text-center">
          {page}/{pageCount}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Trang sau"
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
