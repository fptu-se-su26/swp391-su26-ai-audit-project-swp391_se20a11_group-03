"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearStoredAuth } from "@/lib/apiClient";
import { getWatchlistIds } from "@/lib/watchlist";
import {
  StoredUser,
  getStoredUser,
  isAdmin,
  isSeller,
  notifyStoredUserChanged,
  subscribeStoredUser,
} from "@/lib/userSession";
import { useTranslations } from "@/i18n/I18nProvider";
import SidebarMenuItem from "./SidebarMenuItem";
import SidebarUserCard from "./SidebarUserCard";
import NotificationBell from "@/components/features/NotificationBell";
import BrandLogo from "@/components/ui/BrandLogo";

type MenuItem = readonly [href: string, icon: string, label: string];

export default function Sidebar() {
  const tSidebar = useTranslations("sidebar");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  const collectorMenu = useMemo(
    (): MenuItem[] =>
      [
        ["/dashboard", "space_dashboard", tCommon("dashboard")],
        ["/messages", "forum", tSidebar("messages")],
        ["/watchlist", "favorite", tSidebar("watchlist")],
        ["/wallet", "account_balance_wallet", tSidebar("myWallet")],
        ["/profile", "manage_accounts", tSidebar("accountSettings")],
      ],
    [tSidebar, tCommon],
  );

  const sellerMenu = useMemo(
    (): MenuItem[] =>
      [
        ["/post-item", "add_box", tSidebar("postNewItem")],
        ["/inventory", "gavel", tSidebar("myAuctions")],
      ],
    [tSidebar],
  );

  const showSellerPortal = isSeller(user) || isAdmin(user);

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    return subscribeStoredUser(sync);
  }, []);

  const logout = () => {
    clearStoredAuth();
    notifyStoredUserChanged();
    router.push("/");
  };

  const renderMenuItems = (items: MenuItem[]) =>
    items.map(([href, icon, label]) => (
      <SidebarMenuItem
        key={href}
        href={href}
        icon={icon}
        label={label}
        active={pathname === href || pathname.startsWith(href + "/")}
        badge={href === "/watchlist" ? getWatchlistIds().length : undefined}
      />
    ));

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col overflow-hidden border-r border-white/[.08] bg-[#080706] px-4 py-5 text-white shadow-[24px_0_70px_rgba(0,0,0,.4)] md:flex">
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#d4aa61]/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 right-0 h-56 w-56 rounded-full bg-[#c49a35]/12 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[.045] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:34px_34px]" />

      <div className="relative mb-5 flex items-center justify-between gap-3 px-1">
        <BrandLogo inverted />
        <NotificationBell
          menuAlign="start"
          className="shrink-0 rounded-full border border-white/10 bg-white/[.04] p-2 text-[#cdd7e1] shadow-inner shadow-white/5 transition hover:border-[#d2ad55]/40 hover:text-[#f3d88e]"
        />
      </div>

      <SidebarUserCard user={user} />

      <div className="custom-scrollbar relative mt-6 flex-1 space-y-4 overflow-y-auto pr-1">
        <nav className="space-y-1" aria-label="Collector dashboard">
          <p className="mb-3 px-3 text-[9px] font-black uppercase tracking-[.24em] text-[#71879a]">
            {tSidebar("yourSpace")}
          </p>
          {renderMenuItems(collectorMenu)}
        </nav>

        {showSellerPortal && (
          <nav className="space-y-1" aria-label="Seller portal">
            <p className="mb-3 px-3 text-[9px] font-black uppercase tracking-[.24em] text-[#71879a]">
              {tSidebar("sellerPortal")}
            </p>
            {renderMenuItems(sellerMenu)}
          </nav>
        )}
      </div>

      <div className="relative mt-4 border-t border-white/[.08] pt-4">
        <Link
          href="/wallet"
          className="mb-3 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#b8860b] via-[#d7b55c] to-[#f0d98b] px-4 py-3 text-xs font-black text-[#06111f] shadow-[0_16px_34px_rgba(199,160,62,.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(199,160,62,.32)]"
        >
          <span className="material-symbols-outlined text-[18px]">add_card</span>
          {tSidebar("depositFunds")}
        </Link>
        <Link
          href="/support"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
            pathname === "/support" || pathname.startsWith("/support/")
              ? "bg-white/[.08] text-[#f3d88e]"
              : "text-[#9caec0] hover:bg-white/[.06] hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">help_center</span>
          {tCommon("helpCenter")}
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#9caec0] transition hover:bg-[#b94a45]/10 hover:text-[#ef8d87]"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          {tCommon("logout")}
        </button>
      </div>
    </aside>
  );
}
