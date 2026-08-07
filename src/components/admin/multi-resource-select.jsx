"use client";
// M2M picker for bounded lists (e.g. bus service_ids) — checkbox list, not a
// combobox, since these sets are small (a handful of service types).
import { useQuery } from "@tanstack/react-query";
import { fetchPaginated } from "@/services/admin-api";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
export function MultiResourceSelect({
  resourcePath,
  labelKey,
  value,
  onChange
}) {
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["resource-select", resourcePath],
    queryFn: () => fetchPaginated(resourcePath, {
      page: 1,
      page_size: 100
    })
  });
  if (isLoading) return <Skeleton className="h-16 w-full" />;
  const items = data?.items ?? [];
  if (items.length === 0) {
    return <p className="text-sm text-admin-muted">Chưa có mục nào.</p>;
  }
  function toggle(id, checked) {
    onChange(checked ? [...value, id] : value.filter(v => v !== id));
  }
  return <div className="flex flex-wrap gap-3 rounded-admin-md border border-admin-border-strong p-3">{items.map(item => {
      const id = Number(item.id);
      return <label key={id} className="flex items-center gap-2 text-sm text-admin-ink"><Checkbox checked={value.includes(id)} onCheckedChange={v => toggle(id, !!v)} />{String(item[labelKey])}</label>;
    })}</div>;
}