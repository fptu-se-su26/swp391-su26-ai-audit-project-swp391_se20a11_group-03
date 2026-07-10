"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageSwitcher from "@/components/features/LanguageSwitcher";
import { displayFont } from "./theme";
import { OutlineButton } from "./primitives";
import { useTranslations } from "@/i18n/I18nProvider";
import {
  StoredUser,
  getStoredUser,
  getUserInitials,
  isAdmin,
  subscribeStoredUser,
} from "@/lib/userSession";
import { ADMIN_HOME } from "@/lib/roleRouting";

function Logo() {
  return (
    <Link href="/luxe" className="flex items-center gap-4" aria-label="Luxora Auction House">
      <span className={`${displayFont} text-4xl font-semibold leading-none tracking-[-0.08em] text-[#ddb76a]`}>LA</span>
      <span className="leading-none">
        <span className={`${displayFont} block text-[22px] font-semibold tracking-[0.34em] text-[#f5ead9]`}>LUXORA</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.42em] text-[#c7b79c]">Auction House</span>
      </span>
    </Link>
  );
}

export default function LuxeNav() {
  const t = useTranslations("luxe");
  const tCommon = useTranslations("common");
  const [user, setUser] = useState<StoredUser | null>(null);

  const navItems = [
    { label: t("navExplore"), href: "/browse" },
    { label: t("navAuction"), href: "/live" },
    { label: t("navCollection"), href: "/storefront" },
    { label: t("navUpcoming"), href: "/upcoming" },
    { label: t("navAbout"), href: "#about" },
  ] as const;

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    return subscribeStoredUser(sync);
  }, []);

  const accountHref = user ? (isAdmin(user) ? ADMIN_HOME : "/dashboard") : "/auth";

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#060606]/88 px-5 backdrop-blur-xl md:px-12">
      <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between gap-6">
        <Logo />
        <div className="hidden h-full items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-full items-center border-b-2 border-transparent px-1 text-sm font-semibold uppercase tracking-[0.12em] text-[#e6ded2] transition hover:border-[#d4aa61] hover:text-[#d4aa61]"
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/dashboard"
              className="flex h-full items-center border-b-2 border-transparent px-1 text-sm font-semibold uppercase tracking-[0.12em] text-[#d4aa61] transition hover:border-[#d4aa61]"
            >
              {t("dashboard")}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/browse"
            className="hidden text-xs font-bold uppercase tracking-[0.12em] text-[#d4aa61] transition hover:text-[#efcf88] md:inline-flex"
          >
            {t("marketplace")}
          </Link>
          <LanguageSwitcher />
          {user ? (
            <Link
              href={accountHref}
              className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] text-xs font-bold text-[#100d08] shadow-[0_12px_28px_rgba(201,154,75,.28)] transition hover:brightness-110"
              aria-label={tCommon("account")}
              title={tCommon("account")}
            >
              {getUserInitials(user)}
            </Link>
          ) : (
            <>
              <OutlineButton href="/auth">{tCommon("login")}</OutlineButton>
              <Link
                href="/auth?mode=signup"
                className="hidden min-h-12 items-center rounded bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-7 text-xs font-extrabold uppercase tracking-[0.14em] text-[#100d08] transition hover:brightness-110 md:inline-flex"
              >
                {tCommon("register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
