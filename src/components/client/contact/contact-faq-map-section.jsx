import { ContactFaqAccordion } from "@/components/client/contact/contact-faq-accordion";

/** Port of the FAQ (left column) + map embed (right column) section. */
export function ContactFaqMapSection({ t, mapEmbedSrc }) {
  const faqItems = t.raw("faq_items");
  return (
    <section className="ksb-section bg-white px-4">
      <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="rounded-sm border border-amber-100 bg-[#fffdf8] p-5 md:p-7 lg:col-span-6">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-600">
            {t("faq_badge")}
          </p>
          <h3 className="mt-1 text-2xl font-extrabold text-slate-800 md:text-3xl">
            {t("headings.faq")}
          </h3>
          <ContactFaqAccordion items={faqItems} />
        </article>
        <article className="rounded-sm border border-amber-100 bg-white p-5 md:p-7 lg:col-span-6">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-600">
            {t("headings.map")}
          </p>
          <h3 className="mt-1 text-2xl font-extrabold text-slate-800 md:text-3xl">
            {t("map_desc")}
          </h3>
          {mapEmbedSrc ? (
            <div className="contact-map-wrap mt-5 border border-amber-100 bg-slate-50">
              <iframe
                src={mapEmbedSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="mt-5 rounded-sm border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              {t("map_updating")}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
