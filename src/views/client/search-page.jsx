import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listRoutes } from "@/services/booking-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { buildPageMetadata } from "@/lib/seo";

/**
 * `/tim-kiem` search redirect: given origin/destination province ids and a
 * departure date, resolve the matching route and redirect to the route page.
 * Exists mainly for bookmarked `/tim-kiem?...` links; search-bar already
 * resolves client-side. Only province-level ids are honored.
 */
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "client.routes.index",
  });
  return buildPageMetadata({
    title: t("meta_title"),
    description: t("meta_description"),
    locale,
    path: CLIENT_ROUTES.search,
    noIndex: true,
  });
}

export default async function SearchRedirectPage({ params, searchParams }) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const originId = sp.origin_id ? Number(sp.origin_id) : null;
  const destinationId = sp.destination_id ? Number(sp.destination_id) : null;
  const date =
    sp.date ?? sp.departure_date ?? new Date().toISOString().slice(0, 10);
  if (originId && destinationId) {
    const routes = await listRoutes({
      originProvinceId: originId,
      destinationProvinceId: destinationId,
    });
    const route = routes[0];
    if (route) {
      redirect(
        `${localePath(locale, CLIENT_ROUTES.routesIndex)}/${route.slug}?date=${date}`,
      );
    }
  }
  const [t, tRoutes] = await Promise.all([
    getTranslations("client.route_show.search"),
    getTranslations("client.routes.index"),
  ]);
  return (
    <main className="ksb-section ksb-section-band">
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="mb-3 font-display text-2xl font-extrabold text-ink">
          {t("no_route_found")}
        </h1>
        <a
          href={localePath(locale, CLIENT_ROUTES.routesIndex)}
          className="ksb-btn-primary mt-4 inline-flex px-6 text-sm"
        >
          {tRoutes("view_all_routes")}
        </a>
      </div>
    </main>
  );
}
