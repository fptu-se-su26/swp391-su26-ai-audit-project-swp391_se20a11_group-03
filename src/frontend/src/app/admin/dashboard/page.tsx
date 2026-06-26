"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/layout/AdminShell";
import {
  AuctionOverview,
  AuctionOverviewItem,
  DailyRevenue,
  DashboardSummary,
  getAuctionOverview,
  getDashboardRevenue,
  getDashboardSummary,
} from "@/lib/services/dashboardService";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatCompact(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(amount || 0);
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultFromDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return formatIsoDate(d);
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function SessionRow({ item, live }: { item: AuctionOverviewItem; live?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#e8e2d6] py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[#071626]">{item.productName}</p>
        <p className="text-xs text-[#6b7280]">
          #{item.auctionId} · {item.sellerName} · {item.totalBids} lượt bid
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-[#071626]">{formatCurrency(item.currentBid)}</p>
        <p className="text-xs text-[#6b7280]">
          {live ? `Kết thúc ${formatDateTime(item.endTime)}` : formatDateTime(item.startTime)}
        </p>
      </div>
      {item.productId && (
        <Link
          href={`/auctions/${item.productId}`}
          className="shrink-0 rounded-lg border border-[#d4b56a]/50 px-2 py-1 text-xs text-[#9a7429] hover:bg-[#fdf8ee]"
        >
          Xem
        </Link>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [overview, setOverview] = useState<AuctionOverview | null>(null);
  const [revenue, setRevenue] = useState<DailyRevenue[]>([]);
  const [groupBy, setGroupBy] = useState<"day" | "month">("day");
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(formatIsoDate(new Date()));
  const [loading, setLoading] = useState(true);

  const loadRevenue = useCallback(async () => {
    const data = await getDashboardRevenue(groupBy, fromDate || undefined, toDate || undefined).catch(() => []);
    setRevenue(data);
  }, [groupBy, fromDate, toDate]);

  useEffect(() => {
    (async () => {
      try {
        const [summaryRes, overviewRes] = await Promise.all([
          getDashboardSummary().catch(() => null),
          getAuctionOverview().catch(() => null),
        ]);
        setSummary(summaryRes);
        setOverview(overviewRes);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    void loadRevenue();
  }, [loadRevenue]);

  const totalRevenueInRange = useMemo(() => revenue.reduce((s, r) => s + r.amount, 0), [revenue]);
  const maxRevenue = useMemo(() => revenue.reduce((m, r) => Math.max(m, r.amount), 0), [revenue]);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex h-64 items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#9a7429]">progress_activity</span>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-8 sm:px-6 lg:px-10">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a7429]">Admin Control Center</p>
            <h1 className="mt-1 text-3xl font-bold text-[#071626]">Tổng quan hệ thống</h1>
            <p className="mt-1 text-sm text-[#6b7280]">Giám sát phiên đấu giá, tài chính và vận hành nền tảng.</p>
          </div>
          {summary && (
            <div className="rounded-2xl bg-[#071626] px-5 py-3 text-white shadow-lg">
              <p className="text-xs text-white/60">Doanh thu nền tảng</p>
              <p className="text-xl font-bold text-[#f0dfa0]">{formatCurrency(summary.totalRevenue)}</p>
            </div>
          )}
        </header>

        {/* Auction status strip */}
        {overview && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {[
              { label: "Đang diễn ra", value: overview.activeCount, icon: "live_tv", color: "text-red-600 bg-red-50 border-red-200", href: "/admin/auction-history" },
              { label: "Sắp diễn ra", value: overview.upcomingCount, icon: "upcoming", color: "text-blue-600 bg-blue-50 border-blue-200", href: "/admin/auction-history" },
              { label: "Chờ thanh toán", value: overview.awaitingPaymentCount, icon: "schedule", color: "text-amber-600 bg-amber-50 border-amber-200", href: "/admin/auction-history?payment=UNPAID" },
              { label: "Đã kết thúc", value: overview.endedCount, icon: "flag", color: "text-[#6b7280] bg-white border-[#e8e2d6]", href: "/admin/auction-history?payment=PAID" },
              { label: "Tổng phiên", value: overview.totalCount, icon: "gavel", color: "text-[#071626] bg-[#fdf8ee] border-[#d4b56a]/40", href: "/admin/auction-history" },
            ].map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className={`rounded-2xl border p-4 transition-all hover:shadow-md ${card.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                  <span className="text-2xl font-bold">{card.value}</span>
                </div>
                <p className="mt-2 text-sm font-medium">{card.label}</p>
              </Link>
            ))}
          </div>
        )}

        {/* Live sessions + KPIs */}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-2xl border border-[#e8e2d6] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                <h2 className="font-semibold text-[#071626]">Phiên đang diễn ra</h2>
              </div>
              <Link href="/admin/auction-history" className="text-sm text-[#9a7429] hover:underline">
                Xem tất cả
              </Link>
            </div>
            {!overview?.activeSessions?.length ? (
              <p className="py-8 text-center text-sm text-[#6b7280]">Không có phiên đấu giá đang live.</p>
            ) : (
              overview.activeSessions.map((item) => <SessionRow key={item.auctionId} item={item} live />)
            )}
          </section>

          <section className="space-y-3">
            {summary && [
              { label: "Người dùng", value: summary.totalUsers, icon: "group" },
              { label: "Sản phẩm", value: summary.totalProducts, icon: "inventory_2" },
              { label: "Rút tiền chờ duyệt", value: summary.pendingWithdrawals, icon: "hourglass_empty", alert: summary.pendingWithdrawals > 0 },
              { label: "Cọc đang giữ", value: formatCurrency(summary.depositsHeld), icon: "lock" },
              { label: "Ví Admin", value: formatCurrency(summary.adminBalance), icon: "account_balance_wallet" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  kpi.alert ? "border-amber-300 bg-amber-50" : "border-[#e8e2d6] bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#9a7429]">{kpi.icon}</span>
                  <span className="text-sm text-[#6b7280]">{kpi.label}</span>
                </div>
                <span className="font-bold text-[#071626]">{kpi.value}</span>
              </div>
            ))}
          </section>
        </div>

        {/* Upcoming + awaiting payment */}
        {overview && (overview.upcomingSessions.length > 0 || overview.awaitingPaymentSessions.length > 0) && (
          <div className="grid gap-6 md:grid-cols-2">
            {overview.upcomingSessions.length > 0 && (
              <section className="rounded-2xl border border-[#e8e2d6] bg-white p-5 shadow-sm">
                <h2 className="mb-3 font-semibold text-[#071626]">Sắp diễn ra</h2>
                {overview.upcomingSessions.map((item) => (
                  <SessionRow key={item.auctionId} item={item} />
                ))}
              </section>
            )}
            {overview.awaitingPaymentSessions.length > 0 && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 shadow-sm">
                <h2 className="mb-3 font-semibold text-amber-800">Chờ thanh toán</h2>
                {overview.awaitingPaymentSessions.map((item) => (
                  <SessionRow key={item.auctionId} item={item} />
                ))}
                <Link
                  href="/admin/auction-history?payment=UNPAID"
                  className="mt-3 block text-center text-sm text-amber-700 hover:underline"
                >
                  Xem tất cả phiên chưa thanh toán →
                </Link>
              </section>
            )}
          </div>
        )}

        {/* Revenue chart */}
        <section className="rounded-2xl border border-[#e8e2d6] bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-semibold text-[#071626]">Doanh thu theo {groupBy === "day" ? "ngày" : "tháng"}</h2>
              <p className="text-sm text-[#6b7280]">
                Tổng: <span className="font-bold text-[#9a7429]">{formatCurrency(totalRevenueInRange)}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-lg border border-[#e8e2d6] px-2 py-1.5 text-sm" />
              <span className="text-[#6b7280]">→</span>
              <input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} className="rounded-lg border border-[#e8e2d6] px-2 py-1.5 text-sm" />
              <div className="flex rounded-lg bg-[#f4f1ea] p-0.5">
                {(["day", "month"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setGroupBy(m)} className={`rounded-md px-3 py-1 text-xs font-medium ${groupBy === m ? "bg-white text-[#071626] shadow" : "text-[#6b7280]"}`}>
                    {m === "day" ? "Ngày" : "Tháng"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {revenue.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#6b7280]">Chưa có dữ liệu trong khoảng đã chọn.</p>
          ) : (
            <div className="flex h-44 items-end gap-1.5 overflow-x-auto pb-1">
              {revenue.map((r) => (
                <div key={r.date} className="flex min-w-[28px] flex-1 flex-col items-center justify-end gap-0.5">
                  <span className="text-[9px] text-[#6b7280]">{formatCompact(r.amount)}</span>
                  <div
                    className="w-full rounded-t bg-[#9a7429] hover:bg-[#bd963f]"
                    style={{ height: `${maxRevenue > 0 ? Math.max(4, (r.amount / maxRevenue) * 140) : 4}px` }}
                    title={`${r.date}: ${formatCurrency(r.amount)}`}
                  />
                  <span className="text-[8px] text-[#6b7280]">{groupBy === "day" ? r.date.slice(5) : r.date}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
