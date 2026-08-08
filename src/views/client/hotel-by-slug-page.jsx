import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ApiError } from "@/services/api-base";
import { getHotelBySlug } from "@/services/hotel-api";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
import { formatMoney, normalizeImageList } from "@/utils/client-format";
import {
  JsonLd,
  buildBreadcrumbJsonLd,
  buildHotelJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "client.hotels" });
  let hotel;
  try {
    hotel = await getHotelBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { title: t("index.meta_title") };
    }
    throw err;
  }
  return buildPageMetadata({
    title: t("detail.meta_title", { name: hotel.name }),
    description:
      hotel.short_description ||
      t("detail.meta_description_fallback", { name: hotel.name }),
    locale,
    path: `${CLIENT_ROUTES.hotels}/${slug}`,
    images: hotel.thumbnail_url || undefined,
  });
}

export default async function HotelDetailPage({ params, searchParams }) {
  const { locale, slug } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("client.hotels");

  let hotel;
  try {
    hotel = await getHotelBySlug(slug, {
      check_in: query.check_in,
      check_out: query.check_out,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const gallery = normalizeImageList(hotel.image_list_url);
  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
  const policies =
    hotel.policies && typeof hotel.policies === "object" ? hotel.policies : {};
  const bookingBase = localePath(locale, CLIENT_ROUTES.hotelBooking);

  return (
    <main className="bg-page text-ink">
      <JsonLd
        data={[
          buildHotelJsonLd(hotel, locale, `${CLIENT_ROUTES.hotels}/${slug}`),
          buildBreadcrumbJsonLd({
            name: hotel.name,
            locale,
            items: [
              { name: "Home", path: CLIENT_ROUTES.home },
              { name: "Hotels", path: CLIENT_ROUTES.hotels },
              { name: hotel.name, path: `${CLIENT_ROUTES.hotels}/${slug}` },
            ],
          }),
        ]}
      />
      <section className="relative min-h-[52vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            hotel.thumbnail_url ||
            gallery[0] ||
            "/assets/client/images/city_imgs/sapa.jpg"
          }
          alt={hotel.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/35 to-black/20" />
        <div className="relative container mx-auto flex min-h-[52vh] max-w-7xl flex-col justify-end px-4 pb-10 pt-24 text-white">
          <p className="kx-section-label text-brand-300">{t("detail.eyebrow")}</p>
          <h1 className="mt-2 max-w-4xl font-display text-4xl font-extrabold md:text-6xl">
            {hotel.name}
          </h1>
          <p className="mt-3 max-w-2xl text-white/85">
            {hotel.short_description || hotel.address}
          </p>
        </div>
      </section>

      <section className="ksb-container ksb-section space-y-10">
        {gallery.length > 1 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.slice(0, 8).map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                className="h-36 w-full object-cover md:h-44"
              />
            ))}
          </div>
        ) : null}

        {hotel.description ? (
          <div
            className="prose max-w-none text-ink prose-p:text-muted"
            dangerouslySetInnerHTML={{ __html: hotel.description }}
          />
        ) : null}

        {amenities.length ? (
          <div>
            <h2 className="font-display text-2xl font-extrabold">
              {t("detail.amenities")}
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {amenities.map((item) => (
                <li key={item} className="border border-line bg-white px-4 py-3 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-extrabold">
              {t("detail.rooms")}
            </h2>
            <p className="text-sm text-muted">{t("detail.rooms_hint")}</p>
          </div>
          <div className="space-y-4">
            {(hotel.rooms || []).map((room) => {
              const qs = new URLSearchParams({
                hotel: hotel.slug,
                room_id: String(room.id),
              });
              if (query.check_in) qs.set("check_in", query.check_in);
              if (query.check_out) qs.set("check_out", query.check_out);
              return (
                <article
                  key={room.id}
                  className="grid gap-4 border border-line bg-white p-4 md:grid-cols-[180px_1fr_auto] md:p-5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      room.thumbnail_url ||
                      normalizeImageList(room.image_list_url)[0] ||
                      hotel.thumbnail_url ||
                      "/assets/client/images/city_imgs/sapa.jpg"
                    }
                    alt={room.name}
                    className="h-40 w-full object-cover md:h-full"
                  />
                  <div>
                    <h3 className="font-display text-xl font-extrabold">{room.name}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {[room.bed_label, room.size_m2 ? `${room.size_m2} m²` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {Array.isArray(room.amenities) ? (
                      <p className="mt-3 line-clamp-2 text-sm text-muted">
                        {room.amenities.join(" · ")}
                      </p>
                    ) : null}
                    {typeof room.available_count === "number" ? (
                      <p className="mt-2 text-sm font-semibold text-brand-700">
                        {t("detail.available", { count: room.available_count })}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-start justify-center gap-3 md:items-end">
                    {room.base_price > room.sale_price ? (
                      <p className="text-sm text-muted line-through">
                        {formatMoney(room.base_price, locale)}
                      </p>
                    ) : null}
                    <p className="kx-price text-2xl font-extrabold">
                      {formatMoney(room.sale_price, locale)}
                    </p>
                    <p className="text-xs text-muted">{t("detail.per_night")}</p>
                    <Link
                      href={`${bookingBase}?${qs.toString()}`}
                      className="kx-btn-primary px-4 text-sm"
                    >
                      {t("detail.book_room")}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {(policies.payment || policies.cancellation || hotel.check_in_from) && (
          <div className="border border-line bg-white p-5 md:p-6">
            <h2 className="font-display text-2xl font-extrabold">
              {t("detail.policies")}
            </h2>
            <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
              {hotel.check_in_from ? (
                <div>
                  <dt className="font-semibold">{t("detail.check_in")}</dt>
                  <dd className="mt-1 text-muted">
                    {hotel.check_in_from}
                    {hotel.check_in_to ? ` – ${hotel.check_in_to}` : ""}
                  </dd>
                </div>
              ) : null}
              {hotel.check_out_from ? (
                <div>
                  <dt className="font-semibold">{t("detail.check_out")}</dt>
                  <dd className="mt-1 text-muted">
                    {hotel.check_out_from}
                    {hotel.check_out_to ? ` – ${hotel.check_out_to}` : ""}
                  </dd>
                </div>
              ) : null}
              {policies.payment ? (
                <div>
                  <dt className="font-semibold">{t("detail.payment_policy")}</dt>
                  <dd className="mt-1 text-muted">{policies.payment}</dd>
                </div>
              ) : null}
              {policies.cancellation ? (
                <div>
                  <dt className="font-semibold">{t("detail.cancel_policy")}</dt>
                  <dd className="mt-1 text-muted">{policies.cancellation}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        )}
      </section>
    </main>
  );
}
