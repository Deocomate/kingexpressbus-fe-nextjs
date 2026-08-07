"use client";
import { useEffect, useRef } from "react";

/**
 * Port of resources/js/modules/reveal.js: adds `.is-visible` to `.ksb-reveal`
 * elements once they intersect the viewport. The DOM hook name is kept
 * because it is documented in design-guidelines.md as the reveal contract,
 * not because any Blade script still queries it.
 */
export function Reveal({ children, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`ksb-reveal ${className ?? ""}`.trim()}>
      {children}
    </div>
  );
}
