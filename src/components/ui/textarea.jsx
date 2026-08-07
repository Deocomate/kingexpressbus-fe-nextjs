import * as React from "react";
import { cn } from "@/utils/cn";
const Textarea = React.forwardRef(({
  className,
  ...props
}, ref) => {
  return <textarea {...props} ref={ref} className={cn("flex min-h-24 w-full rounded-admin-md border border-admin-border-strong bg-admin-surface px-3.5 py-2.5 text-sm text-admin-ink shadow-sm transition-colors placeholder:text-admin-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-ring disabled:cursor-not-allowed disabled:opacity-50", className)} />;
});
Textarea.displayName = "Textarea";
export { Textarea };