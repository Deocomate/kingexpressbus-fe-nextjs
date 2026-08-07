import { Headset, Info, Mail, MessageCircle, PhoneCall } from "lucide-react";

/**
 * Support channels, working hours, and offices section.
 */
function FacebookGlyph({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H16.7V3.7C16.4 3.66 15.4 3.57 14.2 3.57c-2.4 0-4.05 1.47-4.05 4.16V9.9H7.4V13h2.75v8h3.35Z" />
    </svg>
  );
}
export function ContactSupportSection({ t, webProfile, facebookUrl, zaloUrl }) {
  const channels = [
    {
      key: "hotline",
      value: webProfile.hotline ?? "",
      label: t("channels.hotline"),
      href: webProfile.hotline
        ? `tel:${webProfile.hotline.replace(/[^\d+]/g, "")}`
        : null,
      icon: PhoneCall,
      tone: "bg-amber-50 text-amber-700 border-amber-200",
      external: false,
    },
    {
      key: "care",
      value: webProfile.phone ?? "",
      label: t("channels.care"),
      href: webProfile.phone
        ? `tel:${webProfile.phone.replace(/[^\d+]/g, "")}`
        : null,
      icon: Headset,
      tone: "bg-blue-50 text-blue-700 border-blue-200",
      external: false,
    },
    {
      key: "email",
      value: webProfile.email ?? "",
      label: t("channels.email"),
      href: webProfile.email ? `mailto:${webProfile.email}` : null,
      icon: Mail,
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
      external: false,
    },
    {
      key: "facebook",
      value: "Facebook",
      label: t("channels.facebook"),
      href: facebookUrl,
      icon: FacebookGlyph,
      tone: "bg-sky-50 text-sky-700 border-sky-200",
      external: true,
    },
    {
      key: "zalo",
      value: "Zalo",
      label: t("channels.zalo"),
      href: zaloUrl,
      icon: MessageCircle,
      tone: "bg-indigo-50 text-indigo-700 border-indigo-200",
      external: true,
    },
    {
      key: "whatsapp",
      value: webProfile.whatsapp ?? "",
      label: t("channels.whatsapp"),
      href: webProfile.whatsapp
        ? `https://wa.me/${webProfile.whatsapp.replace(/\D/g, "")}`
        : null,
      icon: MessageCircle,
      tone: "bg-green-50 text-green-700 border-green-200",
      external: true,
    },
  ].filter((channel) => channel.href);
  return (
    <section className="ksb-section px-4">
      <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
        <article className="rounded-sm border border-amber-100 bg-white p-5 md:p-7 lg:col-span-7">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-600">
            {t("headings.support_channels")}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-800 md:text-3xl">
            {t("support_title")}
          </h2>
          <p className="mt-2 text-sm text-slate-500 md:text-base">
            {t("support_desc")}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {channels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href ?? undefined}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
                className={`group rounded-sm border p-4 transition-colors duration-200 hover:border-brand-600/40 ${channel.tone}`}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-white/80 text-base">
                    <channel.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wide">
                      {channel.label}
                    </span>
                    <span className="mt-1 block truncate text-sm font-bold">
                      {channel.value}
                    </span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </article>
        <aside className="space-y-6 lg:col-span-5">
          <article className="rounded-sm border border-amber-100 bg-white p-5 md:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-600">
              {t("headings.working_hours")}
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-slate-800 md:text-2xl">
              {t("working_hours_title")}
            </h3>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-sm border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-sm font-semibold text-slate-800">
                  {t("hours.weekday_label")}
                </p>
                <p className="text-sm font-extrabold text-emerald-700">
                  07:00 - 22:00
                </p>
              </div>
              <div className="flex items-center justify-between rounded-sm border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm font-semibold text-slate-800">
                  {t("hours.weekend_label")}
                </p>
                <p className="text-sm font-extrabold text-blue-700">
                  08:00 - 21:00
                </p>
              </div>
              <p className="rounded-sm border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <Info className="mr-1 inline h-4 w-4" aria-hidden="true" />
                {t("hours.note")}
              </p>
            </div>
          </article>
          <article className="rounded-sm border border-amber-100 bg-white p-5 md:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-600">
              {t("headings.offices")}
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-slate-800 md:text-2xl">
              {t("offices_title")}
            </h3>
            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              <p className="rounded-sm border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                {t("no_offices")}
              </p>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
