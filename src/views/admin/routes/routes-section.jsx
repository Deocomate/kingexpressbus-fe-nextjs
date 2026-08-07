"use client";

import { useState } from "react";
import { MapPinned } from "lucide-react";
import { z } from "zod";
import { resolveImageField } from "@/services/admin-uploads";
import { CrudSection } from "@/components/admin/crud-section";
import { ResourceSelect } from "@/components/admin/resource-select";
import { FormSection } from "@/components/admin/form-section";
import { RouteStopsEditor } from "@/views/admin/editors/route-stops-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MoneyInput } from "@/components/admin/sheet-form/money-input";
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
  province_start_id: z.number({ error: "Bắt buộc" }).nullable(),
  province_end_id: z.number({ error: "Bắt buộc" }).nullable(),
  name: z.string().min(1, "Bắt buộc").max(1000),
  duration: z.string().nullable(),
  distance_km: z.number().nullable(),
  price_default: z.number().min(0),
  available_hotel_pickup: z.boolean(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  content: z.string().nullable(),
  thumbnail: z.custom().nullable(),
});

const empty = {
  province_start_id: null,
  province_end_id: null,
  name: "",
  duration: null,
  distance_km: null,
  price_default: 0,
  available_hotel_pickup: false,
  title: null,
  description: null,
  content: null,
  thumbnail: null,
};

const columns = [
  { accessorKey: "name", header: "Tên" },
  { accessorKey: "slug", header: "Slug" },
  {
    accessorKey: "price_default",
    header: "Giá",
    cell: ({ getValue }) =>
      `${new Intl.NumberFormat("vi-VN").format(getValue())}đ`,
  },
];

export function RoutesSection() {
  const [stopsEditorRoute, setStopsEditorRoute] = useState(null);

  return (
    <>
      <CrudSection
        title="Tuyến đường"
        resourcePath="/admin/routes"
        columns={columns}
        schema={schema}
        emptyFormValues={empty}
        reorderable
        reorderLabel={(item) => item.name}
        formSize="lg"
        toFormValues={(item) => ({
          province_start_id: item.province_start_id,
          province_end_id: item.province_end_id,
          name: item.name,
          duration: item.duration,
          distance_km: item.distance_km,
          price_default: item.price_default,
          available_hotel_pickup: item.available_hotel_pickup,
          title: item.title,
          description: item.description,
          content: item.content,
          thumbnail: item.thumbnail_url
            ? { previewUrl: item.thumbnail_url }
            : null,
        })}
        transformSubmit={async (values) => ({
          province_start_id: values.province_start_id,
          province_end_id: values.province_end_id,
          name: values.name,
          duration: values.duration || null,
          distance_km: values.distance_km,
          price_default: values.price_default,
          available_hotel_pickup: values.available_hotel_pickup,
          title: values.title || null,
          description: values.description || null,
          content: values.content || null,
          thumbnail_url: await resolveImageField(values.thumbnail, "routes"),
        })}
        renderRowActions={(item) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Quản lý điểm dừng"
            onClick={() => setStopsEditorRoute(item)}
          >
            <MapPinned className="size-3.5" />
          </Button>
        )}
        renderFields={(form) => (
          <>
            <FormSection title="Tuyến" columns={2}>
              <FormField
                control={form.control}
                name="province_start_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỉnh đi</FormLabel>
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
                name="province_end_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỉnh đến</FormLabel>
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
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Tên tuyến</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>
            <FormSection title="Giá & thời gian" columns={2}>
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian di chuyển</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="vd: 3h30"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="distance_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khoảng cách (km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_default"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá mặc định</FormLabel>
                    <FormControl>
                      <MoneyInput
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
                name="available_hotel_pickup"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Hỗ trợ đón tại khách sạn
                    </FormLabel>
                  </FormItem>
                )}
              />
            </FormSection>
            <FormSection title="Nội dung & SEO">
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
                  <FormItem>
                    <FormLabel>Mô tả ngắn</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} rows={2} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh đại diện</FormLabel>
                    <FormControl>
                      <Uploader
                        value={field.value}
                        onChange={field.onChange}
                      />
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
      {stopsEditorRoute ? (
        <RouteStopsEditor
          routeId={stopsEditorRoute.id}
          routeName={stopsEditorRoute.name}
          open={!!stopsEditorRoute}
          onOpenChange={(open) => !open && setStopsEditorRoute(null)}
        />
      ) : null}
    </>
  );
}
