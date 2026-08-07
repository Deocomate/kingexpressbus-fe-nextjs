"use client";

import { z } from "zod";
import { resolveImageField } from "@/services/admin-uploads";
import { CrudSection } from "@/components/admin/crud-section";
import { MultiResourceSelect } from "@/components/admin/multi-resource-select";
import { FormSection } from "@/components/admin/form-section";
import { Input } from "@/components/ui/input";
import { Uploader } from "@/components/admin/uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(1, "Bắt buộc").max(1000),
  model_name: z.string().nullable(),
  seat_count: z.number().min(1, "Tối thiểu 1 ghế"),
  content: z.string().nullable(),
  thumbnail: z.custom().nullable(),
  service_ids: z.array(z.number()),
});

const empty = {
  name: "",
  model_name: null,
  seat_count: 1,
  content: null,
  thumbnail: null,
  service_ids: [],
};

const columns = [
  { accessorKey: "name", header: "Tên xe" },
  { accessorKey: "model_name", header: "Loại xe" },
  { accessorKey: "seat_count", header: "Số ghế" },
];

export function BusesSection() {
  return (
    <CrudSection
      title="Đội xe"
      resourcePath="/admin/buses"
      columns={columns}
      schema={schema}
      emptyFormValues={empty}
      reorderable
      reorderLabel={(item) => item.name}
      formSize="lg"
      toFormValues={(item) => ({
        name: item.name,
        model_name: item.model_name,
        seat_count: item.seat_count,
        content: item.content,
        thumbnail: item.thumbnail_url
          ? { previewUrl: item.thumbnail_url }
          : null,
        service_ids: item.service_ids,
      })}
      transformSubmit={async (values) => ({
        name: values.name,
        model_name: values.model_name || null,
        seat_count: values.seat_count,
        content: values.content || null,
        thumbnail_url: await resolveImageField(values.thumbnail, "buses"),
        service_ids: values.service_ids,
      })}
      renderFields={(form) => (
        <>
          <FormSection title="Thông tin xe" columns={2}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên xe</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại xe</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seat_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số ghế</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="service_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiện ích</FormLabel>
                  <FormControl>
                    <MultiResourceSelect
                      resourcePath="/admin/bus-services"
                      labelKey="name"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </FormSection>
          <FormSection title="Mô tả & hình ảnh">
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ảnh đại diện</FormLabel>
                  <FormControl>
                    <Uploader value={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </FormSection>
        </>
      )}
    />
  );
}
