"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearStoredAuth } from "@/lib/apiClient";
import { getWatchlistIds, refreshWatchlistIds, subscribeWatchlist } from "@/lib/watchlist";
import {
  StoredUser,
  getRoleLabelKey,
  getStoredUser,
  getUserDisplayName,
  getUserInitials,
  notifyStoredUserChanged,
  subscribeStoredUser,
  isSeller,
} from "@/lib/userSession";
import { useTranslations } from "@/i18n/I18nProvider";
import BrandLogo from "@/components/ui/BrandLogo";
import { useEffect, useState } from "react";

const MY_AUCTIONS = [
  { href: "/dashboard", icon: "account_balance_wallet", labelKey: "myActiveBids" },
  { href: "/messages", icon: "chat", labelKey: "messages" },
  { href: "/watchlist", icon: "visibility", labelKey: "watchlist" },
  { href: "/won-items", icon: "history", labelKey: "wonItems" },
];

const ACCOUNT_SETTINGS = [
  { href: "/profile", icon: "person", labelKey: "personalInfo" },
  { href: "/security", icon: "shield", labelKey: "security" },
  { href: "/wallet", icon: "account_balance", labelKey: "myWallet" },
  { href: "/kyc", icon: "verified_user", labelKey: "kycVerification" },
];

const SELLER_PORTAL = [
  { href: "/inventory", icon: "inventory_2", labelKey: "myInventory" },
  { href: "/post-item", icon: "add_circle", labelKey: "postNewItem" },
  { href: "/earnings", icon: "account_balance_wallet", labelKey: "earningsPayouts" },
];

export default function CollectorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const tSidebar = useTranslations("sidebar");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("roles");
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [watchlistCount, setWatchlistCount] = useState(0);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    const syncWatchlist = () => setWatchlistCount(getWatchlistIds().length);

    syncUser();
    syncWatchlist();
    refreshWatchlistIds().then(syncWatchlist);

    const unsubscribeUser = subscribeStoredUser(syncUser);
    const unsubscribeWatchlist = subscribeWatchlist(syncWatchlist);

    return () => {
      unsubscribeUser();
      unsubscribeWatchlist();
    };
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const displayName = getUserDisplayName(currentUser);
  const initials = getUserInitials(currentUser);
  const roleLabel = tRoles(getRoleLabelKey(currentUser));
  const userIsSeller = isSeller(currentUser);

  const handleLogout = () => {
    clearStoredAuth();
    notifyStoredUserChanged();
    refreshWatchlistIds();
    router.push("/");
  };

  const NavLink = ({
    href,
    icon,
    labelKey,
    badge,
  }: {
    href: string;
    icon: string;
    labelKey: string;
    badge?: string;
  }) => {
    const active = isActive(href);
    const computedBadge = href === "/watchlist" ? String(watchlistCount) : badge;
    const label = tSidebar(labelKey);

    return (
      <li>
        <Link
          href={href}
          className={`group flex items-center justify-between px-4 py-3 transition-colors ${
            active
              ? "border-r-4 border-secondary bg-surface-container-high font-bold text-primary"
              : "text-on-surface-variant hover:bg-surface-variant"
          }`}
        >
          <div className="flex items-center gap-sm">
            <span
              className={`material-symbols-outlined transition-colors ${active ? "text-secondary" : "text-outline group-hover:text-primary"}`}
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className="font-label-md text-label-md">{label}</span>
          </div>
          {computedBadge && Number(computedBadge) > 0 && (
            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-label-sm text-on-secondary">
              {computedBadge}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      <nav className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-outline-variant bg-surface-container-low shadow-md md:flex">
        <div className="border-b border-outline-variant p-lg">
          <div className="flex flex-col items-center">
            <Link
              href="/profile"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-2xl font-bold uppercase text-on-primary-container soft-shadow transition-colors hover:bg-primary-fixed-dim"
              aria-label={tSidebar("personalInfo")}
            >
              {initials}
            </Link>
            <Link
              href="/profile"
              className="mt-sm max-w-full text-center font-headline-sm text-headline-sm text-primary transition-colors hover:text-secondary"
            >
              {displayName}
            </Link>
            <p className="mt-xs font-label-sm text-label-sm text-secondary">{roleLabel}</p>
            {currentUser?.email && (
              <p className="mt-xs max-w-full truncate text-center text-xs text-on-surface-variant">
                {currentUser.email}
              </p>
            )}
          </div>
          <Link
            href="/"
            className="mt-md flex items-center justify-center gap-xs rounded-lg border border-outline-variant bg-surface px-4 py-2 font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-high hover:text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            {tCommon("backToHome")}
          </Link>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto py-md">
          <div className="px-4 py-2">
            <p className="mb-sm font-label-sm text-label-sm uppercase tracking-wider text-outline">{tSidebar("myAuctions")}</p>
            <ul className="space-y-1">
              {MY_AUCTIONS.map((item) => (
                <NavLink key={item.href} href={item.href} icon={item.icon} labelKey={item.labelKey} />
              ))}
            </ul>
          </div>

          <div className="px-4 py-4">
            <p className="mb-sm font-label-sm text-label-sm uppercase tracking-wider text-outline">{tSidebar("accountSettings")}</p>
            <ul className="space-y-1">
              {ACCOUNT_SETTINGS.map((item) => (
                <NavLink key={item.href} href={item.href} icon={item.icon} labelKey={item.labelKey} />
              ))}
            </ul>
          </div>

          {userIsSeller && (
            <div className="px-4 py-4">
              <p className="mb-sm font-label-sm text-label-sm uppercase tracking-wider text-outline">{tSidebar("sellerPortal")}</p>
              <ul className="space-y-1">
                {SELLER_PORTAL.map((item) => (
                  <NavLink key={item.href} href={item.href} icon={item.icon} labelKey={item.labelKey} />
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-outline-variant p-md">
          <Link
            href="/wallet"
            className="mb-md block w-full rounded-lg bg-secondary py-sm text-center font-label-md text-label-md text-on-secondary transition-colors hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed"
          >
            {tSidebar("depositFunds")}
          </Link>
          <ul className="space-y-sm">
            <li>
              <a className="group flex items-center gap-sm rounded-md px-4 py-2 text-on-surface-variant transition-colors hover:bg-surface-variant" href="#">
                <span className="material-symbols-outlined text-[20px] text-outline group-hover:text-primary">help</span>
                <span className="font-label-sm text-label-sm">{tCommon("helpCenter")}</span>
              </a>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="group flex w-full items-center gap-sm rounded-md px-4 py-2 text-left text-on-surface-variant transition-colors hover:bg-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px] text-outline group-hover:text-error">logout</span>
                <span className="font-label-sm text-label-sm group-hover:text-error">{tCommon("logout")}</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-surface px-margin-mobile py-sm shadow-sm md:hidden">
        <BrandLogo />
        <Link
          href="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-sm font-bold uppercase text-on-primary-container"
        >
          {initials}
        </Link>
      </header>

    </>
  );
}
