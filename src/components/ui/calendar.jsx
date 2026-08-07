"use client";

import { DayPicker } from "react-day-picker";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { buttonVariants } from "@/components/ui/button";

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      locale={vi}
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col gap-2",
        month: "space-y-3",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-admin-ink",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "absolute left-1 size-7 bg-transparent p-0 opacity-70 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "absolute right-1 size-7 bg-transparent p-0 opacity-70 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-8 rounded-admin-sm text-[0.7rem] font-medium text-admin-muted",
        week: "mt-1 flex w-full",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-8 p-0 font-normal aria-selected:opacity-100",
        ),
        selected:
          "bg-admin-accent text-admin-accent-fg hover:bg-admin-accent hover:text-admin-accent-fg focus:bg-admin-accent focus:text-admin-accent-fg",
        today: "bg-admin-accent-soft text-admin-accent",
        outside: "text-admin-muted-fg opacity-50",
        disabled: "text-admin-muted-fg opacity-40",
        range_middle:
          "aria-selected:bg-admin-accent-soft aria-selected:text-admin-ink",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
