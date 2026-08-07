import { Clock, ShieldCheck, Sparkles } from "lucide-react";
import { SearchBar } from "@/components/client/search-bar";

/** Port of the hero/search section in page/show.blade.php. */
export function CmsPageHero({ t, locale, provinces, title, updatedAtDisplay }) {
  return (
    <section className="page-hero-bg ksb-section-hero relative z-elevated overflow-visible px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-sm border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {t("hero.badge")}
          </span>
          <h1 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-slate-100/95 sm:text-base lg:text-lg">
            {t("hero.description")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {updatedAtDisplay && (
              <span className="inline-flex items-center gap-2 rounded-sm bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {t("hero.updated_at", {
                  datetime: updatedAtDisplay,
                })}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-sm bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {t("hero.trust_note")}
            </span>
          </div>
        </div>
        <div className="ksb-hero-search mt-8">
          <SearchBar locale={locale} provinces={provinces} />
        </div>
      </div>
    </section>
  );
}
