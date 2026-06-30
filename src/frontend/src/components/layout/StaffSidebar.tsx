"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/i18n/I18nProvider";
import BrandLogo from "@/components/ui/BrandLogo";

const NAV_ITEMS = [
  { href: "/staff/approvals", icon: "task_alt", labelKey: "itemApprovals" },
  { href: "/staff/withdrawals", icon: "payments", labelKey: "withdrawals" },
  { href: "/staff/kyc-review", icon: "badge", labelKey: "kycReview" },
  { href: "/staff/support", icon: "support_agent", labelKey: "supportInbox" },
];

export default function StaffSidebar() {
  const pathname = usePathname();
  const t = useTranslations("staffSidebar");

  return (
    <aside className="h-screen w-72 fixed left-0 top-0 flex flex-col bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
      <div className="flex flex-col h-full py-lg px-md">
        <div className="mb-xl px-sm">
          <BrandLogo />
          <p className="font-label-md text-label-md text-on-surface-variant">{t("role")}</p>
        </div>

        <Link href="/" className="flex items-center gap-sm rounded-lg px-sm py-xs mb-lg hover:bg-surface-container-high transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container">manage_accounts</span>
          </div>
          <div>
            <span className="font-label-md text-label-md text-on-surface">{t("staffMember")}</span>
            <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest">{t("onDuty")}</span>
          </div>
        </Link>

        <nav className="flex-1 flex flex-col gap-xs">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-base rounded-lg px-md py-sm transition-all duration-200 ${
                  active
                    ? "bg-primary-container text-on-primary-container shadow-sm"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label-md text-label-md">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-lg border-t border-outline-variant/30 flex flex-col gap-xs">
          <Link href="/auth" className="flex items-center gap-base text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-all px-md py-sm rounded-lg">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">{t("logout")}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
