"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeftRight, MapPin, Search, X } from "lucide-react";
import { listRoutes } from "@/services/booking-api";
import { localePath, CLIENT_ROUTES } from "@/services/client-routes";
function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function formatDisplayDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}
function findLocation(locations, id) {
  if (id == null || id === "") return null;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;
  return locations.find((item) => item.id === numericId) ?? null;
}
export function SearchBar({
  locale,
  provinces,
  submitLabel,
  initialOriginId,
  initialDestinationId,
  initialDate,
  initialReturnDate,
}) {
  const t = useTranslations("client.search");
  const router = useRouter();
  const locations = useMemo(
    () =>
      provinces.map((p) => ({
        id: p.id,
        type: "province",
        name: p.name,
        normalized: normalize(p.name),
      })),
    [provinces],
  );
  const [origin, setOrigin] = useState(
    () => findLocation(locations, initialOriginId) ?? locations[0] ?? null,
  );
  const [destination, setDestination] = useState(
    () =>
      findLocation(locations, initialDestinationId) ??
      locations[1] ??
      locations[0] ??
      null,
  );
  const [departureDate, setDepartureDate] = useState(
    () => initialDate || todayIso(),
  );
  const [returnDate, setReturnDate] = useState(() => initialReturnDate || "");
  const [showReturn, setShowReturn] = useState(() => !!initialReturnDate);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef(null);
  const originSearchRef = useRef(null);
  const destinationSearchRef = useRef(null);
  const departureInputRef = useRef(null);
  const returnInputRef = useRef(null);
  // Keep fields in sync when the parent route/search context changes
  // (e.g. soft-nav between /tuyen-duong/[slug] pages).
  useEffect(() => {
    const nextOrigin = findLocation(locations, initialOriginId);
    if (nextOrigin) setOrigin(nextOrigin);
    const nextDestination = findLocation(locations, initialDestinationId);
    if (nextDestination) setDestination(nextDestination);
  }, [locations, initialOriginId, initialDestinationId]);
  useEffect(() => {
    if (initialDate) setDepartureDate(initialDate);
  }, [initialDate]);
  useEffect(() => {
    if (initialOriginId == null && initialDestinationId == null) return;
    if (initialReturnDate) {
      setReturnDate(initialReturnDate);
      setShowReturn(true);
    } else {
      setReturnDate("");
      setShowReturn(false);
    }
  }, [initialOriginId, initialDestinationId, initialReturnDate]);
  useEffect(() => {
    if (!activeDropdown) return;
    function onPointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [activeDropdown]);
  function groupedLocations(query) {
    const needle = normalize(query);
    const filtered = !needle
      ? locations.slice(0, 24)
      : locations
          .filter((item) => item.normalized.includes(needle))
          .slice(0, 24);
    const orderedTypes = ["province", "district", "stop"];
    return orderedTypes
      .map((type) => ({
        type,
        label: t(`types.${type}`),
        items: filtered.filter((item) => item.type === type),
      }))
      .filter((group) => group.items.length > 0);
  }
  function toggleDropdown(field) {
    setActiveDropdown((current) => (current === field ? null : field));
    setError(null);
    if (field === "origin") setOriginQuery("");
    if (field === "destination") setDestinationQuery("");
    requestAnimationFrame(() => {
      if (field === "origin") originSearchRef.current?.focus();
      if (field === "destination") destinationSearchRef.current?.focus();
    });
  }
  function isSelected(field, item) {
    const selected = field === "origin" ? origin : destination;
    return !!selected && selected.id === item.id && selected.type === item.type;
  }
  function selectLocation(field, item) {
    if (field === "origin") setOrigin(item);
    else setDestination(item);
    setActiveDropdown(null);
    setError(null);
  }
  function swapLocations() {
    const oldOrigin = origin;
    setOrigin(destination);
    setDestination(oldOrigin);
    setError(null);
  }
  function openDeparturePicker() {
    const input = departureInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") input.showPicker();
    else input.focus();
  }
  function openReturnPicker() {
    const input = returnInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") input.showPicker();
    else input.focus();
  }
  function enableReturnDate() {
    setShowReturn(true);
    requestAnimationFrame(() => openReturnPicker());
  }
  function removeReturnDate() {
    setReturnDate("");
    setShowReturn(false);
  }
  function onDepartureChange(value) {
    setDepartureDate(value);
    setError(null);
    if (returnDate && value && returnDate < value) {
      setReturnDate("");
    }
  }
  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    if (!origin || !destination) {
      setError(t("validation.select_suggestion"));
      return;
    }
    if (origin.id === destination.id && origin.type === destination.type) {
      setError(t("validation.different_locations"));
      return;
    }
    if (!departureDate) {
      setError(t("date_placeholder"));
      return;
    }
    setLoading(true);
    try {
      const routes = await listRoutes({
        originProvinceId: origin.id,
        destinationProvinceId: destination.id,
      });
      const route = routes[0];
      if (!route) {
        setError(t("no_results"));
        return;
      }
      const query = new URLSearchParams({
        date: departureDate,
      });
      if (showReturn && returnDate) query.set("return_date", returnDate);
      router.push(
        `${localePath(locale, CLIENT_ROUTES.routesIndex)}/${route.slug}?${query.toString()}`,
      );
    } catch {
      setError(t("no_results"));
    } finally {
      setLoading(false);
    }
  }
  return (
    <div ref={rootRef} className="kx-search-bar">
      <form
        onSubmit={handleSubmit}
        className={`kx-surface p-3 sm:p-4 ${activeDropdown ? "overflow-visible" : ""}`}
      >
        <div
          className={`grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_auto_minmax(0,1.2fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_auto] lg:items-center ${activeDropdown ? "overflow-visible" : ""}`}
        >
          {" "}
          <div
            className={`relative ${activeDropdown === "origin" ? "kx-search-bar__field--open" : ""}`}
          >
            <button
              type="button"
              onClick={() => toggleDropdown("origin")}
              aria-haspopup="listbox"
              aria-expanded={activeDropdown === "origin"}
              className={`kx-form-control group flex h-14 w-full items-center gap-3 px-4 text-left ${activeDropdown === "origin" ? "border-brand-600 bg-white shadow-[0_0_0_3px_rgba(255,155,0,0.24)]" : ""}`}
            >
              {" "}
              <img
                src="/assets/client/icons/pickup.svg"
                alt={t("origin_icon_alt")}
                className="h-5 w-5 shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {t("origin_label")}
                </span>
                <span className="block truncate text-sm font-bold text-ink">
                  {origin?.name || t("origin_placeholder")}
                </span>
              </span>
              <ChevronDownIcon open={activeDropdown === "origin"} />
            </button>
            {activeDropdown === "origin" && (
              <div className="kx-search-bar__menu">
                <div className="overflow-hidden rounded-sm border border-line-strong bg-white shadow-card">
                  <div className="border-b border-line-strong p-3">
                    <label className="relative block">
                      <Search
                        className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted"
                        aria-hidden="true"
                      />
                      <input
                        ref={originSearchRef}
                        type="text"
                        autoComplete="off"
                        value={originQuery}
                        onChange={(e) => setOriginQuery(e.target.value)}
                        placeholder={t("origin_label")}
                        className="kx-form-control h-11 w-full pl-9 pr-3 text-sm"
                      />
                    </label>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-2" role="listbox">
                    {groupedLocations(originQuery).map((group) => (
                      <div key={group.type} className="mb-2 last:mb-0">
                        <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-muted">
                          {group.label}
                        </p>
                        {group.items.map((item) => (
                          <button
                            key={`${item.type}-${item.id}`}
                            type="button"
                            onClick={() => selectLocation("origin", item)}
                            className={`mb-1 flex w-full items-start gap-2 rounded-sm px-3 py-2 text-left transition last:mb-0 ${isSelected("origin", item) ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-panel"}`}
                          >
                            <MapPin
                              className={`mt-0.5 h-3 w-3 shrink-0 ${isSelected("origin", item) ? "text-brand-600" : "text-line-strong"}`}
                              aria-hidden="true"
                            />
                            <span className="block truncate text-sm font-semibold">
                              {item.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                    {groupedLocations(originQuery).length === 0 && (
                      <p className="px-3 py-5 text-center text-sm text-muted">
                        {t("no_results")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={swapLocations}
            className="hidden h-11 w-11 items-center justify-center rounded-sm border border-brand-100 bg-white text-brand-600 transition hover:border-brand-500 hover:text-brand-700 lg:inline-flex"
            aria-label={t("swap_aria")}
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          </button>{" "}
          <div
            className={`relative ${activeDropdown === "destination" ? "kx-search-bar__field--open" : ""}`}
          >
            <button
              type="button"
              onClick={() => toggleDropdown("destination")}
              aria-haspopup="listbox"
              aria-expanded={activeDropdown === "destination"}
              className={`kx-form-control group flex h-14 w-full items-center gap-3 px-4 text-left ${activeDropdown === "destination" ? "border-brand-600 bg-white shadow-[0_0_0_3px_rgba(255,155,0,0.24)]" : ""}`}
            >
              {" "}
              <img
                src="/assets/client/icons/dropoff.svg"
                alt={t("destination_icon_alt")}
                className="h-5 w-5 shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {t("destination_label")}
                </span>
                <span className="block truncate text-sm font-bold text-ink">
                  {destination?.name || t("destination_placeholder")}
                </span>
              </span>
              <ChevronDownIcon open={activeDropdown === "destination"} />
            </button>
            {activeDropdown === "destination" && (
              <div className="kx-search-bar__menu">
                <div className="overflow-hidden rounded-sm border border-line-strong bg-white shadow-card">
                  <div className="border-b border-line-strong p-3">
                    <label className="relative block">
                      <Search
                        className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted"
                        aria-hidden="true"
                      />
                      <input
                        ref={destinationSearchRef}
                        type="text"
                        autoComplete="off"
                        value={destinationQuery}
                        onChange={(e) => setDestinationQuery(e.target.value)}
                        placeholder={t("destination_label")}
                        className="kx-form-control h-11 w-full pl-9 pr-3 text-sm"
                      />
                    </label>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-2" role="listbox">
                    {groupedLocations(destinationQuery).map((group) => (
                      <div key={group.type} className="mb-2 last:mb-0">
                        <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-muted">
                          {group.label}
                        </p>
                        {group.items.map((item) => (
                          <button
                            key={`${item.type}-${item.id}`}
                            type="button"
                            onClick={() => selectLocation("destination", item)}
                            className={`mb-1 flex w-full items-start gap-2 rounded-sm px-3 py-2 text-left transition last:mb-0 ${isSelected("destination", item) ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-panel"}`}
                          >
                            <MapPin
                              className={`mt-0.5 h-3 w-3 shrink-0 ${isSelected("destination", item) ? "text-brand-600" : "text-line-strong"}`}
                              aria-hidden="true"
                            />
                            <span className="block truncate text-sm font-semibold">
                              {item.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                    {groupedLocations(destinationQuery).length === 0 && (
                      <p className="px-3 py-5 text-center text-sm text-muted">
                        {t("no_results")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>{" "}
          <button
            type="button"
            onClick={openDeparturePicker}
            className="kx-form-control group relative flex h-14 w-full items-center gap-3 px-4 text-left"
          >
            {" "}
            <img
              src="/assets/client/icons/date.svg"
              alt={t("departure_icon_alt")}
              className="h-5 w-5 shrink-0"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
                {t("departure_label")}
              </span>
              <span
                className={`block truncate text-sm font-bold ${departureDate ? "text-ink" : "text-muted"}`}
              >
                {formatDisplayDate(departureDate) || t("date_placeholder")}
              </span>
            </span>
            <input
              ref={departureInputRef}
              type="date"
              value={departureDate}
              min={todayIso()}
              onChange={(e) => onDepartureChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-none absolute h-0 w-0 opacity-0"
              aria-hidden="true"
              tabIndex={-1}
            />
          </button>{" "}
          <div className="relative">
            {showReturn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={openReturnPicker}
                  className="kx-form-control group flex h-14 w-full items-center gap-3 px-4 pr-10 text-left"
                >
                  {" "}
                  <img
                    src="/assets/client/icons/date.svg"
                    alt={t("return_icon_alt")}
                    className="h-5 w-5 shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {t("return_label")}
                    </span>
                    <span
                      className={`block truncate text-sm font-bold ${returnDate ? "text-ink" : "text-muted"}`}
                    >
                      {formatDisplayDate(returnDate) || t("date_placeholder")}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={removeReturnDate}
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm text-muted transition hover:bg-rose-50 hover:text-rose-500"
                  aria-label={t("remove_return_aria")}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
                <input
                  ref={returnInputRef}
                  type="date"
                  value={returnDate}
                  min={departureDate || todayIso()}
                  onChange={(e) => {
                    setReturnDate(e.target.value);
                    setError(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-none absolute h-0 w-0 opacity-0"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={enableReturnDate}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-sm border border-dashed border-brand-500/35 bg-brand-50 text-sm font-semibold text-brand-700 transition hover:border-brand-600 hover:bg-brand-100"
              >
                <span className="text-base leading-none">+</span>
                <span>{t("add_return")}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={swapLocations}
              className="inline-flex h-12 w-12 items-center justify-center rounded-sm border border-line-strong text-muted transition hover:border-brand-500 hover:text-brand-600 lg:hidden"
              aria-label={t("swap_aria")}
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="submit"
              disabled={loading}
              className="kx-btn-primary h-14 min-w-36 px-6 text-sm disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? t("loading") : submitLabel || t("submit")}
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-3 rounded-sm border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
function ChevronDownIcon({ open }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-3 w-3 shrink-0 text-muted transition-transform ${open ? "rotate-180 text-brand-600" : ""}`}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
