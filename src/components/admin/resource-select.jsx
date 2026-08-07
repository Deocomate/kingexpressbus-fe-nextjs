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

export function ResourceSelect({
  resourcePath,
  labelKey,
  value,
  onChange,
  placeholder = "Chọn…",
  disabled,
  extraParams,
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
      onValueChange={(v) => onChange(v ? Number(v) : null)}
    >
      <SelectTrigger className="h-8">
        <SelectValue placeholder={isLoading ? "Đang tải…" : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.id} value={String(item.id)}>
            {String(item[labelKey])}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
