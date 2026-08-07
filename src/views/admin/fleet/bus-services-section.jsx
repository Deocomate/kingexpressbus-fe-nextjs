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
  name: z.string().min(1, "Bắt buộc").max(255),
  icon: z.string().nullable(),
});

const columns = [{ accessorKey: "name", header: "Tên" }];

export function BusServicesSection() {
  return (
    <CrudSection
      title="Tiện ích xe"
      resourcePath="/admin/bus-services"
      columns={columns}
      schema={schema}
      emptyFormValues={{ name: "", icon: null }}
      reorderable
      reorderLabel={(item) => item.name}
      toFormValues={(item) => ({ name: item.name, icon: item.icon })}
      renderFields={(form) => (
        <>
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
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon (tên lucide, tùy chọn)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="vd: wifi"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </>
      )}
    />
  );
}
