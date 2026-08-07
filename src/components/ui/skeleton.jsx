import { cn } from "@/utils/cn";
function Skeleton({
  className,
  ...props
}) {
  return <div {...props} className={cn("animate-pulse rounded-admin-md bg-admin-border", className)} />;
}
export { Skeleton };