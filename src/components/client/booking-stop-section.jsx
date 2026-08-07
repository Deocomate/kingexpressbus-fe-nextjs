/**
 * Pickup/dropoff stop radios for the booking form.
 * Returns stop cards only — parent owns the grid so hotel pickup
 * can sit in the same row without nested grids.
 */
export function BookingStopSection({
  stops,
  selectedId,
  onSelect,
  searchQuery,
  dataType,
}) {
  const q = searchQuery.trim().toLowerCase();
  const visible = stops.filter(
    (stop) =>
      !q || `${stop.name} ${stop.address ?? ""}`.toLowerCase().includes(q),
  );
  return visible.map((stop) => {
    const idStr = String(stop.stop_id);
    const selected = selectedId === idStr;
    return (
      <label
        key={idStr}
        className={`stop-card flex items-start gap-3 rounded-sm border border-line-strong bg-panel p-4${selected ? " selected" : ""}`}
      >
        <input
          type="radio"
          name={`${dataType}_stop_id`}
          value={idStr}
          checked={selected}
          onChange={() => onSelect(idStr)}
          className="sr-only stop-input"
        />
        <span className="stop-radio" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink">
            {stop.name}
          </span>
          {stop.address && (
            <span className="mt-1 line-clamp-2 block text-xs text-muted">
              {stop.address}
            </span>
          )}
        </span>
      </label>
    );
  });
}
