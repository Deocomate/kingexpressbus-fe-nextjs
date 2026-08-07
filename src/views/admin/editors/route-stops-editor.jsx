"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  adminCreate,
  adminDelete,
  adminGet,
  adminReorder,
  getErrorMessage,
} from "@/services/admin-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OptionsCombobox } from "@/components/admin/options-combobox";
import { ReorderList } from "@/components/admin/reorder-list";
import { useConfirmDialog } from "@/components/admin/confirm-dialog";

function matchesColumn(item, column) {
  if (column === "pickup") {
    return item.stop_type === "pickup" || item.stop_type === "both";
  }
  return item.stop_type === "dropoff" || item.stop_type === "both";
}

function stopLabel(item) {
  return item.stop_name?.trim() || `#${item.stop_id}`;
}

function StopColumn({
  title,
  stopType,
  items,
  routeId,
  usedStopIds,
  onAdded,
  onRemove,
  onReorder,
}) {
  const [newStop, setNewStop] = useState(null);

  async function handleAdd() {
    if (!newStop) return;
    try {
      await adminCreate(`/admin/routes/${routeId}/stops`, {
        stop_id: newStop.id,
        stop_type: stopType,
      });
      setNewStop(null);
      toast.success(
        stopType === "pickup" ? "Đã thêm điểm đón" : "Đã thêm điểm trả",
      );
      onAdded();
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể thêm điểm dừng."));
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-admin-md border border-admin-border bg-slate-50 p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-admin-ink">{title}</h3>
        <p className="text-xs text-admin-muted">
          Chọn điểm dừng thuộc 2 tỉnh của tuyến
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-40 flex-1">
          <OptionsCombobox
            resource="stops"
            value={newStop}
            onChange={setNewStop}
            placeholder="Chọn điểm dừng…"
            extraParams={{ route_id: routeId }}
            allowEmptyQuery
          />
        </div>
        <Button
          type="button"
          size="sm"
          disabled={!newStop || usedStopIds.has(newStop.id)}
          onClick={handleAdd}
        >
          <Plus className="size-3.5" />
          Thêm
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-admin-md border border-dashed border-admin-border bg-admin-surface px-3 py-4 text-sm text-admin-muted">
          Chưa có điểm nào.
        </p>
      ) : (
        <ReorderList
          items={items}
          onOrderChange={onReorder}
          className="min-w-0"
          renderLabel={(item) => (
            <div className="flex flex-1 items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{stopLabel(item)}</p>
                {item.stop_address ? (
                  <p className="truncate text-xs text-admin-muted">
                    {item.stop_address}
                  </p>
                ) : null}
                {item.stop_type === "both" ? (
                  <p className="text-[0.65rem] uppercase tracking-wide text-admin-muted">
                    Đón &amp; trả
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                aria-label="Xóa điểm dừng"
                onClick={() => onRemove(item)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
        />
      )}
    </div>
  );
}

export function RouteStopsEditor({
  routeId,
  routeName,
  open,
  onOpenChange,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  async function reload() {
    setLoading(true);
    try {
      const rows = await adminGet(`/admin/routes/${routeId}/stops`);
      setItems(rows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, routeId]);

  const pickupItems = useMemo(
    () => items.filter((item) => matchesColumn(item, "pickup")),
    [items],
  );
  const dropoffItems = useMemo(
    () => items.filter((item) => matchesColumn(item, "dropoff")),
    [items],
  );
  const usedStopIds = useMemo(
    () => new Set(items.map((item) => item.stop_id)),
    [items],
  );

  function handleRemove(item) {
    confirm({
      title: "Xóa điểm dừng khỏi tuyến?",
      onConfirm: async () => {
        await adminDelete(`/admin/route-stops/${item.id}`);
        toast.success("Đã xóa");
        reload();
      },
    });
  }

  async function handleReorderColumn(column, orderedColumnIds) {
    const otherColumn = column === "pickup" ? "dropoff" : "pickup";
    const otherIds = items
      .filter((item) => matchesColumn(item, otherColumn))
      .map((item) => item.id)
      .filter((id) => !orderedColumnIds.includes(id));
    const allIds = [...orderedColumnIds, ...otherIds];

    setItems((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]));
      return allIds.map((id) => byId.get(id)).filter(Boolean);
    });

    try {
      await adminReorder(`/admin/routes/${routeId}/stops/reorder`, allIds);
    } catch {
      toast.error("Không thể lưu thứ tự.");
      reload();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" headerVariant="primary">
        <DialogHeader variant="primary">
          <DialogTitle variant="primary">
            Điểm đón / trả — {routeName}
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4 px-6 py-5">
          {loading ? (
            <p className="text-sm text-admin-muted">Đang tải…</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              <StopColumn
                title="Điểm đón"
                stopType="pickup"
                items={pickupItems}
                routeId={routeId}
                usedStopIds={usedStopIds}
                onAdded={reload}
                onRemove={handleRemove}
                onReorder={(ids) => handleReorderColumn("pickup", ids)}
              />
              <StopColumn
                title="Điểm trả"
                stopType="dropoff"
                items={dropoffItems}
                routeId={routeId}
                usedStopIds={usedStopIds}
                onAdded={reload}
                onRemove={handleRemove}
                onReorder={(ids) => handleReorderColumn("dropoff", ids)}
              />
            </div>
          )}
        </DialogBody>
        {dialog}
      </DialogContent>
    </Dialog>
  );
}
