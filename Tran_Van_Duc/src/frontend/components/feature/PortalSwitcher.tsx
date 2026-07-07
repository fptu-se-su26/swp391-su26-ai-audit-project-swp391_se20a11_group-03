"use client";

import Link from "next/link";
import { useState } from "react";

type PortalGroup = "collector" | "seller" | "staff" | "admin";

type Route = {
  label: string;
  href: string;
  group: PortalGroup;
};

const ROUTES: Route[] = [
  { label: "Phòng đấu giá", href: "/auctions", group: "collector" },
  { label: "Tổng quan", href: "/dashboard", group: "collector" },
  { label: "Chi tiết đấu giá", href: "/auctions/1", group: "collector" },
  { label: "Theo dõi", href: "/watchlist", group: "collector" },
  { label: "Đã thắng", href: "/won-items", group: "collector" },
  { label: "Ví", href: "/wallet", group: "collector" },
  { label: "Kho ký gửi", href: "/inventory", group: "seller" },
  { label: "Đăng vật phẩm", href: "/post-item", group: "seller" },
  { label: "Doanh thu", href: "/earnings", group: "seller" },
  { label: "Tin nhắn", href: "/messages", group: "collector" },
  { label: "Hồ sơ", href: "/profile", group: "collector" },
  { label: "KYC", href: "/kyc", group: "collector" },
  { label: "Bảo mật", href: "/security", group: "collector" },
  { label: "Duyệt vật phẩm", href: "/staff/approvals", group: "staff" },
  { label: "Xét duyệt KYC", href: "/staff/kyc-review", group: "staff" },
  { label: "Hộp thư hỗ trợ", href: "/staff/support", group: "staff" },
  { label: "Doanh thu & vận hành", href: "/admin/revenue", group: "admin" },
  { label: "Lịch sử đấu giá", href: "/admin/auction-history", group: "admin" },
  { label: "Sản phẩm", href: "/admin/categories", group: "admin" },
  { label: "Thông báo hệ thống", href: "/admin/broadcasts", group: "admin" },
  { label: "Báo cáo", href: "/admin/reports", group: "admin" },
];

const TABS: { id: "all" | PortalGroup; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "collector", label: "Nhà sưu tầm" },
  { id: "seller", label: "Người bán" },
  { id: "staff", label: "Nhân viên" },
  { id: "admin", label: "Quản trị" },
];

export default function PortalSwitcher() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | PortalGroup>("all");

  const routes = ROUTES.filter((r) => tab === "all" || r.group === tab);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {open && (
        <div className="luxora-app glass-panel mb-3 flex max-h-96 w-72 flex-col overflow-hidden rounded-2xl">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs font-semibold text-[var(--luxora-gold)]">
              Điều hướng bản mẫu
            </p>
          </div>

          <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 py-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold ${
                  tab === t.id
                    ? "bg-[var(--luxora-gold)] text-black"
                    : "text-white/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto p-2">
            {routes.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-xs text-white/70 hover:bg-white/5 hover:text-white"
              >
                {r.label}
                <span className="ml-1 text-white/30">{r.href}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg ring-1 ring-white/20"
        title="Điều hướng bản mẫu (chỉ dùng cho demo)"
      >
        <span className="material-symbols-outlined text-xl">apps</span>
      </button>
    </div>
  );
}
