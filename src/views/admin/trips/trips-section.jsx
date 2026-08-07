"use client";

import { useState } from "react";
import { ArrowRight, CalendarOff, MapPinned } from "lucide-react";
import { z } from "zod";
import { CrudSection } from "@/components/admin/crud-section";
import { AdminCard } from "@/components/admin/admin-card";
import { ResourceSelect } from "@/components/admin/resource-select";
import { FilterBar, FilterField } from "@/components/admin/filter-bar";
import { FormSection } from "@/components/admin/form-section";
import { TimeInput } from "@/components/admin/time-input";
import { TripBlocksEditor } from "@/views/admin/editors/trip-blocks-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MoneyInput } from "@/components/admin/sheet-form/money-input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  bus_id: z.number({ error: "Bắt buộc" }).nullable(),
  route_id: z.number({ error: "Bắt buộc" }).nullable(),
  start_time: z.string().min(1, "Bắt buộc"),
  end_time: z.string().min(1, "Bắt buộc"),
  price: z.number().min(0),
  is_active: z.boolean(),
});

const empty = {
  bus_id: null,
  route_id: null,
  start_time: "",
  end_time: "",
  price: 0,
  is_active: true,
};

export function TripsSection() {
  const [blocksEditorTrip, setBlocksEditorTrip] = useState(null);
  const [provinceStartId, setProvinceStartId] = useState(null);
  const [provinceEndId, setProvinceEndId] = useState(null);
  const [routeFilter, setRouteFilter] = useState(null);
  const [busFilter, setBusFilter] = useState(null);

  const corridorReady =
    provinceStartId != null && provinceEndId != null;

  const routeExtraParams = corridorReady
    ? {
        province_start_id: provinceStartId,
        province_end_id: provinceEndId,
      }
    : undefined;

  const columns = [
    { accessorKey: "route_name", header: "Tuyến" },
    { accessorKey: "bus_name", header: "Xe" },
    { accessorKey: "start_time", header: "Giờ đi" },
    { accessorKey: "end_time", header: "Giờ đến" },
    {
      accessorKey: "price",
      header: "Giá chuyến",
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

  const filters = (
    <FilterBar>
      <FilterField label="Tuyến">
        <ResourceSelect
          resourcePath="/admin/routes"
          labelKey="name"
          value={routeFilter}
          onChange={setRouteFilter}
          placeholder="Tất cả tuyến"
          allowClear
          clearLabel="Tất cả tuyến"
          extraParams={routeExtraParams}
        />
      </FilterField>
      <FilterField label="Xe">
        <ResourceSelect
          resourcePath="/admin/buses"
          labelKey="name"
          value={busFilter}
          onChange={setBusFilter}
          placeholder="Tất cả xe"
          allowClear
          clearLabel="Tất cả xe"
        />
      </FilterField>
    </FilterBar>
  );

  function handleStartChange(value) {
    setProvinceStartId(value);
    setRouteFilter(null);
  }

  function handleEndChange(value) {
    setProvinceEndId(value);
    setRouteFilter(null);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <AdminCard title="Tỉnh đi">
          <div className="space-y-2 p-4">
            <p className="text-xs text-admin-muted">
              Chọn tỉnh/thành phố khởi hành để lọc chuyến.
            </p>
            <ResourceSelect
              resourcePath="/admin/provinces"
              labelKey="name"
              value={provinceStartId}
              onChange={handleStartChange}
              placeholder="Chọn tỉnh đi…"
              allowClear
              clearLabel="Bỏ chọn"
            />
          </div>
        </AdminCard>

        <div className="hidden items-center justify-center md:flex">
          <div className="flex size-10 items-center justify-center rounded-full border border-admin-border bg-admin-surface text-admin-primary shadow-sm">
            <ArrowRight className="size-4" />
          </div>
        </div>

        <AdminCard title="Tỉnh đến">
          <div className="space-y-2 p-4">
            <p className="text-xs text-admin-muted">
              Chọn tỉnh/thành phố điểm đến để lọc chuyến.
            </p>
            <ResourceSelect
              resourcePath="/admin/provinces"
              labelKey="name"
              value={provinceEndId}
              onChange={handleEndChange}
              placeholder="Chọn tỉnh đến…"
              allowClear
              clearLabel="Bỏ chọn"
            />
          </div>
        </AdminCard>
      </div>

      {!corridorReady ? (
        <AdminCard>
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-admin-muted">
              <MapPinned className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-admin-ink">
                Chọn tỉnh đi và tỉnh đến để xem chuyến xe
              </p>
              <p className="max-w-md text-xs text-admin-muted">
                Danh sách chuyến chỉ tải sau khi chọn đủ cặp tỉnh — giúp quản lý
                theo tuyến hành trình, tránh hiển thị hàng trăm dòng cùng lúc.
              </p>
            </div>
          </div>
        </AdminCard>
      ) : (
        <CrudSection
          key={`trips-${provinceStartId}-${provinceEndId}`}
          title="Chuyến xe"
          resourcePath="/admin/trips"
          columns={columns}
          pageSize={50}
          schema={schema}
          emptyFormValues={empty}
          extraParams={{
            province_start_id: provinceStartId,
            province_end_id: provinceEndId,
            route_id: routeFilter ?? undefined,
            bus_id: busFilter ?? undefined,
          }}
          filters={filters}
          toFormValues={(item) => ({
            bus_id: item.bus_id,
            route_id: item.route_id,
            start_time: item.start_time,
            end_time: item.end_time,
            price: item.price,
            is_active: item.is_active,
          })}
          renderRowActions={(item) => (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Chặn lịch"
              onClick={() => setBlocksEditorTrip(item)}
            >
              <CalendarOff className="size-3.5" />
            </Button>
          )}
          renderFields={(form) => (
            <>
              <FormSection title="Phân công" columns={2}>
                <FormField
                  control={form.control}
                  name="route_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tuyến</FormLabel>
                      <FormControl>
                        <ResourceSelect
                          resourcePath="/admin/routes"
                          labelKey="name"
                          value={field.value}
                          onChange={field.onChange}
                          extraParams={routeExtraParams}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bus_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xe</FormLabel>
                      <FormControl>
                        <ResourceSelect
                          resourcePath="/admin/buses"
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
              <FormSection title="Lịch trình" columns={2}>
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ khởi hành</FormLabel>
                <FormControl>
                  <TimeInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ đến</FormLabel>
                <FormControl>
                  <TimeInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
              <FormSection title="Giá & trạng thái">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá chuyến</FormLabel>
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
                      <FormLabel className="!mt-0">Đang hoạt động</FormLabel>
                    </FormItem>
                  )}
                />
              </FormSection>
            </>
          )}
        />
      )}

      {blocksEditorTrip ? (
        <TripBlocksEditor
          tripId={blocksEditorTrip.id}
          open={!!blocksEditorTrip}
          onOpenChange={(open) => !open && setBlocksEditorTrip(null)}
        />
      ) : null}
    </div>
  );
}
