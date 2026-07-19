"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { authApi } from "@/lib/api";

const NAV_ITEMS = [
  { labelKey: "orders", href: "/staff/orders", icon: "local_shipping" },
  { labelKey: "approvals", href: "/staff/approvals", icon: "fact_check" },
  { labelKey: "kycReview", href: "/staff/kyc-review", icon: "badge" },
  { labelKey: "supportInbox", href: "/staff/support", icon: "inbox" },
];

export default function StaffSidebar() {
  const t = useTranslations("sidebar.staff");
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-[var(--luxora-bg-elevated)] md:flex">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/" className="inline-flex items-center" aria-label="BidZone">
          <BidZoneLogo className="h-9 w-auto" />
        </Link>
        <p className="text-xs text-white/40">{t("workspace")}</p>
      </div>

      <div className="mx-4 mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold)]">
          <span className="material-symbols-outlined">support_agent</span>
        </span>
        <div>
          <p className="text-sm font-semibold">{t("staff")}</p>
          <p className="text-[11px] text-green-300">{t("online")}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold-light)]"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              {t(`items.${item.labelKey}`)}
            </Link>
          );
        })}
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
