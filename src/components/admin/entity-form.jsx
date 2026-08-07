"use client";

/**
 * Create/edit centered dialog: Dialog + React Hook Form + Zod.
 * AdminLTE-style modal with primary header strip.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/services/admin-api";

export function EntityForm({
  open,
  onOpenChange,
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  successMessage = "Đã lưu",
  size = "lg",
  children,
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    values: open ? defaultValues : undefined,
  });

  async function handleSubmit(values) {
    try {
      await onSubmit(values);
      toast.success(successMessage);
      onOpenChange(false);
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Không thể lưu. Vui lòng kiểm tra lại thông tin."),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size={size} headerVariant="primary">
        <DialogHeader variant="primary">
          <DialogTitle variant="primary">{title}</DialogTitle>
          {description ? (
            <DialogDescription variant="primary">{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
            noValidate
          >
            <DialogBody className="space-y-4">{children(form)}</DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Đang lưu…" : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/** @deprecated Use EntityForm */
export const SheetForm = EntityForm;
