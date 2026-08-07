import * as React from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-admin-md border border-admin-border-strong bg-admin-surface px-3 py-2 text-sm text-admin-ink shadow-sm transition-colors placeholder:text-admin-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-ring disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
