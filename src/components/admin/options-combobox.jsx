"use client";

/**
 * Searchable FK picker → GET /admin/options/{resource}.
 * Uses Popover portal so the list is not clipped by Dialog overflow
 * and stacks above modal overlays (z-110).
 */
import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { apiFetch } from "@/services/api-base";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function OptionsCombobox({
  resource,
  value,
  onChange,
  placeholder = "Tìm kiếm…",
  extraParams,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const search = new URLSearchParams({ q: query });
        for (const [k, v] of Object.entries(extraParams ?? {})) {
          if (v !== undefined && v !== null) search.set(k, String(v));
        }
        const res = await apiFetch(
          `/admin/options/${resource}?${search.toString()}`,
          { credentials: "include" },
        );
        setResults(res.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open, resource]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-admin-md border border-admin-border-strong bg-admin-surface px-3 text-sm text-admin-ink shadow-sm disabled:cursor-not-allowed disabled:opacity-50",
          )}
          aria-expanded={open}
        >
          <span className={cn("truncate", !value && "text-admin-muted-fg")}>
            {value?.text ?? placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-admin-muted-fg" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-2 pointer-events-auto"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Gõ ít nhất 2 ký tự…"
        />
        <ul className="mt-2 max-h-56 overflow-y-auto">
          {loading ? (
            <li className="flex items-center gap-2 px-2 py-1.5 text-sm text-admin-muted">
              <Loader2 className="size-3.5 animate-spin" /> Đang tìm…
            </li>
          ) : results.length === 0 ? (
            <li className="px-2 py-1.5 text-sm text-admin-muted">
              {query.trim().length < 2
                ? "Nhập để tìm kiếm"
                : "Không có kết quả"}
            </li>
          ) : (
            results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(r);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2 rounded-admin-sm px-2 py-1.5 text-left text-sm hover:bg-admin-surface-hover"
                >
                  <Check
                    className={cn(
                      "size-3.5 shrink-0",
                      value?.id === r.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {r.text}
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
