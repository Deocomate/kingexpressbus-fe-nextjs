import { MessageCircle, PhoneCall } from "lucide-react";
import { SearchBar } from "@/components/client/search-bar";
function telHref(raw) {
  return `tel:${raw.replace(/[^\d+]/g, "")}`;
}
export function ContactHeroSection({
  t,
  locale,
  provinces,
  webProfile,
  zaloUrl,
  stats,
}) {
  return (
    <section className="contact-hero-bg ksb-section-hero relative z-elevated overflow-visible px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-sm border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
            <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
            {t("hero.badge")}
          </span>
          <h1 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-100/95 sm:text-base lg:text-lg">
            {t("hero.subtitle")}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {webProfile.hotline && (
            <a
              href={telHref(webProfile.hotline)}
              className="inline-flex items-center gap-2 rounded-sm bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700"
            >
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              {webProfile.hotline}
            </a>
          )}
          {zaloUrl && (
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t("hero.zalo_cta")}
            </a>
          )}
        </div>
        <div className="ksb-hero-search mt-8">
          <SearchBar locale={locale} provinces={provinces} />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <article className="rounded-sm border border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-white/80">
              {t("hero.stats.routes")}
            </p>
            <p className="mt-2 text-2xl font-extrabold">
              {stats.routeCount.toLocaleString("vi-VN")}+
            </p>
          </article>
          <article className="rounded-sm border border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-white/80">
              {t("hero.stats.fleet")}
            </p>
            <p className="mt-2 text-2xl font-extrabold">
              {stats.busCount.toLocaleString("vi-VN")}+
            </p>
          </article>
          <article className="rounded-sm border border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-white/80">
              {t("hero.stats.trips")}
            </p>
            <p className="mt-2 text-2xl font-extrabold">
              {stats.tripCount.toLocaleString("vi-VN")}+
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
