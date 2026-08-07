"use client";
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/utils/cn";
const Label = React.forwardRef(({
  className,
  ...props
}, ref) => <LabelPrimitive.Root {...props} ref={ref} className={cn("text-sm font-medium leading-none text-admin-ink peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} />);
Label.displayName = LabelPrimitive.Root.displayName;
export { Label };