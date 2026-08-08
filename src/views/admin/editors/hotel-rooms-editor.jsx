"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  adminCreate,
  adminDelete,
  adminUpdate,
  fetchPaginated,
  getErrorMessage,
} from "@/services/admin-api";
import { resolveImageField } from "@/services/admin-uploads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Uploader } from "@/components/admin/uploader";
import { useConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const emptyForm = {
  name: "",
  slug: "",
  capacity_adults: 2,
  bed_label: "",
  size_m2: 30,
  amenities_text: "",
  base_price: 0,
  sale_price: 0,
  breakfast_price: 0,
  cancel_fee_percent: 50,
  inventory_count: 1,
  is_active: true,
  thumbnail: null,
};

function parseLines(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function HotelRoomsEditor({ hotelId, hotelName, open, onOpenChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPaginated(`/admin/hotels/${hotelId}/rooms`, {
        page: 1,
        page_size: 100,
      });
      setItems(data.items || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Không tải được danh sách phòng."));
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug || "",
      capacity_adults: item.capacity_adults,
      bed_label: item.bed_label || "",
      size_m2: item.size_m2 || 0,
      amenities_text: Array.isArray(item.amenities)
        ? item.amenities.join("\n")
        : "",
      base_price: item.base_price,
      sale_price: item.sale_price,
      breakfast_price: item.breakfast_price,
      cancel_fee_percent: item.cancel_fee_percent,
      inventory_count: item.inventory_count,
      is_active: !!item.is_active,
      thumbnail: item.thumbnail_url
        ? { previewUrl: item.thumbnail_url }
        : null,
    });
    setFormOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || null,
        capacity_adults: Number(form.capacity_adults) || 1,
        bed_label: form.bed_label || null,
        size_m2: Number(form.size_m2) || null,
        amenities: parseLines(form.amenities_text),
        base_price: Number(form.base_price) || 0,
        sale_price: Number(form.sale_price) || 0,
        breakfast_price: Number(form.breakfast_price) || 0,
        cancel_fee_percent: Number(form.cancel_fee_percent) || 0,
        inventory_count: Number(form.inventory_count) || 1,
        is_active: !!form.is_active,
        thumbnail_url: await resolveImageField(form.thumbnail, "hotel-rooms"),
      };
      if (editing) {
        await adminUpdate(`/admin/hotel-rooms/${editing.id}`, payload);
      } else {
        await adminCreate(`/admin/hotels/${hotelId}/rooms`, payload);
      }
      toast.success(editing ? "Đã cập nhật phòng" : "Đã thêm phòng");
      setFormOpen(false);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Không lưu được phòng."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const ok = await confirm({
      title: "Xóa phòng?",
      description: `Xóa “${item.name}”?`,
    });
    if (!ok) return;
    try {
      await adminDelete(`/admin/hotel-rooms/${item.id}`);
      toast.success("Đã xóa phòng");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Không xóa được phòng."));
    }
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Phòng — {hotelName}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={openCreate}>
                <Plus className="mr-1 h-4 w-4" />
                Thêm phòng
              </Button>
            </div>
            {loading ? (
              <p className="text-sm text-admin-muted">Đang tải…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-admin-muted">Chưa có phòng.</p>
            ) : (
              <ul className="divide-y rounded-md border">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-admin-muted">
                        {item.sale_price?.toLocaleString("vi-VN")}đ · kho{" "}
                        {item.inventory_count}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa phòng" : "Thêm phòng"}</DialogTitle>
          </DialogHeader>
          <DialogBody className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="font-medium">Tên</span>
              <Input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Giá gốc</span>
              <Input
                type="number"
                value={form.base_price}
                onChange={(e) => setField("base_price", e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Giá bán</span>
              <Input
                type="number"
                value={form.sale_price}
                onChange={(e) => setField("sale_price", e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Giá bữa sáng</span>
              <Input
                type="number"
                value={form.breakfast_price}
                onChange={(e) => setField("breakfast_price", e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Số phòng</span>
              <Input
                type="number"
                value={form.inventory_count}
                onChange={(e) => setField("inventory_count", e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Sức chứa</span>
              <Input
                type="number"
                value={form.capacity_adults}
                onChange={(e) => setField("capacity_adults", e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Giường</span>
              <Input
                value={form.bed_label}
                onChange={(e) => setField("bed_label", e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="font-medium">Tiện nghi (mỗi dòng)</span>
              <Textarea
                rows={4}
                value={form.amenities_text}
                onChange={(e) => setField("amenities_text", e.target.value)}
              />
            </label>
            <div className="sm:col-span-2">
              <p className="mb-1 text-sm font-medium">Ảnh</p>
              <Uploader
                value={form.thumbnail}
                onChange={(value) => setField("thumbnail", value)}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button type="button" disabled={saving || !form.name} onClick={handleSave}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {dialog}
    </>
  );
}
