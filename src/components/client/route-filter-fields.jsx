import {
  ArrowDownWideNarrow,
  Check,
  Clock,
  RotateCcw,
  Star,
  Wallet,
} from "lucide-react";

/**
 * Port of routes/partials/filter-form.blade.php. Blade's version also has a
 * "bus type" (dòng xe) checkbox group backed by `$filters['bus_categories']`
 * — the public trip-search API has no bus-category field at all (only
 * `bus_model`, a free-text string), so that group is dropped rather than
 * faked. Collapsible accordion behaviour (JS-toggled `.filter-content`) is
 * also not ported: sections render always-expanded, which is visually
 * equivalent minus the collapse animation — documented in the phase report.
 */
export function RouteFilterFields({
  filterState,
  sortOptions,
  timeRangeOptions,
  serviceOptions,
  priceRange,
  labels,
}) {
  return (
    <div className="grow space-y-0">
      <div className="border-b border-line p-5">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-muted">
          <ArrowDownWideNarrow
            className="h-3.5 w-3.5 text-brand-600"
            aria-hidden="true"
          />
          {labels.sort_title}
        </p>
        <div className="mt-3 space-y-2.5">
          {sortOptions.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-3 text-sm text-muted hover:text-ink">
              <input
                type="radio"
                name="sort"
                value={option.value}
                defaultChecked={filterState.sort === option.value}
                className="h-4 w-4 border-line-strong text-brand-600 focus:ring-brand-500"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="border-b border-line p-5">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-muted">
          <Wallet className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
          {labels.price_title}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="number"
            name="price_min"
            defaultValue={filterState.priceMin}
            placeholder={
              priceRange.min ? String(priceRange.min) : labels.price_from
            }
            min={0}
            inputMode="numeric"
            className="kx-form-control w-full px-4 py-2.5 text-sm"
          />
          <span className="text-line-strong">-</span>
          <input
            type="number"
            name="price_max"
            defaultValue={filterState.priceMax}
            placeholder={
              priceRange.max ? String(priceRange.max) : labels.price_to
            }
            min={0}
            inputMode="numeric"
            className="kx-form-control w-full px-4 py-2.5 text-sm"
          />
        </div>
      </div>
      {timeRangeOptions.length > 0 && (
        <div className="border-b border-line p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-muted">
            <Clock className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            {labels.time_range_title}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {timeRangeOptions.map((option) => {
              const checked = filterState.timeRanges.includes(option.key);
              return (
                <label key={option.key} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="time_ranges"
                    value={option.key}
                    defaultChecked={checked}
                    className="peer sr-only"
                  />
                  <span className="inline-flex items-center gap-1 rounded-sm border border-line bg-panel px-3 py-1.5 text-xs font-medium text-muted transition peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
      {serviceOptions.length > 0 && (
        <div className="p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-muted">
            <Star className="h-3.5 w-3.5 text-yellow-500" aria-hidden="true" />
            {labels.services_title}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {serviceOptions.map((service) => {
              const checked = filterState.services.includes(service);
              return (
                <label key={service} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="services"
                    value={service}
                    defaultChecked={checked}
                    className="peer sr-only"
                  />
                  <span className="inline-flex items-center gap-1 rounded-sm border border-line bg-panel px-3 py-1.5 text-xs font-medium text-muted transition peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white">
                    {service}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
      <div className="border-t border-brand-100 bg-brand-50/60 p-4">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {labels.apply_button}
        </button>
      </div>
    </div>
  );
}
export function RouteFilterClearLink({ href, label }) {
  return (
    <a
      href={href}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm border border-line-strong bg-surface py-2.5 text-sm font-medium text-muted transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
    >
      <RotateCcw className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  );
}
