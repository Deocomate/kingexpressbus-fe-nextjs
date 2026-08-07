"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { revertUpload, stageUpload } from "@/services/admin-uploads";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

// `token` present only for a freshly staged (uncommitted) file — the caller
// must commitUpload(token, dir) on successful save. Absent `token` with a
// `previewUrl` means "already-committed URL from editing an existing
// entity", nothing to commit, previewUrl IS the persisted path/URL as-is.

/**
 * @typedef {{ token?: string, previewUrl: string } | null} UploaderValue
 */

export function Uploader({
  value,
  onChange,
  accept = { "image/*": [] },
  label = "Tải ảnh lên",
}) {
  const inputRef = useRef(null);
  const [pending, setPending] = useState(false);

  const handleFiles = useCallback(
    async (files) => {
      const file = files?.[0];
      if (!file) return;
      setPending(true);
      try {
        if (value?.token) {
          try {
            await revertUpload(value.token);
          } catch {
            // best-effort revert of previous staged file
          }
        }
        const staged = await stageUpload(file);
        const previewUrl = URL.createObjectURL(file);
        onChange({ token: staged.token, previewUrl });
      } catch (err) {
        toast.error("Không thể tải tệp lên.");
        console.error(err);
      } finally {
        setPending(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange, value?.token],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept:
      typeof accept === "string"
        ? { [accept]: [] }
        : accept,
    multiple: false,
    disabled: pending,
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles) => {
      void handleFiles(acceptedFiles);
    },
  });

  async function handleRemove() {
    if (value?.token) {
      try {
        await revertUpload(value.token);
      } catch {
        // ignore
      }
    }
    onChange(null);
  }

  return (
    <div>
      <input
        {...getInputProps({
          ref: inputRef,
        })}
      />
      {value ? (
        <div className="flex items-center gap-3 rounded-admin-md border border-admin-border-strong p-2">
          <img
            src={value.previewUrl}
            alt="Xem trước tệp đã tải lên"
            className="size-12 rounded-admin-sm object-cover"
          />
          <span className="flex-1 truncate text-sm text-admin-muted">
            {value.token ? "Đã chọn tệp" : "Ảnh hiện tại"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Xóa tệp đã chọn"
            onClick={handleRemove}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps({
            onClick: open,
            className: cn(
              "flex w-full cursor-pointer items-center justify-center gap-2 rounded-admin-md border border-dashed py-6 text-sm text-admin-muted transition-colors",
              isDragActive
                ? "border-admin-primary bg-admin-primary/5 text-admin-primary"
                : "border-admin-border-strong hover:bg-admin-surface-hover",
              pending && "pointer-events-none opacity-50",
            ),
          })}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {pending
            ? "Đang tải lên…"
            : isDragActive
              ? "Thả tệp vào đây…"
              : label}
        </div>
      )}
    </div>
  );
}
