import Link from "next/link";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
const DESTINATION_CARDS = [
  {
    key: "sapa",
    image: "/assets/client/images/city_imgs/sapa.jpg",
  },
  {
    key: "hanoi",
    image: "/assets/client/images/city_imgs/ha-noi.jpg",
  },
  {
    key: "ninh_binh",
    image: "/assets/client/images/city_imgs/ninh-binh.jpg",
  },
  {
    key: "da_nang",
    image: "/assets/client/images/city_imgs/da-nang.jpg",
  },
  {
    key: "hoi_an",
    image: "/assets/client/images/city_imgs/hoi-an.jpg",
  },
];

/** Port of the destination bento-mosaic section (first tile spans 2 cols/2 rows on large screens). */
export function AboutDestinationsSection({ t, locale }) {
  const routesIndexHref = localePath(locale, CLIENT_ROUTES.routesIndex);
  return (
    <section className="ksb-section px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 grid gap-4 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="ksb-section-label">
              {t("about_page.destinations.label")}
            </p>
            <h2 className="ksb-text-balance mt-2 font-display text-3xl font-extrabold text-slate-950 md:text-4xl">
              {t("about_page.destinations.title")}
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 md:justify-self-end">
            {t("about_page.destinations.description")}
          </p>
        </div>
        <div className="grid auto-rows-[180px] gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:auto-rows-[160px]">
          {DESTINATION_CARDS.map((destination, index) => (
            <Link
              key={destination.key}
              href={routesIndexHref}
              className={`about-destination-tile group relative ${index === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""}`}
            >
              {" "}
              <img
                src={destination.image}
                alt={t(`about_page.destinations.cities.${destination.key}`)}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 bg-contrast-900/75 p-4 text-lg font-extrabold text-white">
                {t(`about_page.destinations.cities.${destination.key}`)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
