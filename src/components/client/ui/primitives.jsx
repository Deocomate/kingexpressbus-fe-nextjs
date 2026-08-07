// Thin typed wrappers around the kx- and ksb- class vocabulary from
// docs/design-guidelines.md. They exist so page code (phase 6+) writes
// Panel instead of re-typing the class string, not to hide the classes —
// className still composes normally.

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
export function Button({ variant = "primary", className, ...props }) {
  const variantClass =
    variant === "primary"
      ? "kx-btn-primary"
      : variant === "secondary"
        ? "kx-btn-secondary"
        : "kx-btn-ghost";
  return (
    <button
      {...props}
      className={cx(variantClass, "px-4 py-2 text-sm", className)}
    />
  );
}
export function Panel({ strong, className, ...props }) {
  return (
    <div
      {...props}
      className={cx(strong ? "kx-panel-strong" : "kx-panel", className)}
    />
  );
}
export function Card({ className, ...props }) {
  return <div {...props} className={cx("kx-card", className)} />;
}
export function Chip({ active, className, ...props }) {
  return (
    <span
      {...props}
      className={cx(
        active ? "kx-chip-active" : "kx-chip",
        "px-2.5 py-1 text-xs",
        className,
      )}
    />
  );
}
export function Badge({ className, ...props }) {
  return <span {...props} className={cx("kx-badge", className)} />;
}
export function Price({ className, ...props }) {
  return <span {...props} className={cx("kx-price font-bold", className)} />;
}
export function Prose({ className, ...props }) {
  return <div {...props} className={cx("kx-prose", className)} />;
}
export function Section({
  variant = "default",
  as: Tag = "section",
  className,
  ...props
}) {
  const variantClass =
    variant === "compact"
      ? "ksb-section-compact"
      : variant === "hero"
        ? "ksb-section-hero"
        : variant === "cta"
          ? "ksb-section-cta"
          : "ksb-section";
  return <Tag {...props} className={cx(variantClass, className)} />;
}
