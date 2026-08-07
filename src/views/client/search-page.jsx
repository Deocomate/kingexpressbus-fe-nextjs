import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listRoutes } from "@/services/booking-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";

/**
 * Port of SearchController::search() (routes.search / `/tim-kiem`). Blade
 * has no dedicated results template here — it's a GET-only redirect: given
 * origin/destination province ids + a departure date, it resolves the
 * matching route and 302s to `client.routes.show`. `search-bar.jsx`
 * (Phase 2) already performs this resolution client-side and pushes
 * straight to the route page, so this route mainly exists for parity with
 * legacy/bookmarked links that hit `/tim-kiem?...` directly.
 *
 * Deviation: Blade's controller also accepts `origin_type`/`destination_type`
 * of district/stop (resolved via `RouteService::resolveProvinceId`) — the
 * public API only exposes province-level routes/search, so only
 * `origin_id`/`destination_id` (treated as province ids) are honored here,
 * consistent with search-bar.tsx's province-only dropdown.
 */
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
