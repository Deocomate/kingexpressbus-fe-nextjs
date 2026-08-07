import Link from "next/link";
import { Headset, Home, Info, Phone, ShieldCheck } from "lucide-react";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
const DESTINATIONS = [
  {
    key: "sapa",
    image: "/assets/client/images/city_imgs/sapa.jpg",
    alt: "Sa Pa",
  },
  {
    key: "hanoi",
    image: "/assets/client/images/city_imgs/ha-noi.jpg",
    alt: "Hà Nội",
  },
  {
    key: "ninh_binh",
    image: "/assets/client/images/city_imgs/ninh-binh.jpg",
    alt: "Ninh Bình",
  },
];

/** Right-column aside: support CTA, destination teasers, popular-page links. */
export function CmsPageSidebar({ t, locale }) {
  const routesIndexHref = localePath(locale, CLIENT_ROUTES.routesIndex);
  return (
    <aside className="space-y-5 lg:col-span-4">
      <div className="rounded-sm border border-amber-100 bg-white p-5 transition-all duration-300 hover:shadow-xl">
        <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-sm bg-primary-50 text-primary-600">
          <Headset className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800">
          {t("support.title")}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {t("support.description")}
        </p>
        <Link
          href={localePath(locale, CLIENT_ROUTES.contact)}
          className="mt-4 inline-flex items-center gap-2 rounded-sm bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-primary-700"
        >
          {t("support.cta")}
          <Phone className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="rounded-sm border border-amber-100 bg-white p-5">
        <h3 className="text-base font-extrabold text-slate-800">
          {t("destinations.title")}
        </h3>
        <div className="mt-4 space-y-3">
          {DESTINATIONS.map((destination) => (
            <Link
              key={destination.key}
              href={routesIndexHref}
              className="group flex items-center gap-3 rounded-sm border border-slate-100 p-2 transition-all duration-300 hover:border-primary-200"
            >
              {" "}
              <img
                src={destination.image}
                alt={destination.alt}
                className="h-14 w-20 rounded-sm object-cover"
              />
              <div>
                <p className="text-sm font-bold text-slate-700">
                  {t(`destinations.${destination.key}.name`)}
                </p>
                <p className="text-xs text-slate-500">
                  {t(`destinations.${destination.key}.desc`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="rounded-sm border border-amber-100 bg-white p-5">
        <h3 className="text-base font-extrabold text-slate-800">
          {t("popular_pages.title")}
        </h3>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link
              href={`${localePath(locale, CLIENT_ROUTES.page)}/gioi-thieu`}
              className="inline-flex items-center gap-2 font-semibold text-primary-700 transition hover:translate-x-1 hover:text-primary-600"
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              {t("popular_pages.about")}
            </Link>
          </li>
          <li>
            <Link
              href={`${localePath(locale, CLIENT_ROUTES.page)}/chinh-sach`}
              className="inline-flex items-center gap-2 font-semibold text-primary-700 transition hover:translate-x-1 hover:text-primary-600"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {t("popular_pages.policy")}
            </Link>
          </li>
          <li>
            <Link
              href={localePath(locale, CLIENT_ROUTES.home)}
              className="inline-flex items-center gap-2 font-semibold text-primary-700 transition hover:translate-x-1 hover:text-primary-600"
            >
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
              {t("popular_pages.home")}
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}
