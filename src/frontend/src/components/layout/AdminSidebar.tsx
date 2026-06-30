"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clearStoredAuth } from "@/lib/apiClient";
import {
  StoredUser,
  getStoredUser,
  getUserDisplayName,
  getUserInitials,
  subscribeStoredUser,
} from "@/lib/userSession";
import { ADMIN_HOME } from "@/lib/roleRouting";
import { ADMIN_NAV_GROUPS, ADMIN_OVERVIEW_HREF } from "@/lib/adminNav";
import BrandLogo from "@/components/ui/BrandLogo";

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

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const adminName = getUserDisplayName(currentUser);
  const adminInitials = getUserInitials(currentUser);
  const onDashboard = pathname === ADMIN_OVERVIEW_HREF || pathname === "/admin";

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    syncUser();
    return subscribeStoredUser(syncUser);
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    router.push("/auth");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[72px] flex-col border-r border-[#1e2d3d] bg-[#071626] text-white xl:w-60">
      <div className="flex min-h-0 flex-1 flex-col px-2 py-5 xl:px-3">
        <div className="mb-5 shrink-0 px-1 xl:px-2">
          <div className="hidden xl:block"><BrandLogo inverted /></div>
          <p className="hidden text-[10px] uppercase tracking-widest text-white/50 xl:block">Quản trị</p>
          <span className="xl:hidden"><BrandLogo compact inverted /></span>
        </div>

        <nav className="custom-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto pr-0.5" aria-label="Admin navigation">
          <div>
            <p className="mb-1.5 hidden px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/35 xl:block">
              Tổng quan
            </p>
            <Link
              href={ADMIN_OVERVIEW_HREF}
              title="Tổng quan hệ thống"
              className={`flex items-center gap-3 rounded-xl px-2 py-2.5 transition-all xl:px-3 ${
                onDashboard
                  ? "bg-[#d4b56a]/20 text-[#f0dfa0]"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className="material-symbols-outlined shrink-0 text-[22px]"
                style={onDashboard ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                dashboard
              </span>
              <span className="hidden truncate text-sm font-medium xl:inline">Tổng quan</span>
            </Link>
          </div>

          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-1.5 hidden px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#d4b56a]/70 xl:block">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isNavActive(pathname, searchParams, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={item.label}
                        className={`flex items-center gap-3 rounded-xl px-2 py-2 transition-all xl:px-3 ${
                          active
                            ? "bg-[#d4b56a]/20 text-[#f0dfa0]"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span
                          className="material-symbols-outlined shrink-0 text-[22px]"
                          style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          {item.icon}
                        </span>
                        <span className="hidden truncate text-sm font-medium xl:inline">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-3 shrink-0 space-y-2 border-t border-white/10 pt-4">
          <div className="hidden items-center gap-2 px-2 xl:flex">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d4b56a]/30 text-sm font-bold text-[#f0dfa0]">
              {adminInitials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{adminName}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/40">Administrator</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất"
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-white/60 transition-colors hover:bg-error/20 hover:text-error xl:px-3"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span className="hidden text-sm xl:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

