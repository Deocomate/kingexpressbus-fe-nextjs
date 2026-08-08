"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  ArrowRight,
  History,
  Lock,
  Mail,
  Star,
} from "lucide-react";
import { ApiError } from "@/services/api-base";
import { login, isSafeRedirectPath } from "@/services/client-auth";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";

/**
 * Login form — self-contained client component (welcome panel + form).
 */
export function LoginForm({ locale, redirectTo, initialEmail = "" }) {
  const t = useTranslations("client.auth.login");
  const tValidation = useTranslations("client.auth.validation");
  const tFlash = useTranslations("client.auth.flash");
  const tCommon = useTranslations("client.auth.common");
  const router = useRouter();
  const [loginValue, setLoginValue] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const target = isSafeRedirectPath(redirectTo)
    ? redirectTo
    : localePath(locale, CLIENT_ROUTES.account);
  const registerHref = `${localePath(locale, CLIENT_ROUTES.register)}?redirect_to=${encodeURIComponent(target)}${
    initialEmail ? `&email=${encodeURIComponent(initialEmail)}` : ""
  }`;
  function validate() {
    const next = {};
    if (!loginValue.trim()) next.login = tValidation("login_required");
    if (!password) next.password = tValidation("password_required");
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
      await login({
        email: loginValue.trim(),
        password,
      });
      router.push(target);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        const detail = String(err.body?.detail ?? "").toLowerCase();
        if (detail.includes("not verified")) {
          const params = new URLSearchParams({
            redirect_to: target,
            email: loginValue.trim(),
            verify: "1",
          });
          router.push(
            `${localePath(locale, CLIENT_ROUTES.register)}?${params.toString()}`,
          );
          return;
        }
      }
      setErrors({
        login: tFlash("login_invalid"),
      });
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="hidden space-y-8 pr-6 text-ink lg:block">
          <div>
            <span className="inline-flex items-center rounded-sm bg-accent-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              <Star className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              {t("badge")}
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
              {t("welcome_title")}{" "}
              <span className="text-accent-500">{t("welcome_brand")}</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-muted">
              {t("welcome_description")}
            </p>
          </div>
          <div className="kx-panel flex items-start gap-4 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-brand-600 text-white">
              <History className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-semibold">
                {t("feature_manage_title")}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {t("feature_manage_desc")}
              </p>
            </div>
          </div>
        </div>

        <div className="kx-panel-strong relative mx-auto w-full max-w-md overflow-hidden p-7 sm:p-9 lg:ml-auto">
          <div className="absolute left-0 top-0 h-0.5 w-full bg-brand-600" />
          <div className="mb-7 text-center lg:text-left">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {t("form_title")}
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              {t("form_subtitle")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group/input relative">
              <label
                htmlFor="login"
                className="mb-1.5 ml-0.5 block text-sm font-semibold text-neutral-700"
              >
                {t("login_label")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within/input:text-brand-600">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                <input
                  id="login"
                  name="login"
                  type="text"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  className="kx-form-control w-full py-3.5 pl-11 pr-4 font-medium placeholder:text-neutral-400"
                  placeholder="example@gmail.com"
                  autoComplete="username"
                  autoFocus={!initialEmail}
                />
              </div>
              {errors.login ? (
                <p className="mt-1.5 ml-0.5 flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errors.login}
                </p>
              ) : null}
            </div>

            <div className="group/input relative">
              <div className="mb-1.5 ml-0.5 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-neutral-700"
                >
                  {t("password_label")}
                </label>
                <Link
                  href={localePath(locale, CLIENT_ROUTES.forgotPassword)}
                  className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
                >
                  {t("forgot_password_link")}
                </Link>
              </div>
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
                  autoComplete="current-password"
                  autoFocus={Boolean(initialEmail)}
                />
              </div>
              {errors.password ? (
                <p className="mt-1.5 ml-0.5 flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errors.password}
                </p>
              ) : null}
            </div>

            <label className="group/check flex cursor-pointer items-center gap-2.5">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded border-2 border-neutral-300 transition-colors peer-checked:border-primary-600 peer-checked:bg-brand-600" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity peer-checked:opacity-100">
                  <span className="text-xs">✓</span>
                </div>
              </div>
              <span className="text-sm font-medium text-neutral-600">
                {t("remember")}
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="kx-btn-primary w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex items-center justify-center gap-2">
                <span>{submitting ? t("submitting") : t("submit")}</span>
                {!submitting ? (
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                ) : null}
              </span>
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-neutral-500">
                  {tCommon("or")}
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-neutral-600">
              {t("no_account")}{" "}
              <Link
                href={registerHref}
                className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                {t("register_now")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
