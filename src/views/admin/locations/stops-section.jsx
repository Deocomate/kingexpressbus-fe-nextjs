"use client";

import { useState } from "react";
import { z } from "zod";
import { CrudSection } from "@/components/admin/crud-section";
import { ResourceSelect } from "@/components/admin/resource-select";
import { FilterBar, FilterField } from "@/components/admin/filter-bar";
import { ProvinceFilter } from "@/components/admin/province-filter";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  province_id: z.number().nullable().optional(),
  district_id: z.number({ error: "Bắt buộc" }).nullable(),
  name: z.string().min(1, "Bắt buộc").max(1000),
  address: z.string().min(1, "Bắt buộc").max(1000),
});

const columns = [
  { accessorKey: "province_name", header: "Tỉnh/Thành phố" },
  { accessorKey: "district_name", header: "Quận/Huyện" },
  { accessorKey: "name", header: "Tên" },
  { accessorKey: "address", header: "Địa chỉ" },
];

export function StopsSection() {
  const [provinceFilter, setProvinceFilter] = useState(null);
  const [districtFilter, setDistrictFilter] = useState(null);

  const filters = (
    <FilterBar>
      <ProvinceFilter
        value={provinceFilter}
        onChange={(value) => {
          setProvinceFilter(value);
          setDistrictFilter(null);
        }}
      />
      <FilterField label="Quận/Huyện">
        <ResourceSelect
          resourcePath="/admin/districts"
          labelKey="name"
          value={districtFilter}
          onChange={setDistrictFilter}
          placeholder="Tất cả quận/huyện"
          allowClear
          clearLabel="Tất cả quận/huyện"
          extraParams={
            provinceFilter ? { province_id: provinceFilter } : undefined
          }
          disabled={!provinceFilter}
        />
      </FilterField>
    </FilterBar>
  );

  return (
    <CrudSection
      title="Điểm đón/trả"
      resourcePath="/admin/stops"
      columns={columns}
      pageSize={50}
      groupBy="province_name"
      groupLabel={(value) => value}
      extraParams={{
        province_id: provinceFilter ?? undefined,
        district_id: districtFilter ?? undefined,
      }}
      filters={filters}
      schema={schema}
      emptyFormValues={{
        province_id: null,
        district_id: null,
        name: "",
        address: "",
      }}
      reorderable
      reorderLabel={(item) => item.name}
      toFormValues={(item) => ({
        province_id: item.province_id ?? null,
        district_id: item.district_id,
        name: item.name,
        address: item.address,
      })}
      transformSubmit={(values) => ({
        district_id: values.district_id,
        name: values.name,
        address: values.address,
      })}
      renderFields={(form) => (
        <>
          <FormField
            control={form.control}
            name="province_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tỉnh/Thành phố</FormLabel>
                <FormControl>
                  <ResourceSelect
                    resourcePath="/admin/provinces"
                    labelKey="name"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      form.setValue("district_id", null);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="district_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quận/Huyện</FormLabel>
                <FormControl>
                  <ResourceSelect
                    resourcePath="/admin/districts"
                    labelKey="name"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!form.watch("province_id")}
                    extraParams={
                      form.watch("province_id")
                        ? { province_id: form.watch("province_id") }
                        : undefined
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    />
  );
}
