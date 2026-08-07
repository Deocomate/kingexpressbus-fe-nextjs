import { Gem, Headset, ShieldCheck, Star } from "lucide-react";
const WHY_CHOOSE_ICONS = [Star, ShieldCheck, Headset, Gem];

/**
 * Port of the "Position & Milestones" section in about/index.blade.php:
 * position copy + why-choose feature grid on the left, image collage +
 * year timeline on the right. `timelineItems` mirrors Blade's inline
 * `$timelineItems` array (2017 / 2021 / current year).
 */
export function AboutPositionSection({ t }) {
  const whyChooseItems = t.raw("about.why_choose.items");
  const currentYear = new Date().getFullYear();
  const timelineItems = [
    {
      year: "2017",
      title: t("about.position.badge"),
      description: t("about.position.paragraph1"),
    },
    {
      year: "2021",
      title: t("about_page.destinations.label"),
      description: t("about.position.paragraph2"),
    },
    {
      year: String(currentYear),
      title: t("about.vision.badge"),
      description: t("about.position.paragraph3"),
    },
  ];
  return (
    <section className="ksb-section px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <p className="ksb-section-label">
              {t("about_page.position.label")}
            </p>
            <h2 className="ksb-text-balance mt-3 font-display text-3xl font-extrabold leading-tight text-slate-950 md:text-5xl">
              {t("about.position.title")}
            </h2>
            <div className="mt-6 max-w-3xl space-y-5 text-base leading-8 text-slate-600 md:text-lg">
              <p>{t("about.position.paragraph1")}</p>
              <p>{t("about.position.paragraph2")}</p>
              <p className="font-semibold text-slate-800">
                {t("about.position.paragraph3")}
              </p>
            </div>
            <div className="mt-8 grid gap-4 border-t border-slate-200 pt-6 md:grid-cols-3">
              {whyChooseItems.map((item, index) => {
                const Icon = WHY_CHOOSE_ICONS[index % WHY_CHOOSE_ICONS.length];
                return (
                  <div key={item.title} className="group">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-primary-50 text-primary-700 transition group-hover:bg-primary-600 group-hover:text-white">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-extrabold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <aside className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="about-image-mask col-span-2">
                {" "}
                <img
                  src="/assets/client/images/kingexpressbus/cabin/3.jpg"
                  alt={t("about.hero.image_alt")}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
              <div className="about-image-mask">
                {" "}
                <img
                  src="/assets/client/images/kingexpressbus/cabin_double/1.jpg"
                  alt={t("about_page.fleet_cards.cabin.name")}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="about-image-mask">
                {" "}
                <img
                  src="/assets/client/images/kingexpressbus/limousine/2.png"
                  alt={t("about_page.fleet_cards.limousine.name")}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
            <div className="about-timeline mt-8 space-y-8 pl-6">
              {timelineItems.map((item) => (
                <article key={item.year} className="relative">
                  <span className="about-timeline-dot absolute -left-[31px] top-1 inline-flex h-3 w-3 rounded-sm bg-primary-600" />
                  <p className="font-display text-2xl font-extrabold text-slate-950">
                    {item.year}
                  </p>
                  <h3 className="mt-1 text-sm font-extrabold uppercase tracking-[0.04em] text-primary-700">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
