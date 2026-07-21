"use client";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { authApi } from "@/lib/api";
export default function ShipperShell({ children }: { children: React.ReactNode }) {
  return <div className="luxora-app min-h-screen"><header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[var(--luxora-bg-elevated)] px-4 py-3"><Link href="/shipper/orders" className="font-semibold text-[var(--luxora-gold)]">BidZone Delivery</Link><div className="flex items-center gap-2"><ThemeToggle /><Link href="/auth" onClick={() => authApi.logout()} className="text-xs text-white/60">Đăng xuất</Link></div></header>{children}</div>;
}
