"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, UserPlus } from "lucide-react";
import { getMe } from "@/services/client-auth";
import { CLIENT_ROUTES, localePath } from "@/services/client-routes";

/**
 * Post-booking CTA: invite guests to create/claim an account with the same email.
 * Hidden when a session already exists.
 */
export function BookingSuccessAccountCta({
  locale,
  email,
  name,
}) {
  const t = useTranslations("client.booking.success");
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((user) => {
        if (!cancelled) setShow(!user);
      })
      .catch(() => {
        if (!cancelled) setShow(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  const params = new URLSearchParams();
  params.set(
    "redirect_to",
    localePath(locale, CLIENT_ROUTES.account),
  );
  if (email) params.set("email", email);
  if (name) params.set("name", name);
  const registerHref = `${localePath(locale, CLIENT_ROUTES.register)}?${params.toString()}`;

  return (
    <section className="rounded-sm border border-brand-200 bg-brand-50/80 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-brand-600 text-white">
          <UserPlus className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold text-ink">
            {t("account_cta_title")}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t("account_cta_desc")}
          </p>
          <Link
            href={registerHref}
            className="kx-btn-primary mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <span>{t("account_cta_button")}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
