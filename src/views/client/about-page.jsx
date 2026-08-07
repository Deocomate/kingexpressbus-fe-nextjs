import { getTranslations, setRequestLocale } from "next-intl/server";
import { listProvinces, listRoutes } from "@/services/booking-api";
import { AboutPageStyles } from "@/components/client/about/about-page-styles";
import { AboutHeroSection } from "@/components/client/about/about-hero-section";
import { AboutStatBarSection } from "@/components/client/about/about-stat-bar-section";
import { AboutPositionSection } from "@/components/client/about/about-position-section";
import { AboutVisionSection } from "@/components/client/about/about-vision-section";
import { AboutFleetSection } from "@/components/client/about/about-fleet-section";
import { AboutPopularRoutesSection } from "@/components/client/about/about-popular-routes-section";
import { AboutDestinationsSection } from "@/components/client/about/about-destinations-section";
import { AboutCtaSection } from "@/components/client/about/about-cta-section";

// Blade's `$stats['bus_count'] ?? 10` fallback — see about-stat-bar-section.tsx doc comment.
const FALLBACK_BUS_COUNT = 10;
const FOUNDING_YEAR = 2017;
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "client.about",
  });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}
export default async function AboutPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, provinces, routes] = await Promise.all([
    getTranslations("client"),
    listProvinces(),
    listRoutes(),
  ]);
  return (
    <main>
      <AboutPageStyles />
      <AboutHeroSection locale={locale} provinces={provinces} t={t} />
      <AboutStatBarSection
        t={t}
        stats={{
          routeCount: routes.length,
          busCount: FALLBACK_BUS_COUNT,
          yearsExperience: new Date().getFullYear() - FOUNDING_YEAR,
        }}
      />
      <AboutPositionSection t={t} />
      <AboutVisionSection t={t} />
      <AboutFleetSection t={t} />
      <AboutPopularRoutesSection t={t} routes={routes} locale={locale} />
      <AboutDestinationsSection t={t} locale={locale} />
      <AboutCtaSection t={t} locale={locale} />
    </main>
  );
}
