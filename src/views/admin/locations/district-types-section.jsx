"use client";

import { z } from "zod";
import { CrudSection } from "@/components/admin/crud-section";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(1, "Bắt buộc").max(1000),
});

const columns = [{ accessorKey: "name", header: "Tên" }];

export function DistrictTypesSection() {
  return (
    <CrudSection
      title="Loại khu vực"
      resourcePath="/admin/district-types"
      columns={columns}
      schema={schema}
      emptyFormValues={{ name: "" }}
      reorderable
      reorderLabel={(item) => item.name}
      toFormValues={(item) => ({ name: item.name })}
      renderFields={(form) => (
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
      )}
    />
  );
}
