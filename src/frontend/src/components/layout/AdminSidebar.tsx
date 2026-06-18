"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/I18nProvider";
import { clearStoredAuth } from "@/lib/apiClient";
import { getStoredUser, getUserDisplayName } from "@/lib/userSession";

const NAV_ITEMS = [
  { href: "/admin/bidding-rules", icon: "gavel", label: "Luật đấu giá" },
  { href: "/admin/financial-policies", icon: "account_balance", label: "Chính sách tài chính" },
  { href: "/admin/users", icon: "manage_accounts", label: "Vai trò & quyền" },
  { href: "/admin/categories", icon: "category", label: "Danh mục & thuộc tính" },
  { href: "/admin/auction-history", icon: "history_edu", label: "Lịch sử đấu giá" },
  { href: "/admin/revenue", icon: "payments", label: "Thống kê doanh thu" },
  { href: "/admin/audit-logs", icon: "fact_check", label: "Nhật ký hệ thống" },
  { href: "/admin/disputes", icon: "balance", label: "Tranh chấp" },
  { href: "/admin/notifications", icon: "campaign", label: "Thông báo" },
  { href: "/admin/reports", icon: "assessment", label: "Xuất báo cáo" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("adminSidebar");
  const adminName = getUserDisplayName(getStoredUser());

  const handleLogout = () => {
    clearStoredAuth();
    router.push("/");
  };

  return (
    <aside className="h-screen w-80 fixed left-0 top-0 flex flex-col bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
      <div className="flex flex-col h-full py-lg px-md">
        {/* Header */}
        <div className="mb-xl px-sm">
          <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-primary">{t("appName")}</h1>
          <p className="font-label-md text-label-md text-on-surface-variant">{t("role")}</p>
        </div>

        {/* Profile */}
        <Link href="/" className="flex items-center gap-sm rounded-lg px-sm py-xs mb-lg hover:bg-surface-container-high transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-label-md text-label-md text-on-surface">{adminName}</span>
            <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest">{t("activeStatus")}</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-xs overflow-y-auto custom-scrollbar">
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
                <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="mt-lg px-sm">
          <Link
            href="/admin/auction-history"
            className="w-full bg-secondary text-on-secondary font-label-md text-label-md py-md rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-sm"
          >
            <span className="material-symbols-outlined">visibility</span>
            {t("liveMonitor")}
          </Link>
        </div>

        {/* Footer nav */}
        <div className="mt-lg pt-lg border-t border-outline-variant/30 flex flex-col gap-xs">
          <a className="flex items-center gap-base text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all duration-200 px-md py-sm rounded-lg" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">{t("systemSettings")}</span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-base text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-all duration-200 px-md py-sm rounded-lg text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">{t("logout")}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
