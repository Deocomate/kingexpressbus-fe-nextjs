"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPaginated } from "@/services/admin-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CLEAR_VALUE = "__clear__";

export function ResourceSelect({
  resourcePath,
  labelKey,
  value,
  onChange,
  placeholder = "Chọn…",
  disabled,
  extraParams,
  allowClear = false,
  clearLabel = "Bỏ chọn",
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["resource-select", resourcePath, extraParams],
    queryFn: () =>
      fetchPaginated(resourcePath, {
        page: 1,
        page_size: 100,
        extra: extraParams,
      }),
  });

  const items = data?.items ?? [];

  return (
    <Select
      disabled={disabled || isLoading}
      value={value != null ? String(value) : undefined}
      onValueChange={(v) => {
        if (v === CLEAR_VALUE) {
          onChange(null);
          return;
        }
        onChange(v ? Number(v) : null);
      }}
    >
      <SelectTrigger className="h-8">
        <SelectValue placeholder={isLoading ? "Đang tải…" : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowClear ? (
          <SelectItem value={CLEAR_VALUE}>{clearLabel}</SelectItem>
        ) : null}
        {items.map((item) => (
          <SelectItem key={item.id} value={String(item.id)}>
            {String(item[labelKey])}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
