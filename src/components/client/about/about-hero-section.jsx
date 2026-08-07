import { ShieldCheck, Info, Ticket } from "lucide-react";
import { SearchBar } from "@/components/client/search-bar";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";

/**
 * About-page hero and proof-strip aside.
 * Kept as a server component (no Reveal animation) — the hero is above
 * the fold and visible on first paint.
 */
export function AboutHeroSection({ locale, provinces, t }) {
  return (
    <section className="about-hero relative z-elevated px-4 py-14 md:py-20 lg:py-24">
      <div className="container relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.78fr)] lg:gap-14">
          <div className="max-w-3xl text-white">
            <p className="inline-flex items-center gap-2 border-l-2 border-accent pl-3 text-xs font-extrabold uppercase tracking-[0.04em] text-accent">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {t("about.hero.tagline")}
            </p>
            <h1 className="ksb-text-balance mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-7xl">
              {t("about.hero.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-accent md:text-2xl">
              {t("about.hero.subtitle")}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-100/88 md:text-lg">
              {t("about.typing.1")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={localePath(locale, CLIENT_ROUTES.routesIndex)}
                className="ksb-btn-primary px-6 text-sm"
              >
                <Ticket className="h-4 w-4" aria-hidden="true" />
                {t("about_page.hero.primary_button")}
              </a>
              <a href="#about-content" className="ksb-btn-ghost px-6 text-sm">
                <Info className="h-4 w-4" aria-hidden="true" />
                {t("about_page.hero.secondary_button")}
              </a>
            </div>
          </div>
          <aside
            className="space-y-3 text-white"
            aria-label={t("about_page.hero.review_label")}
          >
            <div className="grid grid-cols-[1.12fr_0.88fr] gap-3">
              <div className="about-hero-shot min-h-72">
                {" "}
                <img
                  src="/assets/client/images/kingexpressbus/cabin/1.jpg"
                  alt={t("about_page.fleet_cards.cabin.name")}
                  className="h-full w-full object-cover"
                />
                <span>{t("about_page.fleet_cards.cabin.name")}</span>
              </div>
              <div className="grid gap-3">
                <div className="about-hero-shot min-h-[8.25rem]">
                  {" "}
                  <img
                    src="/assets/client/images/kingexpressbus/limousine/1.png"
                    alt={t("about_page.fleet_cards.limousine.name")}
                    className="h-full w-full object-cover"
                  />
                  <span>{t("about_page.fleet_cards.limousine.name")}</span>
                </div>
                <div className="about-hero-shot min-h-[8.25rem]">
                  {" "}
                  <img
                    src="/assets/client/images/kingexpressbus/sleeper/1.jpg"
                    alt={t("about_page.fleet_cards.sleeper.name")}
                    className="h-full w-full object-cover"
                  />
                  <span>{t("about_page.fleet_cards.sleeper.name")}</span>
                </div>
              </div>
            </div>
            <div className="about-proof-strip p-5 md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.04em] text-white/62">
                {t("about_page.hero.review_label")}
              </p>
              <blockquote className="mt-3 text-lg font-extrabold leading-7 text-white md:text-xl">
                {t("about_page.hero.review_quote")}
              </blockquote>
              <p className="mt-4 text-sm text-slate-200">
                {t("about_page.hero.review_author")}
              </p>
            </div>
            <div className="about-proof-strip grid grid-cols-2 gap-5 p-5 md:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.04em] text-white/58">
                  {t("about_page.hero.rating_label")}
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold text-accent">
                  4.9/5
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.04em] text-white/58">
                  {t("about_page.hero.return_rate_label")}
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold text-accent">
                  92%
                </p>
              </div>
            </div>
          </aside>
        </div>
        <div className="ksb-hero-search mt-10">
          <SearchBar locale={locale} provinces={provinces} />
        </div>
      </div>
    </section>
  );
}
