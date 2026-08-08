import { getTranslations, setRequestLocale } from "next-intl/server";
import { getWebProfile } from "@/services/client-api";
import { listOffices, listProvinces, listRoutes } from "@/services/booking-api";
import { ContactPageStyles } from "@/components/client/contact/contact-page-styles";
import { ContactHeroSection } from "@/components/client/contact/contact-hero-section";
import { ContactSupportSection } from "@/components/client/contact/contact-support-section";
import { ContactFaqMapSection } from "@/components/client/contact/contact-faq-map-section";
import { ContactCtaSection } from "@/components/client/contact/contact-cta-section";
import { buildPageMetadata } from "@/lib/seo";
import { CLIENT_ROUTES } from "@/services/client-routes";

// `bus_count`/`trip_count` stats have no public-API source (only
// route_count is derivable from `/public/routes`) — see contact-hero-section
// usage below for the deviation this constant documents.
const FALLBACK_BUS_COUNT = 10;
const FALLBACK_TRIP_COUNT = 500;
function safeExternalUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}
function extractMapEmbedSrc(rawMapEmbed) {
  if (!rawMapEmbed) return null;
  const match = rawMapEmbed.match(/src=["']([^"']+)["']/i);
  if (!match) return null;
  const candidate = match[1];
  return /^https?:\/\//i.test(candidate) ? candidate : null;
}
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "client.contact",
  });
  return buildPageMetadata({
    title: t("meta.title"),
    description: t("meta.description"),
    locale,
    path: CLIENT_ROUTES.contact,
  });
}
export default async function ContactPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, webProfile, provinces, routes, officeGroups] = await Promise.all([
    getTranslations("client.contact"),
    getWebProfile(),
    listProvinces(),
    listRoutes(),
    listOffices(),
  ]);
  const zaloUrl = safeExternalUrl(webProfile.zalo_url);
  const facebookUrl = safeExternalUrl(webProfile.facebook_url);
  const mapEmbedSrc = extractMapEmbedSrc(webProfile.map_embedded);
  return (
    <main>
      <ContactPageStyles />
      <ContactHeroSection
        t={t}
        locale={locale}
        provinces={provinces}
        webProfile={webProfile}
        zaloUrl={zaloUrl}
        stats={{
          routeCount: routes.length,
          busCount: FALLBACK_BUS_COUNT,
          tripCount: FALLBACK_TRIP_COUNT,
        }}
      />
      <ContactSupportSection
        t={t}
        webProfile={webProfile}
        facebookUrl={facebookUrl}
        zaloUrl={zaloUrl}
        officeGroups={Array.isArray(officeGroups) ? officeGroups : []}
      />
      <ContactFaqMapSection t={t} mapEmbedSrc={mapEmbedSrc} />
      <ContactCtaSection t={t} locale={locale} hotline={webProfile.hotline} />
    </main>
  );
}
