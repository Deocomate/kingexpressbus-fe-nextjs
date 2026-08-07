"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Port of the Alpine `statsCounter(target, step, speed, formatNumber)`
 * component in about/index.blade.php: counts up from 0 to `target` once the
 * article scrolls into view, then stops. `format` mirrors Blade's
 * `toLocaleString()` call for the bookings stat (10,000+).
 */
export function AboutStatCounter({ target, step, speed, format, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const startedRef = useRef(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      setCount(target);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      const timer = setInterval(() => {
        setCount((current) => {
          if (current >= target) {
            clearInterval(timer);
            return target;
          }
          return Math.min(current + step, target);
        });
      }, speed);
      return () => clearInterval(timer);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const timer = setInterval(() => {
              setCount((current) => {
                if (current >= target) {
                  clearInterval(timer);
                  return target;
                }
                return Math.min(current + step, target);
              });
            }, speed);
            observer.disconnect();
          }
        }
      },
      {
        threshold: 0.4,
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target, step, speed]);
  const displayCount = format ? count.toLocaleString() : count;
  return (
    <div
      ref={ref}
      className="px-2 text-center sm:px-6 lg:border-l lg:border-slate-200/80 first:lg:border-l-0"
    >
      <p className="font-display text-4xl font-extrabold tabular-nums text-slate-950 md:text-5xl">
        <span>{displayCount}</span>
        <span className="text-primary-600">+</span>
      </p>
      <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.04em] text-slate-500">
        {label}
      </p>
    </div>
  );
}
