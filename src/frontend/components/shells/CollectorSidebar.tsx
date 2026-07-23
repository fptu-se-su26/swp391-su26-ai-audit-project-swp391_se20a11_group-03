"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { authApi, fetchAccountSummary, toFrontendRole, userApi, type AccountSummary } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

const STORAGE_KEY = "bidzone-sidebar-collapsed";

/** Global event used by Messages to refresh the unread badge in the sidebar. */
export const UNREAD_REFRESH_EVENT = "bidzone:unread-refresh";

type NavItem = { labelKey: string; href: string; icon: string; badge?: string };
type NavGroup = { titleKey: string; items: NavItem[]; sellerOnly?: boolean };

const NAV_GROUPS: NavGroup[] = [
  {
    titleKey: "auction",
    items: [
      { labelKey: "dashboard", href: "/dashboard", icon: "dashboard" },
      { labelKey: "watchlist", href: "/watchlist", icon: "visibility" },
      { labelKey: "wonItems", href: "/won-items", icon: "emoji_events" },
      { labelKey: "orders", href: "/orders", icon: "local_shipping" },
      { labelKey: "messages", href: "/messages", icon: "chat" },
    ],
  },
  {
    titleKey: "account",
    items: [
      { labelKey: "profile", href: "/profile", icon: "account_circle" },
      { labelKey: "security", href: "/security", icon: "shield_lock" },
      { labelKey: "premium", href: "/premium", icon: "workspace_premium", badge: "VIP" },
    ],
  },
  {
    titleKey: "consignment",
    sellerOnly: true,
    items: [
      { labelKey: "inventory", href: "/inventory", icon: "inventory_2" },
      { labelKey: "postItem", href: "/post-item", icon: "add_box" },
      { labelKey: "earnings", href: "/earnings", icon: "payments" },
    ],
  },
];

export default function CollectorSidebar() {
  const t = useTranslations("sidebar.collector");
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const {
    data: account,
    loading: accountLoading,
    error: accountError,
    reload: reloadAccount,
  } = useApiData<AccountSummary | null>(fetchAccountSummary, null);
  const role = toFrontendRole(account?.profile.roleName ?? null);
  const navGroups = NAV_GROUPS.filter(
    (group) => !group.sellerOnly || role === "seller",
  );
  const initials = account?.profile.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function refreshUnread() {
      try {
        const conversations = await userApi.myConversations();
        if (!cancelled) {
          setUnreadMessages(
            conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
          );
        }
      } catch {
        /* No signed-in user or backend is unavailable. */
      }
    }

    void refreshUnread();
    const interval = setInterval(() => void refreshUnread(), 30_000);
    window.addEventListener(UNREAD_REFRESH_EVENT, refreshUnread);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener(UNREAD_REFRESH_EVENT, refreshUnread);
    };
  }, [pathname]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  function isItemActive(href: string) {
    return pathname === href ||
      (href === "/profile" && pathname === "/wallet") ||
      (href === "/security" && pathname === "/kyc");
  }

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col overflow-x-hidden border-r border-white/10 bg-[var(--luxora-bg-elevated)] transition-[width] duration-200 md:flex ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <div
        className={`flex items-center px-4 py-5 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <BidZoneLogo className="h-9 w-auto" />
          </Link>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? t("expandMenu") : t("collapseMenu")}
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white/40 transition hover:bg-white/5 hover:text-white"
        >
          <span className="material-symbols-outlined text-lg">
            {collapsed ? "chevron_right" : "chevron_left"}
          </span>
        </button>
      </div>

      {!collapsed && (
        <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--luxora-gold)]/15 text-xs font-bold text-[var(--luxora-gold-light)]">
              {initials || "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {account?.profile.fullName ??
                  (accountLoading ? t("loading") : t("loadError"))}
              </p>
              <p className="text-[11px] capitalize text-white/40">
                {account?.profile.roleName ?? ""}
              </p>
            </div>
          </div>
          {accountError && !accountLoading && (
            <button
              type="button"
              onClick={() => void reloadAccount()}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              {t("retry")}
            </button>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/5 px-2.5 py-2">
              <p className="text-[10px] text-white/40">{t("balance")}</p>
              <p className="text-xs font-semibold text-[var(--luxora-gold-light)]">
                {account
                  ? `${account.wallet.availableBalance.toLocaleString("vi-VN")} ₫`
                  : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-white/5 px-2.5 py-2">
              <p className="text-[10px] text-white/40">{t("deposit")}</p>
              <p className="text-xs font-semibold">
                {account
                  ? `${account.wallet.holdBalance.toLocaleString("vi-VN")} ₫`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav
        className={`custom-scrollbar flex-1 overflow-y-auto pb-4 ${
          collapsed ? "px-2" : "px-3"
        }`}
      >
        {navGroups.map((group) => (
          <div key={group.titleKey} className={collapsed ? "mb-3" : "mb-5"}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                {t(`groups.${group.titleKey}`)}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isItemActive(item.href);
                const badge =
                  item.href === "/messages" && unreadMessages > 0
                    ? unreadMessages > 99
                      ? "99+"
                      : String(unreadMessages)
                    : item.badge;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? t(`items.${item.labelKey}`) : undefined}
                    aria-label={collapsed ? t(`items.${item.labelKey}`) : undefined}
                    className={`relative flex items-center rounded-xl text-sm transition-colors ${
                      collapsed
                        ? "mx-auto size-11 justify-center p-0"
                        : "gap-3 px-3 py-2.5"
                    } ${
                      active
                        ? "bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold-light)]"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined block text-xl leading-none">
                      {item.icon}
                    </span>
                    {collapsed && badge && badge !== "VIP" && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d89716] px-1 font-sans text-[9px] font-bold leading-none text-[#211500] ring-2 ring-[var(--luxora-bg-elevated)]">
                        {badge}
                      </span>
                    )}
                    {collapsed && badge === "VIP" && (
                      <span
                        aria-hidden="true"
                        className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-[#d89716] ring-2 ring-[var(--luxora-bg-elevated)]"
                      />
                    )}
                    {!collapsed && (
                      <span className="flex-1 truncate">{t(`items.${item.labelKey}`)}</span>
                    )}
                    {!collapsed && badge && (
                      <span className="rounded-full bg-[var(--luxora-gold)] px-1.5 py-0.5 text-[10px] font-semibold text-black">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={`flex flex-col gap-1 border-t border-white/10 py-4 ${
          collapsed ? "items-center px-2" : "px-3"
        }`}
      >
        {!collapsed && <div className="px-3 pb-2"><LanguageSwitcher /></div>}
        <Link
          href="/wallet"
          title={collapsed ? t("topUp") : undefined}
          aria-label={collapsed ? t("topUp") : undefined}
          className={`flex items-center rounded-xl text-sm text-white/60 transition hover:bg-white/5 hover:text-white ${
            collapsed ? "size-11 justify-center p-0" : "gap-3 px-3 py-2.5"
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            add_circle
          </span>
          {!collapsed && <span>{t("topUp")}</span>}
        </Link>
        <Link
          href="/auth"
          onClick={() => authApi.logout()}
          title={collapsed ? t("logout") : undefined}
          aria-label={collapsed ? t("logout") : undefined}
          className={`flex items-center rounded-xl text-sm text-white/60 transition hover:bg-white/5 hover:text-white ${
            collapsed ? "size-11 justify-center p-0" : "gap-3 px-3 py-2.5"
          }`}
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          {!collapsed && <span>{t("logout")}</span>}
        </Link>
      </div>
    </aside>
  );
}
