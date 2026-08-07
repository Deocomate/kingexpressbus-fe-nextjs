"use client";

/**
 * List + create/edit/delete (+ optional reorder) composition.
 */
import { useRef, useState } from "react";
import { Pencil, Plus, Trash2, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import {
  adminCreate,
  adminDelete,
  adminReorder,
  adminUpdate,
  fetchPaginated,
  getErrorMessage,
} from "@/services/admin-api";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/admin-card";
import { DataTable } from "@/components/admin/data-table/data-table";
import { EntityForm } from "@/components/admin/entity-form";
import { useConfirmDialog } from "@/components/admin/confirm-dialog";
import { ReorderList } from "@/components/admin/reorder-list";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CrudSection({
  title,
  resourcePath,
  columns,
  schema,
  emptyFormValues,
  toFormValues,
  renderFields,
  reorderable = false,
  reorderLabel,
  extraParams,
  pageSize,
  createLabel = "Thêm mới",
  formTitle,
  formSize = "lg",
  transformSubmit,
  renderRowActions,
  filters,
  hideTitle = false,
  groupBy,
  groupLabel,
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [reorderItems, setReorderItems] = useState([]);
  const tableHandle = useRef(null);
  const { confirm, dialog } = useConfirmDialog();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setFormOpen(true);
  }

  async function handleSubmit(values) {
    const payload = transformSubmit ? await transformSubmit(values) : values;
    if (editing) {
      await adminUpdate(`${resourcePath}/${editing.id}`, payload);
    } else {
      await adminCreate(resourcePath, payload);
    }
    tableHandle.current?.invalidate();
  }

  function handleDeleteOne(item) {
    confirm({
      title: "Xóa mục này?",
      onConfirm: async () => {
        try {
          await adminDelete(`${resourcePath}/${item.id}`);
          toast.success("Đã xóa");
          tableHandle.current?.invalidate();
        } catch (err) {
          toast.error(getErrorMessage(err, "Không thể xóa."));
        }
      },
    });
  }

  function handleBulkDelete(ids) {
    confirm({
      title: `Xóa ${ids.length} mục?`,
      onConfirm: async () => {
        try {
          await Promise.all(
            ids.map((id) => adminDelete(`${resourcePath}/${id}`)),
          );
          toast.success("Đã xóa");
          tableHandle.current?.invalidate();
        } catch (err) {
          toast.error(
            getErrorMessage(
              err,
              "Không thể xóa hết — một số mục đang được sử dụng.",
            ),
          );
          tableHandle.current?.invalidate();
        }
      },
    });
  }

  const allColumns = [
    ...columns,
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-0.5">
          {renderRowActions?.(row.original)}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Sửa"
            onClick={() => openEdit(row.original)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Xóa"
            onClick={() => handleDeleteOne(row.original)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  async function openReorder() {
    const res = await fetchPaginated(resourcePath, {
      page: 1,
      page_size: 100,
      extra: extraParams,
    });
    if (res.total > 100) {
      toast.error(
        `Danh sách có ${res.total} mục — sắp xếp thủ công chỉ hỗ trợ tối đa 100 mục.`,
      );
      return;
    }
    setReorderItems(res.items);
    setReorderOpen(true);
  }

  async function handleReorderSave() {
    try {
      const qs = new URLSearchParams();
      for (const [key, value] of Object.entries(extraParams ?? {})) {
        if (value !== undefined && value !== "") qs.set(key, String(value));
      }
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      await adminReorder(
        `${resourcePath}/reorder${suffix}`,
        reorderItems.map((i) => i.id),
      );
      toast.success("Đã lưu thứ tự");
      tableHandle.current?.invalidate();
      setReorderOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể lưu thứ tự."));
    }
  }

  const toolbarActions = (
    <>
      {reorderable ? (
        <Button type="button" variant="outline" size="sm" onClick={openReorder}>
          <ArrowUpDown className="size-3.5" />
          Sắp xếp
        </Button>
      ) : null}
      <Button type="button" size="sm" onClick={openCreate}>
        <Plus className="size-3.5" />
        {createLabel}
      </Button>
    </>
  );

  return (
    <div className="space-y-3">
      <AdminCard title={hideTitle ? undefined : title} bodyClassName="p-0">
        <DataTable
          resourcePath={resourcePath}
          columns={allColumns}
          pageSize={pageSize}
          extraParams={extraParams}
          onBulkDelete={handleBulkDelete}
          toolbarActions={toolbarActions}
          filters={filters}
          groupBy={groupBy}
          groupLabel={groupLabel}
          onReady={(h) => {
            tableHandle.current = h;
          }}
        />
      </AdminCard>
      <EntityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        size={formSize}
        title={
          formTitle
            ? formTitle(editing)
            : editing
              ? "Chỉnh sửa"
              : createLabel
        }
        schema={schema}
        defaultValues={editing ? toFormValues(editing) : emptyFormValues}
        onSubmit={handleSubmit}
      >
        {renderFields}
      </EntityForm>
      {reorderable ? (
        <Dialog open={reorderOpen} onOpenChange={setReorderOpen}>
          <DialogContent size="lg" headerVariant="primary">
            <DialogHeader variant="primary">
              <DialogTitle variant="primary">Sắp xếp thứ tự</DialogTitle>
            </DialogHeader>
            <DialogBody className="max-h-[min(60vh,28rem)]">
              <ReorderList
                items={reorderItems}
                onOrderChange={(ids) =>
                  setReorderItems((prev) =>
                    ids.map((id) => prev.find((p) => p.id === id)).filter(Boolean),
                  )
                }
                renderLabel={(item) =>
                  reorderLabel ? reorderLabel(item) : String(item.id)
                }
              />
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReorderOpen(false)}
              >
                Hủy
              </Button>
              <Button type="button" size="sm" onClick={handleReorderSave}>
                Lưu thứ tự
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
      {dialog}
    </div>
  );
}
