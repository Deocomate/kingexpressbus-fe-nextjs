import { Phone, Ticket } from "lucide-react";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";

/** Closing dark CTA band on the contact page. */
export function ContactCtaSection({ t, locale, hotline }) {
  return (
    <section className="ksb-section-cta px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-sm border border-slate-800 bg-slate-900">
          <div className="pointer-events-none absolute inset-0 bg-contrast-900/90" />
          <div className="relative grid items-center gap-6 p-6 text-white md:p-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="inline-flex rounded-sm bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-200">
                {t("cta.badge")}
              </p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight md:text-4xl">
                {t("cta.title")}
              </h3>
              <p className="mt-4 max-w-2xl text-sm text-slate-200 md:text-base">
                {t("cta.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a
                href={localePath(locale, CLIENT_ROUTES.home)}
                className="inline-flex items-center gap-2 rounded-sm bg-primary-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-700"
              >
                <Ticket className="h-4 w-4" aria-hidden="true" />
                {t("cta.book_button")}
              </a>
              {hotline && (
                <a
                  href={`tel:${hotline.replace(/[^\d+]/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-sm border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {t("cta.call_button")}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
