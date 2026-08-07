/**
 * Shared loading / empty / error panels for client flows.
 * Reuses existing kx- and ksb- visual classes — no new design-system folder.
 */
export function FeedbackLoading({ label }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="kx-panel flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600"
        aria-hidden="true"
      />
      <p className="text-sm font-semibold text-muted">{label}</p>
    </div>
  );
}

export function FeedbackEmpty({ title, description, action }) {
  return (
    <div className="kx-panel border-dashed px-6 py-12 text-center">
      <h2 className="font-display text-xl font-extrabold text-ink">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function FeedbackError({ title, description, action }) {
  return (
    <div
      role="alert"
      className="kx-panel border-rose-200 bg-rose-50 px-6 py-10 text-center"
    >
      <h2 className="font-display text-xl font-extrabold text-dropoff">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
