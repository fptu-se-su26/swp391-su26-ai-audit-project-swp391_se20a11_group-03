"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import FloatingSupportButton from "./FloatingSupportButton";
import NotificationBell from "@/components/features/NotificationBell";
import BrandLogo from "@/components/ui/BrandLogo";
import { getStoredUser, isAdmin } from "@/lib/userSession";
import { ADMIN_HOME } from "@/lib/roleRouting";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (user && isAdmin(user)) {
      router.replace(ADMIN_HOME);
    }
  }, [router]);
  return (
    <div className="min-h-screen bg-[#edf3f8] text-slate-950">
      <Sidebar />
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur md:hidden">
        <BrandLogo compact={false} />
        <div className="flex items-center gap-1">
          <NotificationBell className="text-[#344253]" />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white" aria-label="Toggle dashboard menu"><span className="material-symbols-outlined">{mobileOpen ? "close" : "menu"}</span></button>
        </div>
      </header>
      {mobileOpen && <div className="fixed inset-x-0 top-16 z-30 border-b border-white/10 bg-[#071626] p-4 shadow-xl md:hidden"><div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#c1cbd3]">{[["/dashboard","Dashboard"],["/inventory","Phiên đấu giá"],["/messages","Tin nhắn"],["/watchlist","Theo dõi"],["/post-item","Đăng sản phẩm"],["/wallet","Ví đấu giá"],["/profile","Cài đặt"]].map(([href,label]) => <Link onClick={() => setMobileOpen(false)} href={href} key={href} className={`rounded-xl px-3 py-3 ${href === "/post-item" ? "bg-[#c4a356]/20 text-[#e6cb82]" : "bg-white/[.04]"}`}>{label}</Link>)}</div></div>}
      <main className="relative min-h-screen overflow-hidden md:ml-[280px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgba(29,78,216,.16),transparent_27%),radial-gradient(circle_at_16%_88%,rgba(210,173,85,.16),transparent_30%),linear-gradient(180deg,#f7fbff_0%,#eef4f9_45%,#f7f8fb_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[.035] [background-image:linear-gradient(#071626_1px,transparent_1px),linear-gradient(90deg,#071626_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[#d2ad55]/10 blur-3xl" />
        <div className="relative">{children}</div>
      </main>
      <FloatingSupportButton />
    </div>
  );
}
