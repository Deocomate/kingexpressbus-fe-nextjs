"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  ArrowRight,
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
import {
  register,
  verifyEmail,
  resendVerification,
  isSafeRedirectPath,
} from "@/services/client-auth";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";

/** Register form with 4-digit email verification step. */
export function RegisterForm({
  locale,
  redirectTo,
  initialEmail = "",
  initialName = "",
  startOnVerify = false,
}) {
  const t = useTranslations("client.auth.register");
  const tVerify = useTranslations("client.auth.verify");
  const tValidation = useTranslations("client.auth.validation");
  const tCommon = useTranslations("client.auth.common");
  const router = useRouter();
  const [step, setStep] = useState(
    startOnVerify && initialEmail ? "verify" : "register",
  );
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [codeDigits, setCodeDigits] = useState(["", "", "", ""]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendNote, setResendNote] = useState("");
  const codeRefs = useRef([]);
  const didAutoResend = useRef(false);
  const target = isSafeRedirectPath(redirectTo)
    ? redirectTo
    : localePath(locale, CLIENT_ROUTES.account);
  const loginHref = `${localePath(locale, CLIENT_ROUTES.login)}?redirect_to=${encodeURIComponent(target)}${
    email ? `&email=${encodeURIComponent(email)}` : ""
  }`;

  useEffect(() => {
    if (!startOnVerify || !initialEmail || didAutoResend.current) return;
    didAutoResend.current = true;
    resendVerification({ email: initialEmail.trim() })
      .then(() => setResendNote(tVerify("resend_sent")))
      .catch(() => setResendNote(tVerify("resend_sent")));
  }, [startOnVerify, initialEmail, tVerify]);

  function validateRegister() {
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

  async function handleRegister(e) {
    e.preventDefault();
    const validationErrors = validateRegister();
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
      setStep("verify");
      setCodeDigits(["", "", "", ""]);
      setResendNote("");
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body;
        const detail = (body?.detail ?? "").toLowerCase();
        if (detail.includes("phone")) {
          setErrors({ phone: tValidation("phone_unique") });
        } else {
          setErrors({ email: tValidation("email_unique") });
        }
      } else {
        setErrors({ email: tValidation("email_unique") });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function setDigitAt(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...codeDigits];
    next[index] = digit;
    setCodeDigits(next);
    if (digit && index < 3) {
      codeRefs.current[index + 1]?.focus();
    }
  }

  function onDigitKeyDown(index, event) {
    if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  }

  function onDigitPaste(event) {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (!pasted) return;
    const next = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
    setCodeDigits(next);
    codeRefs.current[Math.min(pasted.length, 3)]?.focus();
  }

  async function handleVerify(e) {
    e.preventDefault();
    const code = codeDigits.join("");
    if (!/^\d{4}$/.test(code)) {
      setErrors({ code: tVerify("code_invalid") });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await verifyEmail({ email: email.trim(), code });
      router.push(target);
      router.refresh();
    } catch {
      setErrors({ code: tVerify("code_invalid") });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setResendNote("");
    setErrors((prev) => ({ ...prev, code: undefined }));
    try {
      await resendVerification({ email: email.trim() });
      setResendNote(tVerify("resend_sent"));
    } catch {
      setResendNote(tVerify("resend_sent"));
    } finally {
      setResending(false);
    }
  }

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="hidden space-y-8 pr-6 text-ink lg:block">
          <div>
            <span className="inline-flex items-center rounded-sm bg-brand-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              <Gift className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
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
          <div className="grid gap-4">
            <div className="kx-panel flex items-start gap-4 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-accent-500 text-white">
                <Coins className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold">
                  {t("feature_points_title")}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {t("feature_points_desc")}
                </p>
              </div>
            </div>
            <div className="kx-panel flex items-start gap-4 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-brand-600 text-white">
                <Tag className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold">
                  {t("feature_offers_title")}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {t("feature_offers_desc")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="kx-panel-strong relative mx-auto w-full max-w-lg overflow-hidden p-7 sm:p-9 lg:ml-auto">
          <div className="absolute left-0 top-0 h-0.5 w-full bg-accent-500" />
          {step === "register" ? (
            <>
              <div className="mb-7 text-center lg:text-left">
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  {t("form_title")}
                </h2>
                <p className="mt-2 text-sm text-muted sm:text-base">
                  {t("form_subtitle")}
                </p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="group/input relative">
                  <label
                    htmlFor="name"
                    className="mb-1.5 ml-0.5 block text-sm font-semibold text-neutral-700"
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
                      autoFocus={!initialName}
                    />
                  </div>
                  {errors.name ? (
                    <p className="mt-1.5 ml-0.5 flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div className="group/input relative">
                  <label
                    htmlFor="email"
                    className="mb-1.5 ml-0.5 block text-sm font-semibold text-neutral-700"
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
                    />
                  </div>
                  {errors.email ? (
                    <p className="mt-1.5 ml-0.5 flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      {errors.email}
                    </p>
                  ) : (
                    <p className="mt-1.5 ml-0.5 text-xs text-muted">
                      {t("email_hint")}
                    </p>
                  )}
                </div>

                <div className="group/input relative">
                  <label
                    htmlFor="phone"
                    className="mb-1.5 ml-0.5 block text-sm font-semibold text-neutral-700"
                  >
                    {t("phone_label")}
                  </label>
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
                  {errors.phone ? (
                    <p className="mt-1.5 ml-0.5 flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      {errors.phone}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="group/input relative">
                    <label
                      htmlFor="password"
                      className="mb-1.5 ml-0.5 block text-sm font-semibold text-neutral-700"
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
                    {errors.password ? (
                      <p className="mt-1.5 ml-0.5 flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        {errors.password}
                      </p>
                    ) : (
                      <p className="mt-1.5 ml-0.5 text-xs text-muted">
                        {t("password_hint")}
                      </p>
                    )}
                  </div>
                  <div className="group/input relative">
                    <label
                      htmlFor="password_confirmation"
                      className="mb-1.5 ml-0.5 block text-sm font-semibold text-neutral-700"
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
                        onChange={(e) =>
                          setPasswordConfirmation(e.target.value)
                        }
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
                  aria-busy={submitting}
                  className="kx-btn-primary mt-1 w-full py-3.5 disabled:opacity-60"
                >
                  <span className="flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    <span>{submitting ? t("submitting") : t("submit")}</span>
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
                  {t("has_account")}{" "}
                  <Link
                    href={loginHref}
                    className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
                  >
                    {t("login_now")}
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <>
              <div className="mb-7 text-center lg:text-left">
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  {tVerify("title")}
                </h2>
                <p className="mt-2 text-sm text-muted sm:text-base">
                  {tVerify("subtitle", { email: email.trim() })}
                </p>
              </div>
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-neutral-700">
                    {tVerify("code_label")}
                  </label>
                  <div className="flex justify-between gap-2 sm:gap-3">
                    {codeDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          codeRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        value={digit}
                        onChange={(e) => setDigitAt(index, e.target.value)}
                        onKeyDown={(e) => onDigitKeyDown(index, e)}
                        onPaste={onDigitPaste}
                        className="kx-form-control h-14 w-full max-w-16 text-center text-2xl font-bold tracking-widest"
                        aria-label={tVerify("digit_aria", { n: index + 1 })}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                  {errors.code ? (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      {errors.code}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="kx-btn-primary w-full py-3.5 disabled:opacity-60"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>
                      {submitting ? tVerify("submitting") : tVerify("submit")}
                    </span>
                    {!submitting ? (
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    ) : null}
                  </span>
                </button>

                <div className="text-center text-sm text-muted">
                  <p>{tVerify("resend_prompt")}</p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="mt-2 font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-60"
                  >
                    {resending ? tVerify("resending") : tVerify("resend")}
                  </button>
                  {resendNote ? (
                    <p className="mt-2 text-xs text-green-700">{resendNote}</p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep("register");
                    setErrors({});
                  }}
                  className="w-full text-center text-sm font-medium text-neutral-500 hover:text-ink"
                >
                  {tVerify("back")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
