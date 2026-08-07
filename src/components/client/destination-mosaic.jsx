import { getTranslations } from "next-intl/server";

/**
 * Port of HomeService::getFeaturedDestinations() — a static curated list of
 * city tiles (not DB-backed in Blade either), rendered into the
 * `.ksb-destination-mosaic` bento-grid layout from home/index.blade.php.
 */
const DESTINATIONS = [
  {
    key: "hanoi",
    image: "/assets/client/images/city_imgs/ha-noi.jpg",
    layout: "hanoi",
  },
  {
    key: "sapa",
    image: "/assets/client/images/city_imgs/sapa.jpg",
    layout: "sapa",
  },
  {
    key: "ninh_binh",
    image: "/assets/client/images/city_imgs/ninh-binh.jpg",
    layout: "ninh_binh",
  },
  {
    key: "hue",
    image: "/assets/client/images/city_imgs/hue.jpg",
    layout: "hue",
  },
  {
    key: "da_nang",
    image: "/assets/client/images/city_imgs/da-nang.jpg",
    layout: "da_nang",
  },
  {
    key: "hoi_an",
    image: "/assets/client/images/city_imgs/hoi-an.jpg",
    layout: "hoi_an",
  },
  {
    key: "cat_ba",
    image: "/assets/client/images/city_imgs/cat-ba.jpg",
    layout: "cat_ba",
  },
  {
    key: "phong_nha",
    image: "/assets/client/images/city_imgs/phong-nha.jpg",
    layout: "phong_nha",
  },
  {
    key: "ha_giang",
    image: "/assets/client/images/city_imgs/ha-giang.jpg",
    layout: "ha_giang",
  },
];
export async function DestinationMosaic({ href }) {
  const t = await getTranslations("client.home_page.destinations");
  return (
    <div className="ksb-destination-mosaic">
      {DESTINATIONS.map((destination) => (
        <a
          key={destination.key}
          href={href}
          className={`ksb-destination-tile ksb-destination-tile--${destination.layout}`}
        >
          <img
            src={destination.image}
            alt={t(`cities.${destination.key}`)}
            width={480}
            height={360}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <span className="ksb-destination-tile-overlay" aria-hidden="true" />
          <span className="ksb-destination-tile-copy">
            <span className="ksb-destination-tile-name block font-extrabold text-white">
              {t(`cities.${destination.key}`)}
            </span>
            <span className="ksb-destination-tile-tag">
              {t(`tags.${destination.key}`)}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
