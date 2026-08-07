"use client";

import { z } from "zod";
import { resolveImageField } from "@/services/admin-uploads";
import { CrudSection } from "@/components/admin/crud-section";
import { ResourceSelect } from "@/components/admin/resource-select";
import { FormSection } from "@/components/admin/form-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Uploader } from "@/components/admin/uploader";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  province_id: z.number({ error: "Bắt buộc" }).nullable(),
  district_type_id: z.number({ error: "Bắt buộc" }).nullable(),
  name: z.string().min(1, "Bắt buộc").max(1000),
  title: z.string().nullable(),
  description: z.string().nullable(),
  content: z.string().nullable(),
  thumbnail: z.custom().nullable(),
});

const empty = {
  province_id: null,
  district_type_id: null,
  name: "",
  title: null,
  description: null,
  content: null,
  thumbnail: null,
};

const columns = [
  { accessorKey: "name", header: "Tên" },
  { accessorKey: "slug", header: "Slug" },
];

export function DistrictsSection() {
  return (
    <CrudSection
      title="Quận/Huyện"
      resourcePath="/admin/districts"
      columns={columns}
      schema={schema}
      emptyFormValues={empty}
      reorderable
      reorderLabel={(item) => item.name}
      formSize="lg"
      toFormValues={(item) => ({
        province_id: item.province_id,
        district_type_id: item.district_type_id,
        name: item.name,
        title: item.title,
        description: item.description,
        content: item.content,
        thumbnail: item.thumbnail_url
          ? { previewUrl: item.thumbnail_url }
          : null,
      })}
      transformSubmit={async (values) => ({
        province_id: values.province_id,
        district_type_id: values.district_type_id,
        name: values.name,
        title: values.title || null,
        description: values.description || null,
        content: values.content || null,
        thumbnail_url: await resolveImageField(values.thumbnail, "districts"),
      })}
      renderFields={(form) => (
        <>
          <FormSection title="Phân loại" columns={2}>
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
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="district_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại khu vực</FormLabel>
                  <FormControl>
                    <ResourceSelect
                      resourcePath="/admin/district-types"
                      labelKey="name"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>
          <FormSection title="Thông tin">
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề (SEO)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Mô tả ngắn</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={2} />
                  </FormControl>
                </FormItem>
              )}
            />
          </FormSection>
          <FormSection title="Nội dung & hình ảnh">
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
                  <FormLabel>Nội dung</FormLabel>
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
