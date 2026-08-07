"use client";

import { FilterField } from "@/components/admin/filter-bar";
import { ResourceSelect } from "@/components/admin/resource-select";

export function ProvinceFilter({
  value,
  onChange,
  label = "Tỉnh/Thành phố",
  placeholder = "Tất cả tỉnh/thành",
}) {
  return (
    <FilterField label={label}>
      <ResourceSelect
        resourcePath="/admin/provinces"
        labelKey="name"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </FilterField>
  );
}
