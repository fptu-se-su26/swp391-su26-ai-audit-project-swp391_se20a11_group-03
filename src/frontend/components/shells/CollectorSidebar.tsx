"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import { authApi, fetchAccountSummary, toFrontendRole, userApi, type AccountSummary } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

const STORAGE_KEY = "bidzone-sidebar-collapsed";

/** Sự kiện toàn cục để trang Tin nhắn báo sidebar cập nhật lại số tin chưa đọc. */
export const UNREAD_REFRESH_EVENT = "bidzone:unread-refresh";

type NavItem = { label: string; href: string; icon: string; badge?: string };
type NavGroup = { title: string; items: NavItem[]; sellerOnly?: boolean };

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Sàn đấu giá",
    items: [
      { label: "Phòng đấu giá", href: "/auctions", icon: "storefront" },
      { label: "Tổng quan", href: "/dashboard", icon: "dashboard" },
      { label: "Theo dõi", href: "/watchlist", icon: "visibility" },
      { label: "Đã thắng", href: "/won-items", icon: "emoji_events" },
      { label: "Tin nhắn", href: "/messages", icon: "chat" },
    ],
  },
  {
    title: "Tài khoản",
    items: [
      { label: "Ví BidZone", href: "/wallet", icon: "account_balance_wallet" },
      { label: "Xác minh KYC", href: "/kyc", icon: "verified_user" },
      { label: "Hồ sơ", href: "/profile", icon: "person" },
      { label: "Bảo mật", href: "/security", icon: "lock" },
    ],
  },
  {
    title: "Ký gửi",
    sellerOnly: true,
    items: [
      { label: "Kho vật phẩm", href: "/inventory", icon: "inventory_2" },
      { label: "Đăng vật phẩm", href: "/post-item", icon: "add_box" },
      { label: "Doanh thu", href: "/earnings", icon: "payments" },
    ],
  },
];

export default function CollectorSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: account } = useApiData<AccountSummary | null>(fetchAccountSummary, null);
  const role = toFrontendRole(account?.profile.roleName ?? null);
  const navGroups = NAV_GROUPS.filter(
    (group) => !group.sellerOnly || role === "seller",
  );
  const initials = account?.profile.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function refreshUnread() {
      try {
        const conversations = await userApi.myConversations();
        if (!cancelled) {
          setUnreadMessages(
            conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
          );
        }
      } catch {
        /* chưa đăng nhập hoặc backend chưa chạy — bỏ qua */
      }
    }

    void refreshUnread();
    const interval = setInterval(() => void refreshUnread(), 30_000);
    window.addEventListener(UNREAD_REFRESH_EVENT, refreshUnread);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener(UNREAD_REFRESH_EVENT, refreshUnread);
    };
  }, [pathname]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  function isItemActive(href: string) {
    if (href === "/auctions") {
      return pathname === href || pathname.startsWith("/auctions/");
    }

    return pathname === href;
  }

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/10 bg-[var(--luxora-bg-elevated)] transition-all md:flex ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div
        className={`flex items-center px-4 py-5 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <BidZoneLogo className="h-9 w-auto" />
          </Link>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Mở rộng menu" : "Thu nhỏ menu"}
          className="text-white/40 hover:text-white"
        >
          <span className="material-symbols-outlined text-lg">
            {collapsed ? "chevron_right" : "chevron_left"}
          </span>
        </button>
      </div>

      {!collapsed && (
        <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--luxora-gold)]/15 text-xs font-bold text-[var(--luxora-gold-light)]">
              {initials || "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {account?.profile.fullName ?? "Đang tải..."}
              </p>
              <p className="text-[11px] capitalize text-white/40">
                {account?.profile.roleName ?? ""}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/5 px-2.5 py-2">
              <p className="text-[10px] text-white/40">Số dư</p>
              <p className="text-xs font-semibold text-[var(--luxora-gold-light)]">
                {(account?.wallet.availableBalance ?? 0).toLocaleString("vi-VN")} ₫
              </p>
            </div>
            <div className="rounded-lg bg-white/5 px-2.5 py-2">
              <p className="text-[10px] text-white/40">Đặt cọc</p>
              <p className="text-xs font-semibold">
                {(account?.wallet.holdBalance ?? 0).toLocaleString("vi-VN")} ₫
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-5">
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                {group.title}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isItemActive(item.href);
                const badge =
                  item.href === "/messages" && unreadMessages > 0
                    ? unreadMessages > 99
                      ? "99+"
                      : String(unreadMessages)
                    : item.badge;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold-light)]"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="relative material-symbols-outlined text-xl">
                      {item.icon}
                      {collapsed && badge && (
                        <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--luxora-gold)] px-1 text-[9px] font-bold text-black">
                          {badge}
                        </span>
                      )}
                    </span>
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && badge && (
                      <span className="rounded-full bg-[var(--luxora-gold)] px-1.5 py-0.5 text-[10px] font-semibold text-black">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-white/10 px-3 py-4">
        <Link
          href="/wallet"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white"
        >
          <span className="material-symbols-outlined text-xl">
            add_circle
          </span>
          {!collapsed && <span>Nạp quỹ</span>}
        </Link>
        <Link
          href="/auth"
          onClick={() => authApi.logout()}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          {!collapsed && <span>Đăng xuất</span>}
        </Link>
      </div>
    </aside>
  );
}
