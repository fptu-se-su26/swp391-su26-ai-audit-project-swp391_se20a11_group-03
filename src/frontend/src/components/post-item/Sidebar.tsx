"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearStoredAuth } from "@/lib/apiClient";
import { getWatchlistIds } from "@/lib/watchlist";
import { StoredUser, getStoredUser, notifyStoredUserChanged, subscribeStoredUser } from "@/lib/userSession";
import SidebarMenuItem from "./SidebarMenuItem";
import SidebarUserCard from "./SidebarUserCard";
import NotificationBell from "@/components/features/NotificationBell";
import BrandLogo from "@/components/ui/BrandLogo";

const menu = [
  ["/dashboard", "space_dashboard", "Dashboard"],
  ["/inventory", "gavel", "Phiên đấu giá của tôi"],
  ["/messages", "forum", "Tin nhắn"],
  ["/watchlist", "favorite", "Danh sách theo dõi"],
  ["/post-item", "add_box", "Đăng sản phẩm"],
  ["/wallet", "account_balance_wallet", "Ví đấu giá"],
  ["/profile", "manage_accounts", "Cài đặt tài khoản"],
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

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

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col overflow-hidden border-r border-white/[.08] bg-[#06111f] px-4 py-5 text-white shadow-[24px_0_70px_rgba(6,17,31,.18)] md:flex">
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#1d4ed8]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 right-0 h-56 w-56 rounded-full bg-[#c49a35]/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[.045] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:34px_34px]" />

      <div className="relative mb-5 flex items-center justify-between gap-3 px-1">
        <BrandLogo inverted />
        <NotificationBell className="shrink-0 rounded-full border border-white/10 bg-white/[.04] p-2 text-[#cdd7e1] shadow-inner shadow-white/5 transition hover:border-[#d2ad55]/40 hover:text-[#f3d88e]" />
      </div>

      <SidebarUserCard user={user} />

      <nav className="custom-scrollbar relative mt-6 flex-1 space-y-1 overflow-y-auto pr-1" aria-label="Collector dashboard">
        <p className="mb-3 px-3 text-[9px] font-black uppercase tracking-[.24em] text-[#71879a]">Không gian của bạn</p>
        {menu.map(([href, icon, label]) => (
          <SidebarMenuItem
            key={href}
            href={href}
            icon={icon}
            label={label}
            active={pathname === href || pathname.startsWith(href + "/")}
            badge={href === "/watchlist" ? getWatchlistIds().length : undefined}
          />
        ))}
      </nav>

      <div className="relative mt-4 border-t border-white/[.08] pt-4">
        <Link
          href="/wallet"
          className="mb-3 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#b8860b] via-[#d7b55c] to-[#f0d98b] px-4 py-3 text-xs font-black text-[#06111f] shadow-[0_16px_34px_rgba(199,160,62,.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(199,160,62,.32)]"
        >
          <span className="material-symbols-outlined text-[18px]">add_card</span>
          Nạp tiền
        </Link>
        <Link
          href="/support"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#9caec0] transition hover:bg-white/[.06] hover:text-white"
        >
          <span className="material-symbols-outlined text-[18px]">help_center</span>
          Help Center
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#9caec0] transition hover:bg-[#b94a45]/10 hover:text-[#ef8d87]"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
