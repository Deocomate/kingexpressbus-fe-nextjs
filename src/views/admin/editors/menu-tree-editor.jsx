"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import {
  adminCreate,
  adminDelete,
  adminGet,
  adminUpdate,
  getErrorMessage,
} from "@/services/admin-api";
import { apiFetch } from "@/services/api-base";
import { EntityForm } from "@/components/admin/entity-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(1, "Bắt buộc").max(1000),
  url: z.string().nullable(),
  parent_id: z.number().nullable(),
});

function buildTree(items) {
  const byParent = new Map();
  for (const item of items) {
    const key = item.parent_id ?? -1;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(item);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => b.priority - a.priority);
  }
  return byParent;
}

export function MenuTreeEditor() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-menus"],
    queryFn: () => adminGet("/admin/menus"),
  });
  const [editing, setEditing] = useState(null);
  const [newParentId, setNewParentId] = useState(null);
  const { confirm, dialog } = useConfirmDialog();

  const items = useMemo(() => data ?? [], [data]);
  const tree = useMemo(() => buildTree(items), [items]);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-menus"] });
  }

  async function saveOrderForLevel(parentId, ordered) {
    const rest = items.filter(
      (i) => (i.parent_id ?? -1) !== (parentId ?? -1),
    );
    const updatedLevel = ordered.map((item, idx) => ({
      id: item.id,
      parent_id: item.parent_id,
      priority: ordered.length - idx,
    }));
    const allItems = [
      ...rest.map((i) => ({
        id: i.id,
        parent_id: i.parent_id,
        priority: i.priority,
      })),
      ...updatedLevel,
    ];
    try {
      await apiFetch("/admin/menus/reorder-tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: allItems }),
      });
      invalidate();
    } catch {
      toast.error("Không thể lưu thứ tự.");
    }
  }

  function move(levelItems, index, direction) {
    const target = index + direction;
    if (target < 0 || target >= levelItems.length) return;
    const next = [...levelItems];
    [next[index], next[target]] = [next[target], next[index]];
    saveOrderForLevel(levelItems[0]?.parent_id ?? null, next);
  }

  function handleDelete(item) {
    confirm({
      title: `Xóa mục menu "${item.name}"?`,
      onConfirm: async () => {
        try {
          await adminDelete(`/admin/menus/${item.id}`);
          toast.success("Đã xóa");
          invalidate();
        } catch (err) {
          toast.error(
            getErrorMessage(err, "Không thể xóa — mục này còn menu con."),
          );
        }
      },
    });
  }

  function renderLevel(parentId, depth) {
    const levelItems = tree.get(parentId ?? -1) ?? [];
    return (
      <ul
        className={
          depth > 0
            ? "ml-4 space-y-1 border-l border-admin-border pl-3"
            : "space-y-1"
        }
      >
        {levelItems.map((item, index) => (
          <li key={item.id}>
            <div className="flex items-center justify-between rounded-admin-md border border-admin-border bg-admin-surface px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-admin-ink">
                  {item.name}
                </p>
                {item.url ? (
                  <p className="truncate text-xs text-admin-muted">{item.url}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Di chuyển lên"
                  disabled={index === 0}
                  onClick={() => move(levelItems, index, -1)}
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Di chuyển xuống"
                  disabled={index === levelItems.length - 1}
                  onClick={() => move(levelItems, index, 1)}
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Thêm mục con"
                  disabled={depth >= 3}
                  onClick={() => {
                    setNewParentId(item.id);
                    setEditing("new");
                  }}
                >
                  <Plus className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Sửa"
                  onClick={() => setEditing(item)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label="Xóa"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
            {renderLevel(item.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-admin-muted">Đang tải…</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setNewParentId(null);
            setEditing("new");
          }}
        >
          <Plus className="size-3.5" />
          Thêm mục gốc
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-admin-muted">Chưa có mục menu nào.</p>
      ) : (
        renderLevel(null, 0)
      )}

      <MenuFormSheet
        open={editing !== null}
        editing={editing === "new" ? null : editing}
        defaultParentId={newParentId}
        allItems={items}
        onOpenChange={(open) => !open && setEditing(null)}
        onSaved={invalidate}
      />
      {dialog}
    </div>
  );
}

function MenuFormSheet({
  open,
  editing,
  defaultParentId,
  allItems,
  onOpenChange,
  onSaved,
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    values: open
      ? {
          name: editing?.name ?? "",
          url: editing?.url ?? null,
          parent_id: editing ? editing.parent_id : defaultParentId,
        }
      : undefined,
  });

  async function onSubmit(values) {
    try {
      if (editing) {
        await adminUpdate(`/admin/menus/${editing.id}`, {
          name: values.name,
          url: values.url || null,
          parent_id: values.parent_id,
        });
      } else {
        await adminCreate("/admin/menus", {
          name: values.name,
          url: values.url || null,
          parent_id: values.parent_id,
        });
      }
      toast.success("Đã lưu");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Không thể lưu — kiểm tra độ sâu menu (tối đa 4 cấp).",
        ),
      );
    }
  }

  return (
    <EntityForm
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Sửa mục menu" : "Thêm mục menu"}
      schema={schema}
      defaultValues={{
        name: editing?.name ?? "",
        url: editing?.url ?? null,
        parent_id: editing ? editing.parent_id : defaultParentId,
      }}
      onSubmit={onSubmit}
      successMessage="Đã lưu"
    >
      {(form) => (
        <>
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
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đường dẫn</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="/tuyen-duong"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mục cha</FormLabel>
                <FormControl>
                  <Select
                    value={
                      field.value != null ? String(field.value) : "root"
                    }
                    onValueChange={(v) =>
                      field.onChange(v === "root" ? null : Number(v))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">— Gốc —</SelectItem>
                      {allItems
                        .filter((i) => !editing || i.id !== editing.id)
                        .map((i) => (
                          <SelectItem key={i.id} value={String(i.id)}>
                            {i.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </>
      )}
    </EntityForm>
  );
}
