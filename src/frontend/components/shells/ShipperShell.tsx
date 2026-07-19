"use client";
import Link from "next/link";
import { authApi } from "@/lib/api";
export default function ShipperShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[var(--luxora-bg)]"><header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur"><Link href="/shipper/orders" className="font-semibold text-[var(--luxora-gold)]">BidZone Delivery</Link><Link href="/auth" onClick={() => authApi.logout()} className="text-xs text-white/60">Đăng xuất</Link></header>{children}</div>;
}
