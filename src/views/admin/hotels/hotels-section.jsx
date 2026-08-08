"use client";

import { useState } from "react";
import { z } from "zod";
import { DoorOpen } from "lucide-react";
import { resolveImageField } from "@/services/admin-uploads";
import { CrudSection } from "@/components/admin/crud-section";
import { FormSection } from "@/components/admin/form-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Uploader } from "@/components/admin/uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { HotelRoomsEditor } from "@/views/admin/editors/hotel-rooms-editor";

const schema = z.object({
  name: z.string().min(1, "Bắt buộc").max(255),
  slug: z.string().nullable(),
  address: z.string().nullable(),
  short_description: z.string().nullable(),
  description: z.string().nullable(),
  amenities_text: z.string().nullable(),
  check_in_from: z.string().nullable(),
  check_in_to: z.string().nullable(),
  check_out_from: z.string().nullable(),
  check_out_to: z.string().nullable(),
  rating_score: z.string().nullable(),
  rating_label: z.string().nullable(),
  rating_count: z.number().min(0),
  is_active: z.boolean(),
  thumbnail: z.custom().nullable(),
  payment_policy: z.string().nullable(),
  cancel_policy: z.string().nullable(),
});

const empty = {
  name: "",
  slug: null,
  address: null,
  short_description: null,
  description: null,
  amenities_text: null,
  check_in_from: "14:00",
  check_in_to: "22:00",
  check_out_from: "12:00",
  check_out_to: "12:30",
  rating_score: null,
  rating_label: null,
  rating_count: 0,
  is_active: true,
  thumbnail: null,
  payment_policy: null,
  cancel_policy: null,
};

const columns = [
  { accessorKey: "name", header: "Tên" },
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "address", header: "Địa chỉ" },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ getValue }) => (getValue() ? "Có" : "Không"),
  },
];

function parseLines(text) {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function HotelsSection() {
  const [roomsHotel, setRoomsHotel] = useState(null);

  return (
    <>
      <CrudSection
        title="Khách sạn"
        hideTitle
        resourcePath="/admin/hotels"
        columns={columns}
        schema={schema}
        emptyFormValues={empty}
        reorderable
        reorderLabel={(item) => item.name}
        formSize="lg"
        toFormValues={(item) => ({
          name: item.name,
          slug: item.slug,
          address: item.address,
          short_description: item.short_description,
          description: item.description,
          amenities_text: Array.isArray(item.amenities)
            ? item.amenities.join("\n")
            : "",
          check_in_from: item.check_in_from,
          check_in_to: item.check_in_to,
          check_out_from: item.check_out_from,
          check_out_to: item.check_out_to,
          rating_score: item.rating_score,
          rating_label: item.rating_label,
          rating_count: item.rating_count || 0,
          is_active: !!item.is_active,
          thumbnail: item.thumbnail_url
            ? { previewUrl: item.thumbnail_url }
            : null,
          payment_policy: item.policies?.payment || null,
          cancel_policy: item.policies?.cancellation || null,
        })}
        transformSubmit={async (values) => ({
          name: values.name,
          slug: values.slug || null,
          address: values.address || null,
          short_description: values.short_description || null,
          description: values.description || null,
          amenities: parseLines(values.amenities_text),
          policies: {
            payment: values.payment_policy || null,
            cancellation: values.cancel_policy || null,
          },
          check_in_from: values.check_in_from || null,
          check_in_to: values.check_in_to || null,
          check_out_from: values.check_out_from || null,
          check_out_to: values.check_out_to || null,
          rating_score: values.rating_score || null,
          rating_label: values.rating_label || null,
          rating_count: values.rating_count || 0,
          is_active: values.is_active,
          thumbnail_url: await resolveImageField(values.thumbnail, "hotels"),
        })}
        renderRowActions={(item) => (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setRoomsHotel(item)}
          >
            <DoorOpen className="mr-1 h-4 w-4" />
            Phòng
          </Button>
        )}
        renderFields={(form) => (
          <>
            <FormSection title="Thông tin" columns={2}>
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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
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
                    <FormMessage />
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
                    <FormLabel>Ảnh đại diện</FormLabel>
                    <FormControl>
                      <Uploader value={field.value} onChange={field.onChange} />
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
                name="amenities_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiện nghi (mỗi dòng một mục)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormSection>
            <FormSection title="Chính sách" columns={2}>
              <FormField
                control={form.control}
                name="check_in_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in từ</FormLabel>
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
                name="check_in_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in đến</FormLabel>
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
                name="payment_policy"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Thanh toán</FormLabel>
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
              <FormField
                control={form.control}
                name="cancel_policy"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Hủy phòng</FormLabel>
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
          </>
        )}
      />
      {roomsHotel ? (
        <HotelRoomsEditor
          hotelId={roomsHotel.id}
          hotelName={roomsHotel.name}
          open={!!roomsHotel}
          onOpenChange={(open) => !open && setRoomsHotel(null)}
        />
      ) : null}
    </>
  );
}
