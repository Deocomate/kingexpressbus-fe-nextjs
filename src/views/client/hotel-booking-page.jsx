import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ApiError } from "@/services/api-base";
import { getHotelBySlug, listHotels } from "@/services/hotel-api";
import { HotelBookingForm } from "@/components/client/hotel-booking-form";
import { buildPageMetadata } from "@/lib/seo";
import { CLIENT_ROUTES } from "@/services/client-routes";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "client.hotels.booking",
  });
  return buildPageMetadata({
    title: t("meta_title"),
    description: t("meta_description"),
    locale,
    path: CLIENT_ROUTES.hotelBooking,
    noIndex: true,
  });
}

export default async function HotelBookingPage({ params, searchParams }) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("client.hotels.booking");

  let hotel;
  try {
    if (query.hotel) {
      hotel = await getHotelBySlug(query.hotel);
    } else {
      const hotels = await listHotels();
      if (!hotels.length) notFound();
      hotel = await getHotelBySlug(hotels[0].slug);
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <main className="bg-page text-ink">
      <section className="booking-hero ksb-section-hero px-4 text-white">
        <div className="container mx-auto max-w-7xl py-4 md:py-6">
          <p className="kx-section-label text-brand-300">{t("eyebrow")}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-white/85">{hotel.name}</p>
        </div>
      </section>
      <section className="ksb-container ksb-section">
        <HotelBookingForm
          hotel={hotel}
          locale={locale}
          initialRoomId={query.room_id}
          initialCheckIn={query.check_in}
          initialCheckOut={query.check_out}
        />
      </section>
    </main>
  );
}
