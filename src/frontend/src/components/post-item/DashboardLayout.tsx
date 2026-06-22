"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import FloatingSupportButton from "./FloatingSupportButton";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f6f3ec] text-[#071626]">
      <Sidebar />
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dfd8ca] bg-[#fffdf8]/90 px-4 backdrop-blur md:hidden">
        <Link href="/" className="flex items-center gap-2 font-display-lg font-semibold"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#071626] text-[9px] font-bold text-[#e1c477]">LA</span>LuxeAuction</Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="grid h-10 w-10 place-items-center rounded-full border border-[#ddd5c7] bg-white" aria-label="Toggle dashboard menu"><span className="material-symbols-outlined">{mobileOpen ? "close" : "menu"}</span></button>
      </header>
      {mobileOpen && <div className="fixed inset-x-0 top-16 z-30 border-b border-white/10 bg-[#071626] p-4 shadow-xl md:hidden"><div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#c1cbd3]">{[["/dashboard","Dashboard"],["/inventory","Phiên đấu giá"],["/messages","Tin nhắn"],["/watchlist","Theo dõi"],["/post-item","Đăng sản phẩm"],["/wallet","Ví đấu giá"],["/profile","Cài đặt"]].map(([href,label]) => <Link onClick={() => setMobileOpen(false)} href={href} key={href} className={`rounded-xl px-3 py-3 ${href === "/post-item" ? "bg-[#c4a356]/20 text-[#e6cb82]" : "bg-white/[.04]"}`}>{label}</Link>)}</div></div>}
      <main className="relative min-h-screen overflow-hidden md:ml-[280px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(191,157,78,.12),transparent_24%),radial-gradient(circle_at_12%_90%,rgba(33,74,102,.08),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[.025] [background-image:linear-gradient(#071626_1px,transparent_1px),linear-gradient(90deg,#071626_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="relative">{children}</div>
      </main>
      <FloatingSupportButton />
    </div>
  );
}
