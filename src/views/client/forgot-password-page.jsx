import { getTranslations, setRequestLocale } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/client/forgot-password-form";
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "client.auth.forgot_password",
  });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}
export default async function ForgotPasswordPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ForgotPasswordForm locale={locale} />;
}
