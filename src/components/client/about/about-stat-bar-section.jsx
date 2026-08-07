import { AboutStatCounter } from "@/components/client/about/about-stat-counter";

/**
 * About-page stat bar. Uses a designed fallback of 10 for missing counts.
 */
export function AboutStatBarSection({ t, stats }) {
  const items = [
    {
      value: stats.routeCount,
      step: 2,
      speed: 34,
      format: false,
      label: t("about.stats.routes"),
    },
    {
      value: stats.busCount,
      step: 1,
      speed: 48,
      format: false,
      label: t("about.stats.buses"),
    },
    {
      value: 10000,
      step: 200,
      speed: 30,
      format: true,
      label: t("about.stats.bookings"),
    },
    {
      value: stats.yearsExperience,
      step: 1,
      speed: 90,
      format: false,
      label: t("about.stats.years"),
    },
  ];
  return (
    <section id="about-content" className="about-stat-bar px-4 py-7">
      <div className="container mx-auto max-w-7xl">
        <div className="grid gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <AboutStatCounter
              key={item.label}
              target={item.value}
              step={item.step}
              speed={item.speed}
              format={item.format}
              label={item.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
