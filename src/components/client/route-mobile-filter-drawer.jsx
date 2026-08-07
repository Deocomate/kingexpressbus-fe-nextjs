"use client";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { RouteFilterFields } from "@/components/client/route-filter-fields";

/**
 * Mobile slide-in filter panel for the route detail page.
 */
export function RouteMobileFilterDrawer({
  action,
  filterState,
  sortOptions,
  timeRangeOptions,
  serviceOptions,
  priceRange,
  labels,
  activeFilterCount,
  dateValue,
  hasSeats,
  mobileButtonLabel,
  mobileTitle,
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ksb-btn-secondary px-5 text-sm lg:hidden"
        aria-controls="filter-panel-mobile"
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        <span>{mobileButtonLabel}</span>
        {activeFilterCount > 0 && (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-brand-600 text-xs font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>
      {open && (
        <div
          className="ksb-drawer-backdrop fixed inset-0 z-drawer bg-slate-900/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        id="filter-panel-mobile"
        className={`ksb-drawer fixed inset-y-0 left-0 z-drawer w-[320px] max-w-[90vw] overflow-y-auto bg-surface shadow-card transition-transform duration-300 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label={mobileTitle}
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <h3 className="text-lg font-bold text-ink">{mobileTitle}</h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={labels.close ?? mobileTitle}
            className="text-2xl text-muted hover:text-ink"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <form
          action={action}
          method="get"
          className="h-[calc(100vh-72px)] overflow-y-auto"
        >
          <input type="hidden" name="date" value={dateValue} />
          {hasSeats && <input type="hidden" name="has_seats" value="1" />}
          <RouteFilterFields
            filterState={filterState}
            sortOptions={sortOptions}
            timeRangeOptions={timeRangeOptions}
            serviceOptions={serviceOptions}
            priceRange={priceRange}
            labels={labels}
          />
        </form>
      </div>
    </>
  );
}
