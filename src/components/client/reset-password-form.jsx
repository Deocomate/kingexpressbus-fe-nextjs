"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertCircle, Lock, Mail, ShieldCheck } from "lucide-react";
import { ApiError } from "@/services/api-base";
import { resetPassword } from "@/services/client-auth";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";

/** Reset-password form. */
export function ResetPasswordForm({ locale, token, initialEmail = "" }) {
  const t = useTranslations("client.auth.reset_password");
  const tValidation = useTranslations("client.auth.validation");
  const tPassword = useTranslations("client.auth.password");
  const tCommon = useTranslations("client.auth.common");
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  function validate() {
    const next = {};
    if (!email.trim()) next.email = tValidation("email_required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = tValidation("email_invalid");
    if (!password) next.password = tValidation("password_required");
    else if (password.length < 8)
      next.password = tValidation("password_min_register");
    else if (password !== passwordConfirmation)
      next.password = tValidation("password_confirmed");
    return next;
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await resetPassword({
        email: email.trim(),
        token,
        password,
      });
      router.push(localePath(locale, CLIENT_ROUTES.login));
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({
          email: tPassword("reset_invalid_link"),
        });
      } else {
        setErrors({
          email: tPassword("reset_invalid_link"),
        });
      }
    } finally {
      setSubmitting(false);
    }
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
        <form onSubmit={handleSubmit} className="space-y-5">
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
            {errors.email && (
              <p className="mt-1.5 ml-1 flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                {errors.email}
              </p>
            )}
          </div>
          <div className="group/input relative">
            <label
              htmlFor="password"
              className="mb-1.5 ml-1 block text-sm font-semibold text-neutral-700"
            >
              {t("password_label")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within/input:text-brand-600">
                <Lock className="h-4 w-4" aria-hidden="true" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="kx-form-control w-full py-3.5 pl-11 pr-4 font-medium placeholder:text-neutral-400"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 ml-1 flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                {errors.password}
              </p>
            )}
          </div>
          <div className="group/input relative">
            <label
              htmlFor="password_confirmation"
              className="mb-1.5 ml-1 block text-sm font-semibold text-neutral-700"
            >
              {t("password_confirmation_label")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within/input:text-brand-600">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="kx-form-control w-full py-3.5 pl-11 pr-4 font-medium placeholder:text-neutral-400"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="kx-btn-primary w-full py-3.5 disabled:opacity-60"
          >
            {t("submit")}
          </button>
        </form>
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
