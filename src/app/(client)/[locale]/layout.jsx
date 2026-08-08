import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMenus, getWebProfile } from "@/services/client-api";
import { NavBar } from "@/components/client/nav-bar";
import { Footer } from "@/components/client/footer";
import { FloatingContact } from "@/components/client/floating-contact";
import {
  JsonLd,
  SITE_NAME,
  buildOrganizationWebsiteJsonLd,
} from "@/lib/seo";

/**
 * The header nav is
 * `staticPrefix (Trang chủ, Giới thiệu, Tuyến đường) + dynamicItems (DB menu
 * tree from /public/menus) + staticSuffix (Liên hệ)` — not the dynamic tree
 * alone. Static ids are negative to avoid colliding with real DB menu ids.
 */
function buildMainMenu(dynamicItems, t) {
  const staticItem = (id, name, url) => ({
    id,
    name,
    url,
    parent_id: null,
    priority: 0,
    type: "custom_link",
    related_id: null,
    children: [],
  });
  const staticPrefix = [
    staticItem(-1, t("home"), "/"),
    staticItem(-2, t("about"), "/gioi-thieu"),
    staticItem(-3, t("routes"), "/tuyen-duong"),
  ];
  const staticSuffix = [staticItem(-4, t("contact"), "/lien-he")];
  return [...staticPrefix, ...dynamicItems, ...staticSuffix];
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  let webProfile = {};
  try {
    webProfile = await getWebProfile();
  } catch {
    webProfile = {};
  }
  const t = await getTranslations({ locale, namespace: "client.home" });
  // Defaults only — page-level generateMetadata owns canonical / hreflang.
  return {
    title: webProfile.title || t("meta.title_default") || SITE_NAME,
    description:
      webProfile.description || t("meta.description_default") || undefined,
    openGraph: {
      siteName: SITE_NAME,
      locale: locale === "en" ? "en_US" : "vi_VN",
      images: webProfile.logo_url
        ? [{ url: webProfile.logo_url }]
        : undefined,
    },
  };
}

export default async function ClientLocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const [messages, webProfile, menus, tMenu] = await Promise.all([
    getMessages(),
    getWebProfile(),
    getMenus(),
    getTranslations({ locale, namespace: "client.menu" }),
  ]);
  const mainMenu = buildMainMenu(menus, tMenu);
  const brandTitle = webProfile.title ?? "King Express Bus";
  const brandLogo =
    webProfile.logo_url ?? "/assets/client/images/web-information/logo.jpg";
  const orgJsonLd = buildOrganizationWebsiteJsonLd(webProfile, locale);
  return (
    <NextIntlClientProvider messages={messages}>
      <JsonLd data={orgJsonLd} />
      <div className="flex min-h-screen flex-col bg-page text-ink">
        <NavBar
          locale={locale}
          brandTitle={brandTitle}
          brandLogo={brandLogo}
          hotline={webProfile.hotline}
          mainMenu={mainMenu}
        />
        <div className="flex-1">{children}</div>
        <Footer locale={locale} webProfile={webProfile} />
        <FloatingContact locale={locale} webProfile={webProfile} />
      </div>
    </NextIntlClientProvider>
  );
}
