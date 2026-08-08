import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ApiError } from "@/services/api-base";
import { getTourBySlug } from "@/services/tour-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { formatMoney, normalizeImageList } from "@/utils/client-format";

export default async function TourDetailPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("client.tours");

  let tour;
  try {
    tour = await getTourBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const gallery = normalizeImageList(tour.image_list_url);
  const highlights = Array.isArray(tour.highlights) ? tour.highlights : [];
  const includes = Array.isArray(tour.includes) ? tour.includes : [];
  const excludes = Array.isArray(tour.excludes) ? tour.excludes : [];

  return (
    <main className="bg-page text-ink">
      <section className="relative min-h-[48vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            tour.thumbnail_url ||
            gallery[0] ||
            "/assets/client/images/city_imgs/sapa.jpg"
          }
          alt={tour.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/35 to-black/20" />
        <div className="relative container mx-auto flex min-h-[48vh] max-w-7xl flex-col justify-end px-4 pb-10 pt-24 text-white">
          <p className="kx-section-label text-brand-300">{t("detail.eyebrow")}</p>
          <h1 className="mt-2 max-w-4xl font-display text-4xl font-extrabold md:text-6xl">
            {tour.name}
          </h1>
          <p className="mt-3 max-w-2xl text-white/85">
            {tour.short_description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <span className="kx-price text-2xl font-extrabold">
              {formatMoney(tour.base_price, locale)}
            </span>
            <span className="text-sm text-white/80">
              {tour.duration_label || t("index.duration_tba")}
            </span>
            <Link
              href={`${localePath(locale, CLIENT_ROUTES.tourBooking)}?tour=${tour.slug}`}
              className="kx-btn-primary px-5 text-sm"
            >
              {t("detail.book")}
            </Link>
          </div>
        </div>
      </section>

      <section className="ksb-container ksb-section space-y-8">
        {tour.description ? (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: tour.description }}
          />
        ) : null}
        {tour.itinerary ? (
          <div>
            <h2 className="font-display text-2xl font-extrabold">
              {t("detail.itinerary")}
            </h2>
            <div
              className="prose mt-3 max-w-none"
              dangerouslySetInnerHTML={{ __html: tour.itinerary }}
            />
          </div>
        ) : null}
        {highlights.length ? (
          <div>
            <h2 className="font-display text-2xl font-extrabold">
              {t("detail.highlights")}
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
              {highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="grid gap-6 md:grid-cols-2">
          {includes.length ? (
            <div className="border border-line bg-white p-5">
              <h3 className="font-display text-lg font-extrabold">
                {t("detail.includes")}
              </h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                {includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {excludes.length ? (
            <div className="border border-line bg-white p-5">
              <h3 className="font-display text-lg font-extrabold">
                {t("detail.excludes")}
              </h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                {excludes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
