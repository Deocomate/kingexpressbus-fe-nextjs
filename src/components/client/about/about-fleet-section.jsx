import { Check } from "lucide-react";
const FLEET_CARDS = [
  {
    nameKey: "about_page.fleet_cards.cabin.name",
    metaKey: "about_page.fleet_cards.cabin.meta",
    image: "/assets/client/images/kingexpressbus/cabin/1.jpg",
  },
  {
    nameKey: "about_page.fleet_cards.limousine.name",
    metaKey: "about_page.fleet_cards.limousine.meta",
    image: "/assets/client/images/kingexpressbus/limousine/1.png",
  },
  {
    nameKey: "about_page.fleet_cards.sleeper.name",
    metaKey: "about_page.fleet_cards.sleeper.meta",
    image: "/assets/client/images/kingexpressbus/sleeper/1.jpg",
  },
];

/** Fleet showcase section (highlight image + feature list + 3 fleet cards). */
export function AboutFleetSection({ t }) {
  const features = t.raw("about.fleet.features");
  return (
    <section className="ksb-section px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="about-image-mask">
              {" "}
              <img
                src="/assets/client/images/kingexpressbus/limousine/1.png"
                alt={t("about.fleet.title")}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-5">
            <p className="ksb-section-label">{t("about_page.fleet.label")}</p>
            <h2 className="ksb-text-balance mt-3 font-display text-3xl font-extrabold leading-tight text-slate-950 md:text-5xl">
              {t("about.fleet.title")}
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              {t("about.fleet.description")}
            </p>
            <p className="mt-4 border-l-2 border-primary-600 pl-4 text-base font-semibold leading-8 text-slate-800">
              {t("about.fleet.highlight")}
            </p>
            <ul className="mt-7 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                  <Check
                    className="mt-1 h-4 w-4 shrink-0 text-primary-600"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {FLEET_CARDS.map((fleet) => (
            <article key={fleet.nameKey} className="group">
              <div className="about-image-mask">
                {" "}
                <img
                  src={fleet.image}
                  alt={t(fleet.nameKey)}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
              <div className="mt-4 border-l border-slate-200 pl-4">
                <h3 className="text-base font-extrabold text-slate-950">
                  {t(fleet.nameKey)}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {t(fleet.metaKey)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
