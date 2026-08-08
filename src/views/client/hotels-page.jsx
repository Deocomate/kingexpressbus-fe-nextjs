import Link from "next/link";
import { MapPinned } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listHotels } from "@/services/hotel-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { normalizeImageList } from "@/utils/client-format";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "client.hotels" });
  return buildPageMetadata({
    title: t("index.meta_title"),
    description: t("index.meta_description"),
    locale,
    path: CLIENT_ROUTES.hotels,
  });
}

export default async function HotelsIndexPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("client.hotels");
  const hotels = await listHotels().catch(() => []);

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
        {hotels.length === 0 ? (
          <p className="text-muted">{t("index.empty")}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => {
              const thumb =
                hotel.thumbnail_url ||
                normalizeImageList(hotel.image_list_url)[0] ||
                "/assets/client/images/city_imgs/sapa.jpg";
              return (
                <Link
                  key={hotel.id}
                  href={`${localePath(locale, CLIENT_ROUTES.hotels)}/${hotel.slug}`}
                  className="group overflow-hidden border border-line bg-white transition hover:border-brand-400"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt={hotel.name}
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="space-y-2 p-4">
                    <h2 className="font-display text-xl font-extrabold text-ink group-hover:text-brand-700">
                      {hotel.name}
                    </h2>
                    {hotel.address ? (
                      <p className="inline-flex items-start gap-2 text-sm text-muted">
                        <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                        <span>{hotel.address}</span>
                      </p>
                    ) : null}
                    <p className="line-clamp-2 text-sm text-muted">
                      {hotel.short_description}
                    </p>
                    <span className="inline-flex text-sm font-semibold text-brand-700">
                      {t("index.view_details")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
