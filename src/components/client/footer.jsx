import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";
export async function Footer({ locale, webProfile }) {
  const t = await getTranslations({
    locale,
    namespace: "client.footer",
  });
  const brandTitle = webProfile.title ?? "King Express Bus";
  const brandLogo =
    webProfile.logo_url ?? "/assets/client/images/web-information/logo.jpg";
  const hotlineTel = webProfile.hotline
    ? webProfile.hotline.replace(/[^\d+]/g, "")
    : "";
  const phoneTel = webProfile.phone
    ? webProfile.phone.replace(/[^\d+]/g, "")
    : "";
  const whatsappDigits = webProfile.whatsapp
    ? webProfile.whatsapp.replace(/[^0-9]/g, "")
    : "";
  const aboutLinks = [
    {
      label: t("links.intro"),
      href: localePath(locale, CLIENT_ROUTES.about),
    },
    {
      label: t("links.routes"),
      href: localePath(locale, CLIENT_ROUTES.routesIndex),
    },
    {
      label: t("links.contact"),
      href: localePath(locale, CLIENT_ROUTES.contact),
    },
  ];
  const supportLinks = [
    {
      label: t("support_links.cancellation"),
      href: `${localePath(locale, CLIENT_ROUTES.about)}#faq`,
    },
    {
      label: t("support_links.terms"),
      href: localePath(locale, CLIENT_ROUTES.about),
    },
    {
      label: t("support_links.privacy"),
      href: localePath(locale, CLIENT_ROUTES.about),
    },
  ];
  return (
    <footer className="kx-footer">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link
              href={localePath(locale, CLIENT_ROUTES.home)}
              className="mb-4 inline-flex items-center gap-3"
            >
              {" "}
              <img
                src={brandLogo}
                alt={brandTitle}
                className="h-11 w-11 rounded-sm border border-white/15 object-cover"
              />
              <span className="text-lg font-extrabold tracking-tight text-white">
                {brandTitle}
              </span>
            </Link>
            <p className="kx-footer-text mb-4">
              {webProfile.description ?? t("default_description")}
            </p>
            <div className="flex items-center gap-2">
              {webProfile.facebook_url && (
                <a
                  href={webProfile.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="kx-footer-social"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
              )}
              {webProfile.zalo_url && (
                <a
                  href={webProfile.zalo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Zalo"
                  className="kx-footer-social"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {webProfile.whatsapp && (
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="kx-footer-social"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {webProfile.email && (
                <a
                  href={`mailto:${webProfile.email}`}
                  aria-label="Email"
                  className="kx-footer-social"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 className="kx-footer-heading">{t("about")}</h4>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="kx-footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="kx-footer-heading">{t("support")}</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link href={link.href} className="kx-footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="kx-footer-heading">{t("contact")}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              {webProfile.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin
                    className="kx-footer-contact-icon"
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed">{webProfile.address}</span>
                </li>
              )}
              {webProfile.hotline && (
                <li className="flex items-center gap-2.5">
                  <Phone
                    className="kx-footer-contact-icon"
                    aria-hidden="true"
                  />
                  <a href={`tel:${hotlineTel}`} className="kx-footer-hotline">
                    {webProfile.hotline}
                  </a>
                </li>
              )}
              {webProfile.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone
                    className="kx-footer-contact-icon"
                    aria-hidden="true"
                  />
                  <a
                    href={`tel:${phoneTel}`}
                    className="transition-colors duration-fast ease-out-soft hover:text-white"
                  >
                    {webProfile.phone}
                  </a>
                </li>
              )}
              {webProfile.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="kx-footer-contact-icon" aria-hidden="true" />
                  <a
                    href={`mailto:${webProfile.email}`}
                    className="transition-colors duration-fast ease-out-soft hover:text-white"
                  >
                    {webProfile.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-4">
          <div className="flex flex-col gap-3 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} {brandTitle}. {t("rights")}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={localePath(locale, CLIENT_ROUTES.about)}
                className="transition-colors duration-fast ease-out-soft hover:text-brand-500"
              >
                {t("links.intro")}
              </Link>
              <Link
                href={localePath(locale, CLIENT_ROUTES.contact)}
                className="transition-colors duration-fast ease-out-soft hover:text-brand-500"
              >
                {t("links.contact")}
              </Link>
              <Link
                href={localePath(locale, CLIENT_ROUTES.routesIndex)}
                className="transition-colors duration-fast ease-out-soft hover:text-brand-500"
              >
                {t("links.routes")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// lucide-react ships no brand icons; a minimal inline glyph is kept close
// to the Facebook "f" mark instead of pulling in a brand-icon package.
function FacebookIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}
