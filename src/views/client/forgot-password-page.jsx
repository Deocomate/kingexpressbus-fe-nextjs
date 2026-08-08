import { getTranslations, setRequestLocale } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/client/forgot-password-form";
import { buildPageMetadata } from "@/lib/seo";
import { CLIENT_ROUTES } from "@/services/client-routes";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "client.auth.forgot_password",
  });
  return buildPageMetadata({
    title: t("meta_title"),
    description: t("meta_description"),
    locale,
    path: CLIENT_ROUTES.forgotPassword,
    noIndex: true,
  });
}

export default async function ForgotPasswordPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ForgotPasswordForm locale={locale} />;
}
