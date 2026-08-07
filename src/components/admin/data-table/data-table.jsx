"use client";

/**
 * Thin TanStack Table wrapper bound to Paginated { items, total, page, page_size }.
 * Client only sends page / page_size / q (+ extraParams). No client-side column sort.
 */
import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminList } from "@/hooks/use-admin-list";
import { DataTableToolbar } from "@/components/admin/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/admin/data-table/data-table-pagination";

export function DataTable({
  resourcePath,
  columns,
  pageSize = 25,
  enableSelection = true,
  onBulkDelete,
  toolbarActions,
  emptyMessage = "Chưa có dữ liệu.",
  onReady,
  extraParams,
}) {
  const { query, page, setPage, search, invalidate } = useAdminList(
    resourcePath,
    pageSize,
    extraParams,
  );
  const [rowSelection, setRowSelection] = useState({});
  const data = useMemo(() => query.data?.items ?? [], [query.data]);
  const total = query.data?.total ?? 0;

  const allColumns = useMemo(() => {
    if (!enableSelection) return columns;
    const selectColumn = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Chọn tất cả"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Chọn dòng"
        />
      ),
    };
    return [selectColumn, ...columns];
  }, [columns, enableSelection]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  useEffect(() => {
    onReady?.({ invalidate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourcePath]);

  const selectedIds = Object.keys(rowSelection).map(Number);

  async function handleBulkDelete() {
    if (!onBulkDelete) return;
    await onBulkDelete(selectedIds);
    setRowSelection({});
  }

  return (
    <div className="space-y-3">
      <DataTableToolbar
        onSearch={search}
        selectedCount={selectedIds.length}
        onBulkDelete={onBulkDelete ? handleBulkDelete : undefined}
        actions={toolbarActions}
      />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {query.isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`sk-${i}`}>
                {allColumns.map((_, j) => (
                  <TableCell key={`sk-${i}-${j}`}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : query.isError ? (
            <TableRow>
              <TableCell
                colSpan={allColumns.length}
                className="py-8 text-center text-admin-danger"
              >
                Không tải được dữ liệu. Vui lòng thử lại.
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={allColumns.length}
                className="py-8 text-center text-admin-muted"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
