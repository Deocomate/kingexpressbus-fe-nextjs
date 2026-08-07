"use client";

import { z } from "zod";
import { CrudSection } from "@/components/admin/crud-section";
import { DatePicker } from "@/components/admin/date-picker";
import { FormSection } from "@/components/admin/form-section";
import { RouteAmountsField } from "@/views/admin/editors/route-amounts-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MoneyInput } from "@/components/admin/sheet-form/money-input";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(1, "Bắt buộc").max(255),
  reason: z.string().nullable(),
  start_date: z.string().min(1, "Bắt buộc"),
  end_date: z.string().min(1, "Bắt buộc"),
  global_surcharge_amount: z.number().min(0),
  is_active: z.boolean(),
  route_amounts: z.array(
    z.object({
      route_id: z.number({ error: "Chọn tuyến" }),
      route_surcharge_amount: z.number(),
    }),
  ),
});

const empty = {
  name: "",
  reason: null,
  start_date: "",
  end_date: "",
  global_surcharge_amount: 0,
  is_active: true,
  route_amounts: [],
};

const columns = [
  { accessorKey: "name", header: "Tên" },
  { accessorKey: "start_date", header: "Từ ngày" },
  { accessorKey: "end_date", header: "Đến ngày" },
  {
    accessorKey: "global_surcharge_amount",
    header: "Phụ thu chung",
    cell: ({ getValue }) =>
      `${new Intl.NumberFormat("vi-VN").format(getValue())}đ`,
  },
  {
    accessorKey: "is_active",
    header: "Trạng thái",
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="success">Hoạt động</Badge>
      ) : (
        <Badge variant="secondary">Tạm ngưng</Badge>
      ),
  },
];

export function SurchargesSection() {
  return (
    <CrudSection
      title="Phụ thu"
      resourcePath="/admin/surcharges"
      columns={columns}
      schema={schema}
      emptyFormValues={empty}
      formSize="lg"
      toFormValues={(item) => ({
        name: item.name,
        reason: item.reason,
        start_date: item.start_date,
        end_date: item.end_date,
        global_surcharge_amount: item.global_surcharge_amount,
        is_active: item.is_active,
        route_amounts: item.route_amounts,
      })}
      renderFields={(form) => (
        <>
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={2} />
                  </FormControl>
                </FormItem>
              )}
            />
          </FormSection>
          <FormSection title="Thời gian áp dụng" columns={2}>
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Từ ngày</FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đến ngày</FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>
          <FormSection title="Mức phụ thu">
            <FormField
              control={form.control}
              name="global_surcharge_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phụ thu chung (mọi tuyến)</FormLabel>
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
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Đang áp dụng</FormLabel>
                </FormItem>
              )}
            />
            <FormItem className="sm:col-span-2">
              <FormLabel>Phụ thu theo tuyến (cộng thêm)</FormLabel>
              <RouteAmountsField control={form.control} />
            </FormItem>
          </FormSection>
        </>
      )}
    />
  );
}
