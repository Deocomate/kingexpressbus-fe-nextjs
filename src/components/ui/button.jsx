import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-admin-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-ring", {
  variants: {
    variant: {
      default: "bg-admin-accent text-admin-accent-fg hover:bg-admin-accent-hover",
      destructive: "bg-admin-danger text-white hover:bg-admin-danger/90",
      outline: "border border-admin-border-strong bg-admin-surface text-admin-ink hover:bg-admin-surface-hover",
      secondary: "bg-admin-surface-hover text-admin-ink hover:bg-admin-border",
      ghost: "text-admin-ink hover:bg-admin-surface-hover",
      link: "text-admin-accent underline-offset-4 hover:underline"
    },
    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-admin-sm px-3 text-xs",
      lg: "h-10 rounded-admin-md px-6",
      icon: "h-9 w-9"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
const Button = React.forwardRef(({
  className,
  variant,
  size,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp {...props} className={cn(buttonVariants({
    variant,
    size,
    className
  }))} ref={ref} />;
});
Button.displayName = "Button";
export { Button, buttonVariants };