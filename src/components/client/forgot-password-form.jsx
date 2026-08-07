"use client";
import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { ApiError } from "@/services/api-base";
import { forgotPassword } from "@/services/client-auth";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";

/** Port of client/auth/forgot-password.blade.php. */
export function ForgotPasswordForm({ locale }) {
  const t = useTranslations("client.auth.forgot_password");
  const tValidation = useTranslations("client.auth.validation");
  const tPassword = useTranslations("client.auth.password");
  const tCommon = useTranslations("client.auth.common");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError(tValidation("email_required"));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword({
        email: email.trim(),
      });
    } catch (err) {
      // Anti-enumeration: backend always returns 200 regardless of whether the
      // email exists. Only a hard network/server error should hit this path.
      if (!(err instanceof ApiError)) {
        setError(tValidation("email_invalid"));
        setSubmitting(false);
        return;
      }
    }
    setSent(true);
    setSubmitting(false);
  }
  return (
    <section className="flex min-h-screen items-center justify-center bg-page px-4 py-12 sm:px-6 lg:px-8">
      <div className="kx-panel-strong relative w-full max-w-md overflow-hidden p-8 md:p-10">
        <div className="absolute left-0 top-0 h-0.5 w-full bg-brand-600" />
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-800">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm text-neutral-500">{t("subtitle")}</p>
        </div>
        {sent && (
          <div className="mb-6 flex items-center gap-1.5 rounded-sm border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {tPassword("reset_link_sent")}
          </div>
        )}
        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group/input relative">
              <label
                htmlFor="email"
                className="mb-1.5 ml-1 block text-sm font-semibold text-neutral-700"
              >
                {t("email_label")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within/input:text-brand-600">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="kx-form-control w-full py-3.5 pl-11 pr-4 font-medium placeholder:text-neutral-400"
                  placeholder="email@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-1.5 ml-1 flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="kx-btn-primary w-full py-3.5 disabled:opacity-60"
            >
              {t("submit")}
            </button>
          </form>
        )}
        <div className="mt-6 text-center text-sm text-neutral-600">
          <Link
            href={localePath(locale, CLIENT_ROUTES.login)}
            className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            {tCommon("back_to_login")}
          </Link>
        </div>
      </div>
    </section>
  );
}
