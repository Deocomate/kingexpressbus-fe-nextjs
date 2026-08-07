import { Bolt, Earth, Gem, Heart, ShieldCheck } from "lucide-react";
const CORE_VALUE_ICONS = [ShieldCheck, Gem, Heart, Bolt];

/**
 * Port of the "Vision / Mission / Core values" band in about/index.blade.php
 * (`.about-editorial-band`): vision statement + 2 hero images, mission
 * split (customers/society), then core-values label + item rows.
 */
export function AboutVisionSection({ t }) {
  const coreValueItems = t.raw("about.core_values.items");
  return (
    <section className="about-editorial-band ksb-section px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="ksb-section-label">{t("about.vision.title")}</p>
            <h2 className="ksb-text-balance mt-3 font-display text-3xl font-extrabold leading-tight text-slate-950 md:text-5xl">
              {t("about.vision.badge")}
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="max-w-3xl text-lg font-semibold leading-9 text-slate-700 md:text-2xl">
              {t("about.vision.description")}
            </p>
          </div>
        </div>
        <div className="mt-10 grid gap-3 md:grid-cols-3">
          <div className="about-image-mask md:col-span-2">
            {" "}
            <img
              src="/assets/client/images/kingexpressbus/cabin/4.jpg"
              alt={t("about.hero.image_alt")}
              loading="lazy"
              className="aspect-[16/7] w-full object-cover"
            />
          </div>
          <div className="about-image-mask">
            {" "}
            <img
              src="/assets/client/images/kingexpressbus/sleeper/2.jpg"
              alt={t("about_page.fleet_cards.sleeper.name")}
              loading="lazy"
              className="aspect-[16/7] w-full object-cover md:aspect-auto md:h-full"
            />
          </div>
        </div>
        <div className="mt-12 grid gap-8 border-t border-slate-200 pt-10 lg:grid-cols-2">
          <article>
            <p className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-primary-50 text-primary-700">
              <Heart className="h-5 w-5" aria-hidden="true" />
            </p>
            <h3 className="mt-5 font-display text-2xl font-extrabold text-slate-950">
              {t("about.mission.with_customers.title")}
            </h3>
            <p className="mt-3 text-base leading-8 text-slate-600">
              {t("about.mission.with_customers.content")}
            </p>
          </article>
          <article>
            <p className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-primary-50 text-primary-700">
              <Earth className="h-5 w-5" aria-hidden="true" />
            </p>
            <h3 className="mt-5 font-display text-2xl font-extrabold text-slate-950">
              {t("about.mission.with_society.title")}
            </h3>
            <p className="mt-3 text-base leading-8 text-slate-600">
              {t("about.mission.with_society.content")}
            </p>
          </article>
        </div>
        <div className="mt-12 grid gap-8 border-t border-slate-200 pt-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="ksb-section-label">
              {t("about_page.core_values.label")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-slate-950">
              {t("about.core_values.title")}
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              {t("about.core_values.description")}
            </p>
          </div>
          <div>
            {coreValueItems.map((item, index) => {
              const Icon = CORE_VALUE_ICONS[index % CORE_VALUE_ICONS.length];
              return (
                <article key={item.title} className="about-value-row grid gap-4 py-5 md:grid-cols-[48px_1fr]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-white text-primary-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
