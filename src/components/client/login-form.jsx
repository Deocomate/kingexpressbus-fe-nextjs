"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  ArrowRight,
  History,
  KeyRound,
  Lock,
  Mail,
  Star,
} from "lucide-react";
import { ApiError } from "@/services/api-base";
import { login, isSafeRedirectPath } from "@/services/client-auth";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";

/**
 * Port of client/auth/login.blade.php. Kept as a single self-contained
 * client component (welcome panel + form) rather than splitting the static
 * copy into the server page, matching this codebase's existing pattern for
 * client/* components (nav-bar, search-bar, etc.) and Blade's own structure
 * (the whole page markup lives in one view file).
 */
export function LoginForm({ locale, redirectTo }) {
  const t = useTranslations("client.auth.login");
  const tValidation = useTranslations("client.auth.validation");
  const tFlash = useTranslations("client.auth.flash");
  const tCommon = useTranslations("client.auth.common");
  const router = useRouter();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const target = isSafeRedirectPath(redirectTo)
    ? redirectTo
    : localePath(locale, CLIENT_ROUTES.account);
  const registerHref = `${localePath(locale, CLIENT_ROUTES.register)}?redirect_to=${encodeURIComponent(target)}`;
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
      // Backend only authenticates by email; phone-based login (supported by
      // the Blade form's combined "login" field) isn't exposed by this API's
      // /auth/login endpoint. See phase report for detail.
      await login({
        email: loginValue.trim(),
        password,
      });
      router.push(target);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({
          login: tFlash("login_invalid"),
        });
      } else {
        setErrors({
          login: tFlash("login_invalid"),
        });
      }
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
        {" "}
        <div className="hidden space-y-8 pr-10 text-ink lg:block">
          <div>
            <span className="inline-flex items-center rounded-sm bg-accent-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              <Star className="mr-2 h-3.5 w-3.5" aria-hidden="true" />{" "}
              {t("badge")}
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight">
              {t("welcome_title")} <br />
              <span className="text-accent-500">{t("welcome_brand")}</span>
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted">
              {t("welcome_description")}
            </p>
          </div>
          <div className="mt-10 space-y-6">
            <div className="kx-panel flex items-start gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-brand-600 text-white">
                <History className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {t("feature_manage_title")}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {t("feature_manage_desc")}
                </p>
              </div>
            </div>
          </div>
        </div>{" "}
        <div className="kx-panel-strong relative mx-auto w-full max-w-md overflow-hidden p-8 md:p-10 lg:ml-auto">
          <div className="absolute left-0 top-0 h-0.5 w-full bg-brand-600" />
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-800">
              {t("form_title")}
            </h2>
            <p className="mt-2 text-base text-neutral-500">
              {t("form_subtitle")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-5">
              {" "}
              <div className="group/input relative">
                <label
                  htmlFor="login"
                  className="mb-1.5 ml-1 block text-sm font-semibold text-neutral-700"
                >
                  {t("login_label")}
                </label>
                <p className="mb-2 ml-1 text-xs text-neutral-500">
                  {t("login_hint")}
                </p>
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
                    autoFocus
                  />
                </div>
                {errors.login && (
                  <p className="mt-1.5 ml-1 flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                    {errors.login}
                  </p>
                )}
              </div>{" "}
              <div className="group/input relative">
                <div className="mb-1.5 ml-1 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-neutral-700"
                  >
                    {t("password_label")}
                  </label>
                </div>
                <p className="mb-2 ml-1 text-xs text-neutral-500">
                  {t("password_hint")}
                </p>
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
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 ml-1 flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                    {errors.password}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
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
            </div>
            <div className="rounded-sm border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-white text-brand-600">
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-800">
                    {t("forgot_password_title")}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {t("forgot_password_desc")}
                  </p>
                  <Link
                    href={localePath(locale, CLIENT_ROUTES.forgotPassword)}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
                  >
                    <span>{t("forgot_password_link")}</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="kx-btn-primary w-full py-4 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex items-center justify-center gap-2">
                <span>{submitting ? t("submitting") : t("submit")}</span>
                {!submitting ? (
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                ) : null}
              </span>
            </button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-neutral-500">
                  {tCommon("or")}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-neutral-600">
                {t("no_account")}{" "}
                <Link
                  href={registerHref}
                  className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
                >
                  {t("register_now")}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
