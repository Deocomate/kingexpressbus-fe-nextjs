import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/client/login-form";
import { buildPageMetadata } from "@/lib/seo";
import { CLIENT_ROUTES } from "@/services/client-routes";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "client.auth.login",
  });
  return buildPageMetadata({
    title: t("meta_title"),
    description: t("meta_description"),
    locale,
    path: CLIENT_ROUTES.login,
    noIndex: true,
  });
}

export default async function LoginPage({ params, searchParams }) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  return (
    <LoginForm
      locale={locale}
      redirectTo={sp.redirect_to}
      initialEmail={typeof sp.email === "string" ? sp.email : ""}
    />
  );
}
