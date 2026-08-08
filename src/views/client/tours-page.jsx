import Link from "next/link";
import { Clock3 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listTours } from "@/services/tour-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { formatMoney } from "@/utils/client-format";

export default async function ToursIndexPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("client.tours");
  const tours = await listTours().catch(() => []);

  return (
    <main className="bg-page text-ink">
      <section className="booking-hero ksb-section-hero px-4 text-white">
        <div className="container mx-auto max-w-7xl py-6 md:py-10">
          <p className="kx-section-label text-brand-300">{t("index.eyebrow")}</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold md:text-5xl">
            {t("index.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-white/85">{t("index.subtitle")}</p>
        </div>
      </section>

      <section className="ksb-container ksb-section">
        {tours.length === 0 ? (
          <p className="text-muted">{t("index.empty")}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                href={`${localePath(locale, CLIENT_ROUTES.tours)}/${tour.slug}`}
                className="group overflow-hidden border border-line bg-white transition hover:border-brand-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    tour.thumbnail_url ||
                    "/assets/client/images/city_imgs/sapa.jpg"
                  }
                  alt={tour.name}
                  className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="space-y-2 p-5">
                  <h2 className="font-display text-xl font-extrabold group-hover:text-brand-700">
                    {tour.name}
                  </h2>
                  {tour.short_description ? (
                    <p className="line-clamp-3 text-sm text-muted">
                      {tour.short_description}
                    </p>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                      <Clock3 className="h-3.5 w-3.5 text-brand-600" />
                      {tour.duration_label || t("index.duration_tba")}
                    </span>
                    <span className="kx-price font-extrabold">
                      {formatMoney(tour.base_price, locale)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
