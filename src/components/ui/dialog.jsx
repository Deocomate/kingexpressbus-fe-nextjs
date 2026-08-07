"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[var(--z-admin-overlay)] bg-black/65 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
};

const DialogContent = React.forwardRef(
  (
    {
      className,
      children,
      size = "md",
      headerVariant = "default",
      overlayClassName,
      ...props
    },
    ref,
  ) => (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-[calc(var(--z-admin-overlay)+1)] flex max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-admin-lg border border-admin-border bg-admin-surface shadow-2xl ring-1 ring-black/10 outline-none",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute right-3 top-3 rounded-admin-sm p-1 opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-ring",
            headerVariant === "primary"
              ? "text-white hover:bg-white/20"
              : "text-admin-muted hover:bg-admin-surface-hover",
          )}
        >
          <X className="size-4" />
          <span className="sr-only">Đóng</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  ),
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogHeader({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "shrink-0 px-5 py-4 pr-12",
        variant === "primary"
          ? "border-b border-admin-primary-hover bg-admin-primary text-white"
          : "border-b border-admin-border",
        className,
      )}
      {...props}
    />
  );
}

function DialogBody({ className, ...props }) {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-4", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col-reverse gap-2 border-t border-admin-border bg-admin-surface px-5 py-3 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-sm font-semibold",
      variant === "primary" ? "text-white" : "text-admin-ink",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(
  ({ className, variant, ...props }, ref) => (
    <DialogPrimitive.Description
      ref={ref}
      className={cn(
        "mt-1 text-xs",
        variant === "primary" ? "text-white/80" : "text-admin-muted",
        className,
      )}
      {...props}
    />
  ),
);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
