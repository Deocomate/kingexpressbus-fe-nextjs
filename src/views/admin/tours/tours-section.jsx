"use client";

import { z } from "zod";
import { resolveImageField } from "@/services/admin-uploads";
import { CrudSection } from "@/components/admin/crud-section";
import { FormSection } from "@/components/admin/form-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  name: z.string().min(1, "Bắt buộc").max(255),
  slug: z.string().nullable(),
  short_description: z.string().nullable(),
  description: z.string().nullable(),
  itinerary: z.string().nullable(),
  duration_label: z.string().nullable(),
  duration_hours: z.number().nullable(),
  base_price: z.number().min(0),
  max_guests: z.number().min(1),
  highlights_text: z.string().nullable(),
  includes_text: z.string().nullable(),
  excludes_text: z.string().nullable(),
  is_active: z.boolean(),
  thumbnail: z.custom().nullable(),
});

const empty = {
  name: "",
  slug: null,
  short_description: null,
  description: null,
  itinerary: null,
  duration_label: null,
  duration_hours: null,
  base_price: 0,
  max_guests: 20,
  highlights_text: null,
  includes_text: null,
  excludes_text: null,
  is_active: true,
  thumbnail: null,
};

const columns = [
  { accessorKey: "name", header: "Tên" },
  { accessorKey: "duration_label", header: "Thời lượng" },
  {
    accessorKey: "base_price",
    header: "Giá",
    cell: ({ getValue }) => `${Number(getValue()).toLocaleString("vi-VN")}đ`,
  },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ getValue }) => (getValue() ? "Có" : "Không"),
  },
];

function parseLines(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ToursSection() {
  return (
    <CrudSection
      title="Tour Sa Pa"
      hideTitle
      resourcePath="/admin/tours"
      columns={columns}
      schema={schema}
      emptyFormValues={empty}
      reorderable
      reorderLabel={(item) => item.name}
      formSize="lg"
      toFormValues={(item) => ({
        name: item.name,
        slug: item.slug,
        short_description: item.short_description,
        description: item.description,
        itinerary: item.itinerary,
        duration_label: item.duration_label,
        duration_hours: item.duration_hours,
        base_price: item.base_price,
        max_guests: item.max_guests,
        highlights_text: Array.isArray(item.highlights)
          ? item.highlights.join("\n")
          : "",
        includes_text: Array.isArray(item.includes)
          ? item.includes.join("\n")
          : "",
        excludes_text: Array.isArray(item.excludes)
          ? item.excludes.join("\n")
          : "",
        is_active: !!item.is_active,
        thumbnail: item.thumbnail_url
          ? { previewUrl: item.thumbnail_url }
          : null,
      })}
      transformSubmit={async (values) => ({
        name: values.name,
        slug: values.slug || null,
        short_description: values.short_description || null,
        description: values.description || null,
        itinerary: values.itinerary || null,
        duration_label: values.duration_label || null,
        duration_hours: values.duration_hours,
        base_price: values.base_price,
        max_guests: values.max_guests,
        highlights: parseLines(values.highlights_text),
        includes: parseLines(values.includes_text),
        excludes: parseLines(values.excludes_text),
        is_active: values.is_active,
        thumbnail_url: await resolveImageField(values.thumbnail, "tours"),
      })}
      renderFields={(form) => (
        <>
          <FormSection title="Thông tin" columns={2}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên tour</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời lượng</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="base_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá / khách</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sức chứa / ngày</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hiển thị</FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={field.value ? "1" : "0"}
                      onChange={(e) => field.onChange(e.target.value === "1")}
                    >
                      <option value="1">Có</option>
                      <option value="0">Không</option>
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ảnh</FormLabel>
                  <FormControl>
                    <Uploader value={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Mô tả ngắn</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </FormSection>
          <FormSection title="Nội dung" columns={1}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value ?? ""}
                      onChange={(v) => field.onChange(v || null)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="itinerary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lịch trình</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value ?? ""}
                      onChange={(v) => field.onChange(v || null)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="highlights_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highlights (mỗi dòng)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
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
