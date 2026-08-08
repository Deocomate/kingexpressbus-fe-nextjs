"use client";

import { useRef, useState } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { adminCreate, getErrorMessage } from "@/services/admin-api";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/data-table/data-table";
import { AdminCard } from "@/components/admin/admin-card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const TABS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

const STATUS_VARIANT = {
  pending: "warning",
  confirmed: "default",
  completed: "success",
  cancelled: "destructive",
};

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const currency = new Intl.NumberFormat("vi-VN");

/**
 * Shared admin list + confirm/complete/cancel for hotel and tour bookings.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} props.resourcePath e.g. /admin/hotel-bookings
 * @param {Array} props.columns column defs before status/actions
 * @param {(row: object) => import('react').ReactNode} props.renderDetail
 */
export function ServiceBookingsSection({
  title,
  description,
  resourcePath,
  columns: baseColumns,
  renderDetail,
}) {
  const [tab, setTab] = useState("all");
  const [viewing, setViewing] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [busy, setBusy] = useState(false);
  const tableHandle = useRef(null);

  async function runAction(path, body) {
    setBusy(true);
    try {
      await adminCreate(path, body ?? {});
      toast.success("Đã cập nhật");
      setViewing(null);
      tableHandle.current?.invalidate();
    } catch (err) {
      toast.error(getErrorMessage(err, "Không cập nhật được."));
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    ...baseColumns,
    {
      accessorKey: "status",
      header: "TT",
      cell: ({ getValue }) => (
        <Badge variant={STATUS_VARIANT[getValue()]}>
          {STATUS_LABEL[getValue()] ?? getValue()}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setCancelReason("");
            setViewing(row.original);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={title} description={description} />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <AdminCard>
        <DataTable
          resourcePath={resourcePath}
          columns={columns}
          enableSelection={false}
          extraParams={tab === "all" ? undefined : { status_filter: tab }}
          onReady={(h) => {
            tableHandle.current = h;
          }}
        />
      </AdminCard>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>#{viewing?.booking_code}</DialogTitle>
          </DialogHeader>
          {viewing ? (
            <DialogBody className="space-y-2 text-sm">
              {renderDetail(viewing, { currency, statusLabel: STATUS_LABEL })}
              {viewing.status !== "cancelled" ? (
                <Textarea
                  placeholder="Lý do hủy (nếu hủy)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              ) : null}
            </DialogBody>
          ) : null}
          <DialogFooter className="flex-wrap gap-2">
            {viewing?.status === "pending" ? (
              <Button
                disabled={busy}
                onClick={() => runAction(`${resourcePath}/${viewing.id}/confirm`)}
              >
                Xác nhận
              </Button>
            ) : null}
            {viewing?.status === "confirmed" ? (
              <Button
                disabled={busy}
                onClick={() => runAction(`${resourcePath}/${viewing.id}/complete`)}
              >
                Hoàn thành
              </Button>
            ) : null}
            {viewing && viewing.status !== "cancelled" ? (
              <Button
                variant="destructive"
                disabled={busy}
                onClick={() =>
                  runAction(`${resourcePath}/${viewing.id}/cancel`, {
                    reason: cancelReason || null,
                  })
                }
              >
                Hủy
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
