import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getWebProfile, resolveCmsPageContent } from "@/services/client-api";
import { listProvinces } from "@/services/booking-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { CmsPageStyles } from "@/components/client/cms-page/cms-page-styles";
import { CmsPageHero } from "@/components/client/cms-page/cms-page-hero";
import { CmsPageSidebar } from "@/components/client/cms-page/cms-page-sidebar";

/**
 * Resolves title/description for the two supported fallback slugs
 * (see `resolveCmsPageContent` in client-api.ts for why only these two).
 * Mirrors PageController::resolveFallbackPage()'s per-slug title/description.
 */
async function resolvePageMeta(locale, slug) {
  if (slug === "gioi-thieu") {
    const t = await getTranslations({
      locale,
      namespace: "client.about",
    });
    return {
      title: t("meta.title"),
      description: t("meta.description"),
    };
  }
  if (slug === "chinh-sach") {
    const t = await getTranslations({
      locale,
      namespace: "client.page",
    });
    return {
      title: t("policy.title"),
      description: t("policy.description"),
    };
  }
  return null;
}
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const meta = await resolvePageMeta(locale, slug);
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
  };
}
export default async function CmsPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const meta = await resolvePageMeta(locale, slug);
  if (!meta) notFound();
  const [t, webProfile, provinces] = await Promise.all([
    getTranslations({
      locale,
      namespace: "client.page_view",
    }),
    getWebProfile(),
    listProvinces(),
  ]);
  const content = resolveCmsPageContent(webProfile, slug);
  if (!content) notFound();
  const updatedAtDisplay = null; // WebProfile doesn't expose an `updated_at` timestamp publicly; Blade only shows this badge when one is present.

  return (
    <main>
      <CmsPageStyles />
      <CmsPageHero
        t={t}
        locale={locale}
        provinces={provinces}
        title={meta.title}
        updatedAtDisplay={updatedAtDisplay}
      />
      <section className="ksb-section px-4">
        <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <article className="space-y-5 rounded-sm border border-amber-100 bg-white p-5 md:p-7 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary-600">
                  {t("content.label")}
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-800 md:text-2xl">
                  {meta.title}
                </h2>
              </div>
              <a
                href={localePath(locale, CLIENT_ROUTES.routesIndex)}
                className="inline-flex items-center gap-2 rounded-sm border border-primary-600/25 bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700 transition-all duration-300 hover:bg-primary-600 hover:text-white"
              >
                {t("content.cta_book_now")}
              </a>
            </div>

            <div
              className="page-content-prose kx-prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            />
          </article>
          <CmsPageSidebar t={t} locale={locale} />
        </div>
      </section>
    </main>
  );
}
