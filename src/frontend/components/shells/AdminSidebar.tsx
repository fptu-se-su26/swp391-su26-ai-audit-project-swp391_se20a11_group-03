"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { authApi } from "@/lib/api";

type AdminNavItem = {
  href: string;
  icon: string;
  labelKey: string;
};

type AdminNavGroup = {
  titleKey: string;
  items: AdminNavItem[];
};

const ADMIN_OVERVIEW_HREF = "/admin/dashboard";

const NAV_GROUPS: AdminNavGroup[] = [
  {
    titleKey: "operations",
    items: [
      { href: "/admin/approvals", icon: "task_alt", labelKey: "productApprovals" },
      { href: "/admin/kyc-review", icon: "badge", labelKey: "kycReview" },
      { href: "/admin/withdrawals", icon: "payments", labelKey: "withdrawals" },
    ],
  },
  {
    titleKey: "auctions",
    items: [
      { href: "/admin/events", icon: "event", labelKey: "events" },
      { href: "/admin/auction-history", icon: "live_tv", labelKey: "allSessions" },
      { href: "/admin/sales-history", icon: "receipt_long", labelKey: "salesHistory" },
    ],
  },
  {
    titleKey: "financeLegal",
    items: [
      { href: "/admin/revenue", icon: "trending_up", labelKey: "revenue" },
      { href: "/admin/contracts", icon: "contract", labelKey: "contracts" },
    ],
  },
  {
    titleKey: "system",
    items: [
      { href: "/admin/users", icon: "manage_accounts", labelKey: "users" },
      { href: "/admin/categories", icon: "category", labelKey: "categories" },
      { href: "/admin/bidding-rules", icon: "gavel", labelKey: "biddingRules" },
      { href: "/admin/fraud-alerts", icon: "shield_lock", labelKey: "fraudAlerts" },
      { href: "/admin/fraud-settings", icon: "tune", labelKey: "fraudSettings" },
      { href: "/admin/audit-logs", icon: "fact_check", labelKey: "auditLogs" },
    ],
  },
];

function isNavActive(pathname: string, href: string) {
  const [path, query] = href.split("?");
  if (pathname !== path) return false;

  if (!query) {
    return true;
  }

  return false;
}

export default function AdminSidebar() {
  const t = useTranslations("sidebar.admin");
  const pathname = usePathname();
  const onDashboard = pathname === ADMIN_OVERVIEW_HREF || pathname === "/admin";

  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 flex-col border-r border-white/10 bg-[var(--luxora-bg-elevated)] md:flex">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/" className="inline-flex items-center" aria-label="BidZone">
          <BidZoneLogo className="h-9 w-auto" />
        </Link>
        <p className="text-xs text-white/40">{t("controlCenter")}</p>
      </div>

      <div className="mx-4 mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold)]">
          <span className="material-symbols-outlined">shield_person</span>
        </span>
        <div>
          <p className="text-sm font-semibold">{t("systemAdmin")}</p>
          <p className="text-[11px] text-green-300">{t("active")}</p>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 space-y-5 overflow-y-auto px-4 py-6">
        <div>
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            {t("overview")}
          </p>
          <Link
            href={ADMIN_OVERVIEW_HREF}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              onDashboard
                ? "bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold-light)]"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={onDashboard ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              dashboard
            </span>
            {t("overview")}
          </Link>
        </div>

        {NAV_GROUPS.map((group) => (
          <div key={group.titleKey}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--luxora-gold)]/70">
              {t(`groups.${group.titleKey}`)}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold-light)]"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {item.icon}
                    </span>
                    {t(`items.${item.labelKey}`)}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-3 px-3"><LanguageSwitcher /></div>
        <Link
          href="/auth"
          onClick={() => authApi.logout()}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          {t("logout")}
        </Link>
      </div>
    </aside>
  );
}
