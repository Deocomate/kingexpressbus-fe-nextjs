"use client";

import { format, parseISO, isValid } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function parseDate(value) {
  if (!value) return undefined;
  const d = parseISO(value);
  return isValid(d) ? d : undefined;
}

function toApiDate(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled,
  className,
}) {
  const selected = parseDate(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-8 w-full justify-start px-2.5 text-left font-normal",
            !value && "text-admin-muted-fg",
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-3.5 shrink-0 opacity-60" />
          {selected
            ? format(selected, "dd/MM/yyyy", { locale: vi })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => onChange(date ? toApiDate(date) : "")}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  disabled,
}) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  return (
    <div className="grid grid-cols-2 gap-2">
      <DatePicker
        value={startDate}
        onChange={onStartChange}
        placeholder="Từ ngày"
        disabled={disabled}
      />
      <DatePicker
        value={endDate}
        onChange={onEndChange}
        placeholder="Đến ngày"
        disabled={disabled}
      />
    </div>
  );
}

export { toApiDate, parseDate };
