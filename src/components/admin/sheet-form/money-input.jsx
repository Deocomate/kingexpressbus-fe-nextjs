"use client";
// Lightweight VND amount input — thousand-separator display, plain integer
// (no decimals) underneath. No AutoNumeric/lib dependency; Intl.NumberFormat
// covers the one formatting need admin forms have (price/surcharge fields).
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
const formatter = new Intl.NumberFormat("vi-VN");
export function MoneyInput({
  value,
  onChange,
  className,
  ...props
}) {
  const [text, setText] = useState(() => formatter.format(value));
  function handleChange(e) {
    const digits = e.target.value.replace(/[^\d]/g, "");
    const next = digits === "" ? 0 : parseInt(digits, 10);
    setText(digits === "" ? "" : formatter.format(next));
    onChange(next);
  }
  return <div className="relative"><Input {...props} inputMode="numeric" value={text} onChange={handleChange} className={cn("pr-10", className)} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-admin-muted-fg">đ</span></div>;
}