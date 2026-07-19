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
import { useTranslations } from "@/i18n/I18nProvider";

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

function SessionRow({
  item,
  live,
  t,
}: {
  item: AuctionOverviewItem;
  live?: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[#f5ead9]">{item.productName}</p>
        <p className="text-xs text-[#9d948a]">
          #{item.auctionId} · {item.sellerName} · {t("bidCount", { count: item.totalBids })}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-[#f5ead9]">{formatCurrency(item.currentBid)}</p>
        <p className="text-xs text-[#9d948a]">
          {live ? t("endsAt", { time: formatDateTime(item.endTime) }) : formatDateTime(item.startTime)}
        </p>
      </div>
      {item.productId && (
        <Link
          href={`/auctions/${item.productId}`}
          className="shrink-0 rounded-lg border border-[#d4b56a]/50 px-2 py-1 text-xs text-[#d4aa61] hover:bg-white/[.06]"
        >
          {t("view")}
        </Link>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const t = useTranslations("adminDashboard");
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
          <span className="material-symbols-outlined animate-spin text-4xl text-[#d4aa61]">progress_activity</span>
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
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4aa61]">{t("controlCenter")}</p>
            <h1 className="mt-1 text-3xl font-bold text-[#f5ead9]">{t("pageTitle")}</h1>
            <p className="mt-1 text-sm text-[#9d948a]">{t("pageSubtitle")}</p>
          </div>
          {summary && (
            <div className="rounded-2xl border border-white/10 bg-[#0c0b09] px-5 py-3 text-white shadow-lg">
              <p className="text-xs text-white/60">{t("platformRevenue")}</p>
              <p className="text-xl font-bold text-[#f0dfa0]">{formatCurrency(summary.totalRevenue)}</p>
            </div>
          )}
        </header>

        {/* Auction status strip */}
        {overview && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {[
              { label: t("statLive"), value: overview.activeCount, icon: "live_tv", color: "text-red-400 bg-red-500/10 border-red-500/25", href: "/admin/auction-history" },
              { label: t("statUpcoming"), value: overview.upcomingCount, icon: "upcoming", color: "text-blue-400 bg-blue-500/10 border-blue-500/25", href: "/admin/auction-history" },
              { label: t("statAwaitingPayment"), value: overview.awaitingPaymentCount, icon: "schedule", color: "text-amber-400 bg-amber-500/10 border-amber-500/25", href: "/admin/auction-history?payment=UNPAID" },
              { label: t("statEnded"), value: overview.endedCount, icon: "flag", color: "text-[#9d948a] bg-white/[.04] border-white/10", href: "/admin/auction-history?payment=PAID" },
              { label: t("statTotalSessions"), value: overview.totalCount, icon: "gavel", color: "text-[#f0d98b] bg-[#d4aa61]/10 border-[#d4b56a]/40", href: "/admin/auction-history" },
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
          <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                <h2 className="font-semibold text-[#f5ead9]">{t("liveSessionsTitle")}</h2>
              </div>
              <Link href="/admin/auction-history" className="text-sm text-[#d4aa61] hover:underline">
                {t("viewAll")}
              </Link>
            </div>
            {!overview?.activeSessions?.length ? (
              <p className="py-8 text-center text-sm text-[#9d948a]">{t("noLiveSessions")}</p>
            ) : (
              overview.activeSessions.map((item) => <SessionRow key={item.auctionId} item={item} live t={t} />)
            )}
          </section>

          <section className="space-y-3">
            {summary && [
              { label: t("kpiUsers"), value: summary.totalUsers, icon: "group" },
              { label: t("kpiProducts"), value: summary.totalProducts, icon: "inventory_2" },
              { label: t("kpiPendingWithdrawals"), value: summary.pendingWithdrawals, icon: "hourglass_empty", alert: summary.pendingWithdrawals > 0 },
              { label: t("kpiDepositsHeld"), value: formatCurrency(summary.depositsHeld), icon: "lock" },
              { label: t("kpiAdminWallet"), value: formatCurrency(summary.adminBalance), icon: "account_balance_wallet" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  kpi.alert ? "border-amber-500/40 bg-amber-500/10" : "border-white/10 bg-[#0e0d0b]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#d4aa61]">{kpi.icon}</span>
                  <span className="text-sm text-[#9d948a]">{kpi.label}</span>
                </div>
                <span className="font-bold text-[#f5ead9]">{kpi.value}</span>
              </div>
            ))}
          </section>
        </div>

        {/* Upcoming + awaiting payment */}
        {overview && (overview.upcomingSessions.length > 0 || overview.awaitingPaymentSessions.length > 0) && (
          <div className="grid gap-6 md:grid-cols-2">
            {overview.upcomingSessions.length > 0 && (
              <section className="rounded-2xl border border-white/10 bg-white p-5 shadow-sm">
                <h2 className="mb-3 font-semibold text-[#f5ead9]">{t("upcomingTitle")}</h2>
                {overview.upcomingSessions.map((item) => (
                  <SessionRow key={item.auctionId} item={item} t={t} />
                ))}
              </section>
            )}
            {overview.awaitingPaymentSessions.length > 0 && (
              <section className="rounded-2xl border border-amber-500/30 bg-amber-500/[.08] p-5 shadow-sm">
                <h2 className="mb-3 font-semibold text-amber-300">{t("awaitingPaymentTitle")}</h2>
                {overview.awaitingPaymentSessions.map((item) => (
                  <SessionRow key={item.auctionId} item={item} t={t} />
                ))}
                <Link
                  href="/admin/auction-history?payment=UNPAID"
                  className="mt-3 block text-center text-sm text-amber-700 hover:underline"
                >
                  {t("viewAllUnpaid")}
                </Link>
              </section>
            )}
          </div>
        )}

        {/* Revenue chart */}
        <section className="rounded-2xl border border-white/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-semibold text-[#f5ead9]">{groupBy === "day" ? t("revenueByDay") : t("revenueByMonth")}</h2>
              <p className="text-sm text-[#9d948a]">
                {t("totalLabel")} <span className="font-bold text-[#d4aa61]">{formatCurrency(totalRevenueInRange)}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-lg border border-white/10 bg-[#0c0b0a] px-2 py-1.5 text-sm [color-scheme:dark]" />
              <span className="text-[#9d948a]">→</span>
              <input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} className="rounded-lg border border-white/10 bg-[#0c0b0a] px-2 py-1.5 text-sm [color-scheme:dark]" />
              <div className="flex rounded-lg bg-white/[.04] p-0.5">
                {(["day", "month"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setGroupBy(m)} className={`rounded-md px-3 py-1 text-xs font-medium ${groupBy === m ? "bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] text-[#100d08] shadow" : "text-[#9d948a]"}`}>
                    {m === "day" ? t("day") : t("month")}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {revenue.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#9d948a]">{t("noDataInRange")}</p>
          ) : (
            <div className="flex h-44 items-end gap-1.5 overflow-x-auto pb-1">
              {revenue.map((r) => (
                <div key={r.date} className="flex min-w-[28px] flex-1 flex-col items-center justify-end gap-0.5">
                  <span className="text-[9px] text-[#9d948a]">{formatCompact(r.amount)}</span>
                  <div
                    className="w-full rounded-t bg-[#d4aa61] hover:bg-[#bd963f]"
                    style={{ height: `${maxRevenue > 0 ? Math.max(4, (r.amount / maxRevenue) * 140) : 4}px` }}
                    title={`${r.date}: ${formatCurrency(r.amount)}`}
                  />
                  <span className="text-[8px] text-[#9d948a]">{groupBy === "day" ? r.date.slice(5) : r.date}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
