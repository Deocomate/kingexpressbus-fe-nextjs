"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  adminCreate,
  adminDelete,
  adminGet,
  getErrorMessage,
} from "@/services/admin-api";
import { DatePicker } from "@/components/admin/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirmDialog } from "@/components/admin/confirm-dialog";

const BLOCK_TYPES = [
  { value: "off_day", label: "Nghỉ ngày" },
  { value: "sold_out", label: "Hết chỗ" },
];

export function TripBlocksEditor({ tripId, open, onOpenChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [blockType, setBlockType] = useState("off_day");
  const [note, setNote] = useState("");
  const { confirm, dialog } = useConfirmDialog();

  async function reload() {
    setLoading(true);
    try {
      const res = await adminGet(
        `/admin/trip-blocks?page=1&page_size=100&trip_id=${tripId}`,
      );
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tripId]);

  async function handleAdd() {
    if (!startDate || !endDate) {
      toast.error("Chọn khoảng ngày.");
      return;
    }
    try {
      await adminCreate("/admin/trip-blocks", {
        trip_id: tripId,
        start_date: startDate,
        end_date: endDate,
        block_type: blockType,
        note: note || null,
      });
      setStartDate("");
      setEndDate("");
      setNote("");
      toast.success("Đã thêm chặn lịch");
      reload();
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Không thể thêm — kiểm tra khoảng ngày."),
      );
    }
  }

  function handleRemove(item) {
    confirm({
      title: "Xóa chặn lịch này?",
      onConfirm: async () => {
        await adminDelete(`/admin/trip-blocks/${item.id}`);
        toast.success("Đã xóa");
        reload();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Chặn lịch chuyến</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-3 rounded-admin-md border border-admin-border bg-admin-surface-hover p-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1 text-[0.65rem] font-medium uppercase tracking-wide text-admin-muted">
                  Từ ngày
                </p>
                <DatePicker value={startDate} onChange={setStartDate} />
              </div>
              <div>
                <p className="mb-1 text-[0.65rem] font-medium uppercase tracking-wide text-admin-muted">
                  Đến ngày
                </p>
                <DatePicker value={endDate} onChange={setEndDate} />
              </div>
            </div>
            <Select value={blockType} onValueChange={setBlockType}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOCK_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú (tùy chọn)"
            />
            <Button type="button" size="sm" onClick={handleAdd}>
              <Plus className="size-3.5" />
              Thêm chặn lịch
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-admin-muted">Đang tải…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-admin-muted">Chưa có chặn lịch nào.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-admin-md border border-admin-border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-admin-ink">
                      {item.start_date} → {item.end_date}
                    </p>
                    <p className="text-xs text-admin-muted">
                      {BLOCK_TYPES.find((t) => t.value === item.block_type)
                        ?.label}
                      {item.note ? ` — ${item.note}` : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label="Xóa chặn lịch"
                    onClick={() => handleRemove(item)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </DialogBody>
        {dialog}
      </DialogContent>
    </Dialog>
  );
}
