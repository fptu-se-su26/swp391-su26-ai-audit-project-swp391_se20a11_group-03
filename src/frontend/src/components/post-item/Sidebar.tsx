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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col border-r border-white/[.07] bg-[#071626] px-4 py-5 text-white shadow-[18px_0_50px_rgba(7,22,38,.09)] md:flex">
      <div className="mb-5 flex items-center justify-between gap-3 px-1">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#c6a758] text-[10px] font-bold tracking-widest text-[#e3c77b]">LA</span>
          <span className="truncate font-display-lg text-lg font-semibold tracking-[-.04em]">LuxeAuction</span>
        </Link>
        <NotificationBell className="shrink-0 text-[#c1cbd3]" />
      </div>
      <SidebarUserCard user={user} />

      <nav className="custom-scrollbar mt-6 flex-1 space-y-1 overflow-y-auto pr-1" aria-label="Collector dashboard">
        <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[.2em] text-[#607586]">Không gian của bạn</p>
        {menu.map(([href, icon, label]) => <SidebarMenuItem key={href} href={href} icon={icon} label={label} active={pathname === href || pathname.startsWith(href + "/")} badge={href === "/watchlist" ? getWatchlistIds().length : undefined} />)}
      </nav>

      <div className="mt-4 border-t border-white/[.08] pt-4">
        <Link href="/wallet" className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c5a353] to-[#e0c477] px-4 py-3 text-xs font-bold text-[#071626] shadow-[0_10px_25px_rgba(197,163,83,.18)] transition hover:-translate-y-0.5 hover:brightness-105"><span className="material-symbols-outlined text-[18px]">add_card</span>Nạp tiền</Link>
        <Link href="/support" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#8fa0ae] hover:bg-white/[.05] hover:text-white"><span className="material-symbols-outlined text-[18px]">help_center</span>Help Center</Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#8fa0ae] hover:bg-[#b94a45]/10 hover:text-[#ef8d87]"><span className="material-symbols-outlined text-[18px]">logout</span>Đăng xuất</button>
      </div>
    </aside>
  );
}
