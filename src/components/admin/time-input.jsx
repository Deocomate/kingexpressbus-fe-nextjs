"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const MINUTES = ["00", "15", "30", "45"];

function snapMinute(minute) {
  const n = Number(minute);
  if (!Number.isFinite(n)) return "00";
  if (MINUTES.includes(String(n).padStart(2, "0"))) {
    return String(n).padStart(2, "0");
  }
  const quarters = [0, 15, 30, 45, 60];
  let best = 0;
  let dist = Infinity;
  for (const q of quarters) {
    const d = Math.abs(n - q);
    if (d < dist) {
      dist = d;
      best = q === 60 ? 0 : q;
    }
  }
  return String(best).padStart(2, "0");
}

function parseTime(value) {
  if (!value || typeof value !== "string") {
    return { hour: "00", minute: "00" };
  }
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!match) return { hour: "00", minute: "00" };
  const hour = String(Math.min(23, Math.max(0, Number(match[1])))).padStart(
    2,
    "0",
  );
  const minute = snapMinute(match[2]);
  return { hour, minute };
}

function formatDisplay(value) {
  if (!value) return null;
  const { hour, minute } = parseTime(value);
  return `${hour}:${minute}`;
}

function toApiTime(hour, minute) {
  return `${hour}:${minute}:00`;
}

export function TimeInput({
  value,
  onChange,
  placeholder = "Chọn giờ",
  disabled,
  className,
  name,
  onBlur,
}) {
  const [open, setOpen] = useState(false);
  const parsed = useMemo(() => parseTime(value), [value]);
  const display = formatDisplay(value);

  function pick(hour, minute) {
    if (typeof onChange === "function") {
      onChange(toApiTime(hour, snapMinute(minute)));
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          name={name}
          onBlur={onBlur}
          className={cn(
            "h-10 w-full justify-start px-3 text-left font-normal",
            !display && "text-admin-muted-fg",
            className,
          )}
        >
          <Clock className="mr-2 size-4 shrink-0 opacity-60" />
          {display ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden p-0"
        align="start"
        side="bottom"
        sideOffset={8}
        collisionPadding={12}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2 p-3">
          <p className="text-xs font-medium text-admin-muted">Chọn giờ</p>
          <div className="flex gap-2">
            <TimeColumn
              label="Giờ"
              options={HOURS}
              value={parsed.hour}
              active={open}
              onSelect={(hour) => pick(hour, parsed.minute)}
            />
            <TimeColumn
              label="Phút"
              options={MINUTES}
              value={parsed.minute}
              active={open}
              onSelect={(minute) => pick(parsed.hour, minute)}
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-admin-border pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (typeof onChange === "function") onChange("");
                setOpen(false);
              }}
            >
              Xóa
            </Button>
            <Button type="button" size="sm" onClick={() => setOpen(false)}>
              Xong
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TimeColumn({ label, options, value, onSelect, active }) {
  const listRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    selectedRef.current?.scrollIntoView({ block: "center" });
  }, [active, value]);

  function handleWheel(e) {
    // Keep wheel scrolling inside this list (Dialog/Popover often steal it).
    e.stopPropagation();
    const el = listRef.current;
    if (!el) return;
    el.scrollTop += e.deltaY;
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-center text-[0.65rem] font-medium uppercase tracking-wide text-admin-muted">
        {label}
      </span>
      <div
        ref={listRef}
        className="h-48 w-16 overflow-y-auto overscroll-contain rounded-admin-md border border-admin-border bg-admin-surface-hover p-1"
        role="listbox"
        aria-label={label}
        onWheel={handleWheel}
      >
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={selected}
              ref={selected ? selectedRef : undefined}
              className={cn(
                "flex w-full items-center justify-center rounded-admin-sm py-1.5 text-sm tabular-nums transition-colors",
                selected
                  ? "bg-admin-primary font-semibold text-admin-primary-fg"
                  : "text-admin-ink hover:bg-admin-surface",
              )}
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
