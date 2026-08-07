import { Bolt, Headset } from "lucide-react";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";

/** Port of the closing dark CTA band in about/index.blade.php. */
export function AboutCtaSection({ t, locale }) {
  return (
    <section className="about-cta-band px-4 py-14 md:py-16">
      <div className="container mx-auto max-w-7xl">
        <div className="grid items-center gap-8 text-white lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="inline-flex border-l-2 border-accent pl-3 text-xs font-extrabold uppercase tracking-[0.04em] text-accent">
              {t("about_page.cta.label")}
            </p>
            <h2 className="ksb-text-balance mt-4 font-display text-3xl font-extrabold leading-tight md:text-5xl">
              {t("about_page.cta.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
              {t("about_page.cta.description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a
              href={localePath(locale, CLIENT_ROUTES.routesIndex)}
              className="ksb-btn-primary px-6 text-sm"
            >
              <Bolt className="h-4 w-4" aria-hidden="true" />
              {t("about_page.cta.primary_button")}
            </a>
            <a
              href={localePath(locale, CLIENT_ROUTES.contact)}
              className="ksb-btn-ghost px-6 text-sm"
            >
              <Headset className="h-4 w-4" aria-hidden="true" />
              {t("about_page.cta.secondary_button")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
