import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileBookings } from "@/components/client/profile-bookings";
import { buildPageMetadata } from "@/lib/seo";
import { CLIENT_ROUTES } from "@/services/client-routes";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "client.profile_page",
  });
  return buildPageMetadata({
    title: t("meta.title"),
    description: t("meta.description"),
    locale,
    path: CLIENT_ROUTES.account,
    noIndex: true,
  });
}

export default async function AccountPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Client component: fetches /auth/me + /bookings/mine with the browser's
  // own cookie jar, redirecting to /login client-side on 401. See phase spec
  // option (a) — simplest correct approach without manual cookie forwarding.
  return <ProfileBookings locale={locale} />;
}
