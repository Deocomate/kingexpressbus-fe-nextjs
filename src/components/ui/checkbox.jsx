"use client";
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/utils/cn";
const Checkbox = React.forwardRef(({
  className,
  ...props
}, ref) => <CheckboxPrimitive.Root {...props} ref={ref} className={cn("peer size-4 shrink-0 rounded-admin-sm border border-admin-border-strong bg-admin-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-admin-accent data-[state=checked]:bg-admin-accent data-[state=checked]:text-admin-accent-fg data-[state=indeterminate]:border-admin-accent data-[state=indeterminate]:bg-admin-accent data-[state=indeterminate]:text-admin-accent-fg", className)}><CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">{props.checked === "indeterminate" ? <Minus className="size-3" /> : <Check className="size-3" />}</CheckboxPrimitive.Indicator></CheckboxPrimitive.Root>);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
export { Checkbox };