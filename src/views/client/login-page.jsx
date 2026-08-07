import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/client/login-form";
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "client.auth.login",
  });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}
export default async function LoginPage({ params, searchParams }) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  return <LoginForm locale={locale} redirectTo={sp.redirect_to} />;
}
