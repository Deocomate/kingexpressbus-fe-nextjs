"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Port of contact/index.blade.php's Alpine `x-data="{ openFaq: 0 }"` FAQ
 * accordion: first item open by default, only one open at a time, chevron
 * rotates 180deg when expanded.
 */
export function ContactFaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="mt-5 space-y-3">
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={faq.question ?? index} className="rounded-sm border border-amber-100 bg-white">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              id={`contact-faq-trigger-${index}`}
              aria-expanded={isOpen}
              aria-controls={`contact-faq-panel-${index}`}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <span className="text-sm font-bold text-slate-800 md:text-base">
                {faq.question}
              </span>
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary-50 text-primary-700 transition ${isOpen ? "rotate-180" : ""}`}
              >
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>
            {isOpen && (
              <div
                id={`contact-faq-panel-${index}`}
                role="region"
                aria-labelledby={`contact-faq-trigger-${index}`}
                className="border-t border-amber-100 px-4 pb-4 pt-3 text-sm leading-relaxed text-slate-600 md:text-base"
              >
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
