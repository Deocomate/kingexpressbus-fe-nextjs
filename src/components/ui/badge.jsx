import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";
const badgeVariants = cva("inline-flex items-center rounded-admin-sm px-2 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-admin-accent-soft text-admin-accent",
      secondary: "bg-admin-surface-hover text-admin-muted",
      success: "bg-admin-success-soft text-admin-success",
      warning: "bg-admin-warn-soft text-admin-warn",
      destructive: "bg-admin-danger-soft text-admin-danger",
      outline: "border border-admin-border-strong text-admin-ink"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
function Badge({
  className,
  variant,
  ...props
}) {
  return <span {...props} className={cn(badgeVariants({
    variant
  }), className)} />;
}
export { Badge, badgeVariants };