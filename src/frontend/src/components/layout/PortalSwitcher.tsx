"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ADMIN_NAV_GROUPS, ADMIN_OVERVIEW_HREF } from "@/lib/adminNav";
import { useTranslations } from "@/i18n/I18nProvider";

type PortalTab = "all" | "groupOperations" | "groupAuctions" | "groupFinance" | "groupSystem";

const TAB_KEYS: PortalTab[] = [
  "all",
  "groupOperations",
  "groupAuctions",
  "groupFinance",
  "groupSystem",
];

function isNavActive(pathname: string, searchParams: URLSearchParams, href: string): boolean {
  const [path, query] = href.split("?");
  if (pathname !== path) return false;
  if (!query) {
    return !searchParams.get("payment");
  }
  const expected = new URLSearchParams(query);
  for (const [key, value] of Array.from(expected.entries())) {
    if (searchParams.get(key) !== value) return false;
  }
  return true;
}

export default function PortalSwitcher() {
  const t = useTranslations("adminNav");
  const tPortal = useTranslations("portalSwitcher");
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PortalTab>("all");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const visibleGroups = useMemo(() => {
    if (activeTab === "all") return ADMIN_NAV_GROUPS;
    return ADMIN_NAV_GROUPS.filter((group) => group.titleKey === activeTab);
  }, [activeTab]);

  return (
    <div className="fixed top-20 right-4 z-50 font-body-md select-none sm:right-6">
      {!isOpen && (
        <span className="pointer-events-none absolute -inset-0.5 animate-pulse rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 opacity-40 blur transition duration-1000" />
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full border shadow-2xl transition-all duration-300 active:scale-95 ${
          isOpen
            ? "rotate-90 border-white/20 bg-slate-900 text-white"
            : "border-amber-300/30 bg-gradient-to-r from-slate-900 to-slate-800 text-amber-300 hover:scale-105"
        }`}
        title={tPortal("title")}
        aria-label={tPortal("title")}
      >
        <span className="material-symbols-outlined text-[26px]">
          {isOpen ? "close" : "hub"}
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute top-16 right-0 flex max-h-[75vh] w-[92vw] max-w-[480px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-in fade-in slide-in-from-top-5"
          style={{ zIndex: 9999 }}
        >
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-slate-900 to-slate-950 p-4">
            <div>
              <h3 className="flex items-center gap-xs font-label-md font-bold text-white">
                <span className="material-symbols-outlined text-[18px] text-amber-300">explore</span>
                {tPortal("title")}
              </h3>
              <p className="mt-0.5 font-label-sm text-[10px] text-slate-400">{tPortal("subtitle")}</p>
            </div>
          </div>

          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/5 bg-slate-900/60 p-2 scrollbar-none">
            {TAB_KEYS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-lg px-3 py-1 font-label-md text-[11px] transition-all ${
                  activeTab === tab
                    ? "border border-amber-300/30 bg-amber-400/20 text-amber-300"
                    : "border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                {tab === "all" ? tPortal("tabAll") : t(tab)}
              </button>
            ))}
          </div>

          <div className="custom-scrollbar min-h-[220px] flex-1 space-y-4 overflow-y-auto p-4">
            {activeTab === "all" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">dashboard</span>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
                    {t("overview")}
                  </h4>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <Link
                  href={ADMIN_OVERVIEW_HREF}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 transition-all ${
                    pathname === ADMIN_OVERVIEW_HREF || pathname === "/admin"
                      ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                      : "border-transparent bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                    <span className="material-symbols-outlined text-[16px]">dashboard</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-label-md text-[11px] font-bold">{t("overview")}</p>
                    <p className="truncate font-mono text-[9px] text-slate-500">{ADMIN_OVERVIEW_HREF}</p>
                  </div>
                </Link>
              </div>
            )}

            {visibleGroups.map((group) => (
              <div key={group.titleKey} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="material-symbols-outlined text-[16px] text-[#d4aa61]">
                    {group.titleKey === "groupOperations"
                      ? "shield_person"
                      : group.titleKey === "groupAuctions"
                        ? "gavel"
                        : group.titleKey === "groupFinance"
                          ? "payments"
                          : "settings"}
                  </span>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
                    {t(group.titleKey)}
                  </h4>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {group.items.map((item) => {
                    const active = isNavActive(pathname, searchParams, item.href);
                    const label = t(item.labelKey);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`group/item flex items-center gap-2 rounded-xl border p-2.5 transition-all duration-200 ${
                          active
                            ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                            : "border-transparent bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform group-hover/item:scale-110 ${
                            active
                              ? "bg-amber-400/20 text-amber-300"
                              : "bg-slate-900 text-slate-400 group-hover/item:text-slate-200"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-label-md text-[11px] font-bold">{label}</p>
                          <p className="truncate font-mono text-[9px] text-slate-500">{item.href}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex shrink-0 items-center justify-center gap-1 border-t border-white/10 bg-slate-950 p-3 text-center font-label-sm text-[10px] text-slate-500">
            {tPortal("footer")}
          </div>
        </div>
      )}
    </div>
  );
}
