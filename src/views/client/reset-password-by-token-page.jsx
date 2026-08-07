import { getTranslations, setRequestLocale } from "next-intl/server";
import { ResetPasswordForm } from "@/components/client/reset-password-form";
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "client.auth.reset_password",
  });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}
export default async function ResetPasswordPage({ params, searchParams }) {
  const { locale, token } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  return (
    <ResetPasswordForm
      locale={locale}
      token={decodeURIComponent(token)}
      initialEmail={sp.email}
    />
  );
}
