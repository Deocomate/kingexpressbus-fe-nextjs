"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu, Phone, Ticket, X } from "lucide-react";
import { AUTH_CHANGED_EVENT, getMe, logout } from "@/services/client-auth";
import {
  CLIENT_ROUTES,
  localePath,
  localizeMenuUrl,
  switchLocaleInPath,
} from "@/services/client-routes";

/**
 * Client nav bar. Auth user and customer links come from the client layout.
 */
export function NavBar({ locale, brandTitle, brandLogo, hotline, mainMenu }) {
  const t = useTranslations("client.nav");
  const tLayout = useTranslations("client.layout");
  const tRoutes = useTranslations("client.routes.index");
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [openAccordionId, setOpenAccordionId] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const languageMenuRef = useRef(null);
  const accountMenuRef = useRef(null);

  // usePathname (not useSearchParams) so this header stays statically
  // prerenderable; the query string is read from window at click time.
  function switchLocale(nextLocale) {
    const search = typeof window !== "undefined" ? window.location.search : "";
    router.push(switchLocaleInPath(pathname, search, nextLocale));
    setLanguageOpen(false);
    setMobileOpen(false);
  }
  useEffect(() => {
    let cancelled = false;
    function refreshAuth() {
      getMe()
        .then((user) => {
          if (!cancelled) setAuthUser(user ?? null);
        })
        .catch(() => {
          if (!cancelled) setAuthUser(null);
        });
    }
    refreshAuth();
    window.addEventListener(AUTH_CHANGED_EVENT, refreshAuth);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_CHANGED_EVENT, refreshAuth);
    };
  }, [pathname]);
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    function onKeydown(event) {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      setLanguageOpen(false);
      setAccountOpen(false);
      setOpenDropdownId(null);
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);
  useEffect(() => {
    if (!languageOpen && !accountOpen) return;
    function onPointerDown(event) {
      if (
        languageOpen &&
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target)
      ) {
        setLanguageOpen(false);
      }
      if (
        accountOpen &&
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [languageOpen, accountOpen]);
  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Session may already be invalid server-side; clear client state anyway.
    }
    setAuthUser(null);
    setAccountOpen(false);
    setMobileOpen(false);
    router.push(localePath(locale, CLIENT_ROUTES.home));
    router.refresh();
  }
  const languageOptions = [
    {
      code: "vi",
      label: t("languages.vi"),
      flag: "/assets/client/icons/vn-flag.svg",
    },
    {
      code: "en",
      label: t("languages.en"),
      flag: "/assets/client/icons/en-flag.svg",
    },
  ];
  const currentLanguage =
    languageOptions.find((l) => l.code === locale) ?? languageOptions[0];
  const hotlineTel = hotline ? hotline.replace(/[^\d+]/g, "") : "";
  const isCustomer =
    authUser?.role === "customer" || authUser?.role === "admin";
  const customerLinks = isCustomer
    ? [
        {
          label: tLayout("profile"),
          href: localePath(locale, CLIENT_ROUTES.account),
        },
        {
          label: tLayout("my_bookings"),
          href: `${localePath(locale, CLIENT_ROUTES.account)}#history`,
        },
      ]
    : [];
  function isMenuItemActive(url) {
    const href = localizeMenuUrl(locale, url);
    if (href === localePath(locale, CLIENT_ROUTES.home))
      return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return (
    <header
      className={`kx-header sticky top-0 border-b border-line-strong bg-white ${scrolled ? "kx-header--scrolled" : ""}`}
    >
      {" "}
      <div className="kx-header-top hidden border-b border-line-strong lg:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-end gap-2 px-4">
          {hotline && (
            <>
              <a
                href={`tel:${hotlineTel}`}
                className="kx-header-utility inline-flex max-w-[10rem] items-center gap-1.5 truncate rounded-sm px-2 py-1"
              >
                <Phone
                  className="h-2.5 w-2.5 shrink-0 text-ink/50"
                  aria-hidden="true"
                />
                <span className="truncate">{hotline}</span>
              </a>
              <span className="h-3 w-px bg-line-strong" aria-hidden="true" />
            </>
          )}
          <div className="relative" ref={languageMenuRef}>
            <button
              type="button"
              onClick={() => setLanguageOpen((v) => !v)}
              aria-expanded={languageOpen}
              aria-haspopup="listbox"
              className="kx-header-utility inline-flex h-7 items-center gap-1 rounded-sm px-2"
            >
              <Image
                src={currentLanguage.flag}
                alt={currentLanguage.label}
                width={14}
                height={14}
                className="h-3.5 w-3.5 shrink-0 rounded-sm object-cover"
              />
              <span className="uppercase">{currentLanguage.code}</span>
              <ChevronDown
                className={`h-[7px] w-[7px] text-ink/40 transition-transform ${languageOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            {languageOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-full z-header-menu w-36 origin-top-right pt-1"
              >
                <div className="rounded-sm border border-line-strong bg-white p-1 shadow-card">
                  {languageOptions.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => switchLocale(language.code)}
                      role="option"
                      aria-selected={locale === language.code}
                      className={`mb-0.5 flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs last:mb-0 ${locale === language.code ? "bg-brand-100 font-semibold text-ink" : "text-ink/70 hover:bg-brand-50 hover:text-ink"}`}
                    >
                      <Image
                        src={language.flag}
                        alt={language.label}
                        width={16}
                        height={16}
                        className="h-4 w-4 shrink-0 rounded-sm object-cover"
                      />
                      {language.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="h-3 w-px bg-line-strong" aria-hidden="true" />
          {isCustomer && authUser ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="kx-header-utility inline-flex h-7 max-w-[9rem] items-center gap-1.5 rounded-sm px-2"
              >
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-ink text-[9px] font-bold text-white">
                  {authUser.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="truncate">{authUser.name}</span>
                <ChevronDown
                  className={`h-[7px] w-[7px] shrink-0 text-ink/40 transition-transform ${accountOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-header-menu w-52 origin-top-right pt-1"
                >
                  <div className="rounded-sm border border-line-strong bg-white p-1 shadow-card">
                    <div className="mb-1 rounded-sm bg-brand-50 px-2.5 py-1.5">
                      <p className="truncate text-xs font-bold text-ink">
                        {authUser.name}
                      </p>
                      <p className="truncate text-[11px] text-ink/60">
                        {authUser.email || authUser.phone}
                      </p>
                    </div>
                    {customerLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs text-ink/75 hover:bg-brand-50 hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="mt-1 border-t border-line pt-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-xs font-semibold text-ink/75 hover:bg-brand-50 hover:text-ink"
                      >
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href={localePath(locale, CLIENT_ROUTES.login)}
                className="kx-header-utility rounded-sm px-2 py-1"
              >
                {t("login")}
              </Link>
              <Link
                href={localePath(locale, CLIENT_ROUTES.register)}
                className="kx-btn-primary-sm"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </div>{" "}
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center gap-4 overflow-visible">
          <Link
            href={localePath(locale, CLIENT_ROUTES.home)}
            className="inline-flex shrink-0 items-center gap-2"
            aria-label={t("home_aria")}
          >
            {" "}
            <img
              src={brandLogo}
              alt={brandTitle}
              width={36}
              height={36}
              className="h-9 w-9 rounded-sm border border-line-strong object-cover"
            />
            <span className="hidden max-w-[10rem] truncate text-sm font-extrabold tracking-tight text-ink sm:block md:max-w-[14rem]">
              {brandTitle}
            </span>
          </Link>
          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-visible xl:flex"
            aria-label={t("aria_main")}
          >
            {mainMenu.map((item) => {
              const isActive = isMenuItemActive(item.url);
              return item.children.length === 0 ? (
                <Link
                  key={item.id}
                  href={localizeMenuUrl(locale, item.url)}
                  className={`kx-nav-link ${isActive ? "kx-nav-link--active" : ""}`}
                >
                  {item.name}
                </Link>
              ) : (
                <div
                  key={item.id}
                  className="relative shrink-0"
                  onMouseEnter={() => setOpenDropdownId(item.id)}
                  onMouseLeave={() =>
                    setOpenDropdownId((current) =>
                      current === item.id ? null : current,
                    )
                  }
                >
                  <Link
                    href={localizeMenuUrl(locale, item.url)}
                    aria-expanded={openDropdownId === item.id}
                    aria-haspopup="menu"
                    className={`kx-nav-link inline-flex items-center gap-1 ${isActive || item.children.some((c) => isMenuItemActive(c.url)) ? "kx-nav-link--active" : ""}`}
                  >
                    {item.name}
                    <ChevronDown
                      className={`h-2 w-2 text-ink/40 transition-transform ${openDropdownId === item.id ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </Link>
                  {openDropdownId === item.id && (
                    <div
                      role="menu"
                      className="absolute left-0 top-full z-header-menu w-52 pt-1"
                    >
                      <div className="rounded-sm border border-line-strong bg-white p-1 shadow-card">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={localizeMenuUrl(locale, child.url)}
                            role="menuitem"
                            className={`flex items-center rounded-sm px-2.5 py-2 text-sm ${isMenuItemActive(child.url) ? "bg-brand-100 font-semibold text-ink" : "text-ink/75 hover:bg-brand-50 hover:text-ink"}`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link
              href={localePath(locale, CLIENT_ROUTES.routesIndex)}
              className="kx-btn-primary hidden rounded-sm px-4 py-2 text-sm sm:inline-flex"
            >
              <Ticket className="h-4 w-4" aria-hidden="true" />
              <span className="hidden md:inline">{tRoutes("cta_button")}</span>
              <span className="md:hidden">{t("search_bus")}</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="client-mobile-nav"
              aria-label={t("open_menu")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong bg-white text-ink hover:bg-brand-50 xl:hidden"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>{" "}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-drawer min-h-dvh bg-ink/50 xl:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        id="client-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label={t("aria_mobile")}
        className={`fixed right-0 top-0 z-modal flex min-h-dvh w-[88vw] max-w-sm flex-col overflow-y-auto border-l border-line-strong bg-white shadow-card transition-transform duration-300 xl:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line-strong px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {" "}
            <img
              src={brandLogo}
              alt={brandTitle}
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-sm border border-line-strong object-cover"
            />
            <p className="truncate text-sm font-bold tracking-tight text-ink">
              {brandTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label={t("close_menu")}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-line-strong text-ink/60 hover:bg-brand-50 hover:text-ink"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <nav className="space-y-0.5" aria-label={t("aria_mobile")}>
            {mainMenu.map((item) => {
              const isActive = isMenuItemActive(item.url);
              return item.children.length === 0 ? (
                <Link
                  key={item.id}
                  href={localizeMenuUrl(locale, item.url)}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between rounded-sm px-3 py-2.5 text-sm font-semibold ${isActive ? "bg-brand-100 text-ink" : "text-ink/80 hover:bg-brand-50 hover:text-ink"}`}
                >
                  {item.name}
                </Link>
              ) : (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccordionId((current) =>
                        current === item.id ? null : item.id,
                      )
                    }
                    aria-expanded={openAccordionId === item.id}
                    className={`flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-left text-sm font-semibold ${isActive || item.children.some((c) => isMenuItemActive(c.url)) ? "bg-brand-100 text-ink" : "text-ink/80 hover:bg-brand-50 hover:text-ink"}`}
                  >
                    {item.name}
                    <ChevronDown
                      className={`h-3 w-3 text-ink/40 transition-transform ${openAccordionId === item.id ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {openAccordionId === item.id && (
                    <div className="mt-0.5 space-y-0.5 rounded-sm border border-line bg-brand-50 p-1.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={localizeMenuUrl(locale, child.url)}
                          onClick={() => setMobileOpen(false)}
                          className={`block rounded-sm px-2.5 py-2 text-sm ${isMenuItemActive(child.url) ? "bg-white font-semibold text-ink" : "text-ink/75 hover:bg-white hover:text-ink"}`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="mt-4">
            <Link
              href={localePath(locale, CLIENT_ROUTES.routesIndex)}
              onClick={() => setMobileOpen(false)}
              className="kx-btn-primary flex w-full items-center justify-center gap-2 rounded-sm py-3 text-sm"
            >
              <Ticket className="h-4 w-4" aria-hidden="true" />
              {tRoutes("cta_button")}
            </Link>
          </div>
          {!isCustomer && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                href={localePath(locale, CLIENT_ROUTES.login)}
                className="rounded-sm border border-line-strong py-2.5 text-center text-sm font-semibold text-ink hover:bg-brand-50"
              >
                {t("login")}
              </Link>
              <Link
                href={localePath(locale, CLIENT_ROUTES.register)}
                className="kx-btn-primary rounded-sm py-2.5 text-center text-sm"
              >
                {t("register")}
              </Link>
            </div>
          )}
          {isCustomer && authUser && (
            <div className="mt-3 rounded-sm border border-line-strong bg-brand-50 p-3">
              <div className="mb-2 flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-ink text-sm font-bold text-white">
                  {authUser.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">
                    {authUser.name}
                  </p>
                  <p className="truncate text-xs text-ink/60">
                    {authUser.email || authUser.phone}
                  </p>
                </div>
              </div>
              {customerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-ink/80 hover:bg-white hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-line pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm font-semibold text-ink/75 hover:bg-white hover:text-ink"
                >
                  {t("logout")}
                </button>
              </div>
            </div>
          )}
          <div className="mt-3 lg:hidden">
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-ink/40">
              {t("language")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {languageOptions.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => switchLocale(language.code)}
                  className={`flex items-center justify-center gap-2 rounded-sm border py-2 text-sm font-semibold ${locale === language.code ? "border-ink bg-brand-500 text-ink" : "border-line-strong text-ink/75 hover:bg-brand-50 hover:text-ink"}`}
                >
                  <Image
                    src={language.flag}
                    alt={language.label}
                    width={16}
                    height={16}
                    className="h-4 w-4 shrink-0 rounded-sm object-cover"
                  />
                  {language.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        {hotline && (
          <div className="border-t border-line-strong px-3 py-3 lg:hidden">
            <a
              href={`tel:${hotlineTel}`}
              className="flex items-center justify-center gap-2 rounded-sm border border-line-strong bg-brand-50 py-2.5 text-sm font-bold text-ink hover:bg-brand-100"
            >
              <Phone className="h-3.5 w-3.5 text-ink/50" aria-hidden="true" />
              {hotline}
            </a>
          </div>
        )}
      </aside>
    </header>
  );
}
