import { getTranslations, setRequestLocale } from "next-intl/server";
import { RegisterForm } from "@/components/client/register-form";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "client.auth.register",
  });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function RegisterPage({ params, searchParams }) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  return (
    <RegisterForm
      locale={locale}
      redirectTo={sp.redirect_to}
      initialEmail={typeof sp.email === "string" ? sp.email : ""}
      initialName={typeof sp.name === "string" ? sp.name : ""}
    />
  );
}
