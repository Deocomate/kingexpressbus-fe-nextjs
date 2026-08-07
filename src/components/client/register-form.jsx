"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  Coins,
  Gift,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Tag,
  User,
  UserPlus,
} from "lucide-react";
import { ApiError } from "@/services/api-base";
import { register, isSafeRedirectPath } from "@/services/client-auth";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";

/** Register form — see login-form for the split rationale. */
export function RegisterForm({ locale, redirectTo }) {
  const t = useTranslations("client.auth.register");
  const tValidation = useTranslations("client.auth.validation");
  const tCommon = useTranslations("client.auth.common");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const target = isSafeRedirectPath(redirectTo)
    ? redirectTo
    : localePath(locale, CLIENT_ROUTES.account);
  const loginHref = `${localePath(locale, CLIENT_ROUTES.login)}?redirect_to=${encodeURIComponent(target)}`;
  function validate() {
    const next = {};
    if (!name.trim()) next.name = tValidation("name_required");
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
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      router.push(target);
      router.refresh();
    } catch (err) {
      // Best-effort field targeting: the API doesn't return structured
      // per-field validation errors; only
      // a free-text `detail` string on 422/400. Sniff for "phone" to route
      // the message to the phone field, otherwise assume email conflict
      // (the far more common case — email is required & unique).
      if (err instanceof ApiError) {
        const body = err.body;
        const detail = (body?.detail ?? "").toLowerCase();
        if (detail.includes("phone")) {
          setErrors({
            phone: tValidation("phone_unique"),
          });
        } else {
          setErrors({
            email: tValidation("email_unique"),
          });
        }
      } else {
        setErrors({
          email: tValidation("email_unique"),
        });
      }
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
        {" "}
        <div className="hidden space-y-8 pr-10 text-ink lg:block">
          <div>
            <span className="inline-flex items-center rounded-sm bg-brand-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              <Gift className="mr-2 h-3.5 w-3.5" aria-hidden="true" />{" "}
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
          <div className="mt-10 grid gap-5">
            <div className="kx-panel flex items-start gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-accent-500 text-white">
                <Coins className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {t("feature_points_title")}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {t("feature_points_desc")}
                </p>
              </div>
            </div>
            <div className="kx-panel flex items-start gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-brand-600 text-white">
                <Tag className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {t("feature_offers_title")}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {t("feature_offers_desc")}
                </p>
              </div>
            </div>
          </div>
        </div>{" "}
        <div className="kx-panel-strong relative mx-auto w-full max-w-lg overflow-hidden p-8 md:p-10 lg:ml-auto">
          <div className="absolute left-0 top-0 h-0.5 w-full bg-accent-500" />
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-800">
              {t("form_title")}
            </h2>
            <p className="mt-2 text-base text-neutral-500">
              {t("form_subtitle")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {" "}
            <div className="group/input relative">
              <label
                htmlFor="name"
                className="mb-1.5 ml-1 block text-sm font-semibold text-neutral-700"
              >
                {t("name_label")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within/input:text-brand-600">
                  <User className="h-4 w-4" aria-hidden="true" />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="kx-form-control w-full py-3.5 pl-11 pr-4 font-medium placeholder:text-neutral-400"
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  autoFocus
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 ml-1 flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                  {errors.name}
                </p>
              )}
            </div>{" "}
            <div className="group/input relative">
              <label
                htmlFor="email"
                className="mb-1.5 ml-1 block text-sm font-semibold text-neutral-700"
              >
                {t("email_label")}
              </label>
              <p className="mb-2 ml-1 text-xs text-neutral-500">
                {t("email_hint")}
              </p>
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
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 ml-1 flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                  {errors.email}
                </p>
              )}
            </div>{" "}
            <div className="group/input relative">
              <label
                htmlFor="phone"
                className="mb-1.5 ml-1 block text-sm font-semibold text-neutral-700"
              >
                {t("phone_label")}
              </label>
              <p className="mb-2 ml-1 text-xs text-neutral-500">
                {t("phone_hint")}
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within/input:text-brand-600">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="kx-form-control w-full py-3.5 pl-11 pr-4 font-medium placeholder:text-neutral-400"
                  placeholder="0912 345 678"
                  autoComplete="tel"
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 ml-1 flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                  {errors.phone}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {" "}
              <div className="group/input relative">
                <label
                  htmlFor="password"
                  className="mb-1.5 ml-1 block text-sm font-semibold text-neutral-700"
                >
                  {t("password_label")}
                </label>
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
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 ml-1 flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                    {errors.password}
                  </p>
                )}
              </div>{" "}
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
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="kx-btn-primary w-full py-4 disabled:opacity-60"
            >
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                <span>{t("submit")}</span>
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
                {t("has_account")}{" "}
                <Link
                  href={loginHref}
                  className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
                >
                  {t("login_now")}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
