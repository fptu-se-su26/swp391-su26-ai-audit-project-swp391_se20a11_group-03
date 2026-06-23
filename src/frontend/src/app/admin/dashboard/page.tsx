"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/layout/AdminShell";
import {
  ContractRow,
  DailyRevenue,
  DashboardSummary,
  SalesHistoryRow,
  getContracts,
  getDashboardRevenue,
  getDashboardSummary,
  getSalesHistory,
} from "@/lib/services/dashboardService";
import { resolveApiUrl } from "@/lib/apiClient";

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

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return value;
  }
}

const QUICK_LINKS = [
  { href: "/staff/approvals", icon: "task_alt", label: "Duyệt sản phẩm" },
  { href: "/staff/kyc-review", icon: "badge", label: "Duyệt KYC" },
  { href: "/staff/withdrawals", icon: "payments", label: "Duyệt rút tiền" },
  { href: "/staff/support", icon: "support_agent", label: "Hỗ trợ" },
  { href: "/admin/sales-history", icon: "receipt_long", label: "Lịch sử mua bán" },
  { href: "/admin/contracts", icon: "contract", label: "Hợp đồng điện tử" },
];

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [revenue, setRevenue] = useState<DailyRevenue[]>([]);
  const [sales, setSales] = useState<SalesHistoryRow[]>([]);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [groupBy, setGroupBy] = useState<"day" | "month">("day");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRevenue = useCallback(async (mode: "day" | "month") => {
    const data = await getDashboardRevenue(mode).catch(() => []);
    setRevenue(data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [summaryRes, revenueRes, salesRes, contractsRes] = await Promise.all([
          getDashboardSummary().catch(() => null),
          getDashboardRevenue("day").catch(() => []),
          getSalesHistory().catch(() => []),
          getContracts().catch(() => []),
        ]);
        setSummary(summaryRes);
        setRevenue(revenueRes);
        setSales(salesRes);
        setContracts(contractsRes);
      } catch {
        setError("Không thể tải dữ liệu tổng quan.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    void loadRevenue(groupBy);
  }, [groupBy, loadRevenue]);

  const maxRevenue = useMemo(
    () => revenue.reduce((max, r) => Math.max(max, r.amount), 0),
    [revenue],
  );
  const totalRevenueInRange = useMemo(
    () => revenue.reduce((sum, r) => sum + r.amount, 0),
    [revenue],
  );

  const kpis = summary
    ? [
        { label: "Doanh thu nền tảng", value: formatCurrency(summary.totalRevenue), icon: "trending_up", accent: true },
        { label: "Số dư ví Admin", value: formatCurrency(summary.adminBalance), icon: "account_balance_wallet", accent: true },
        { label: "Tổng nạp (SePay)", value: formatCurrency(summary.totalTopUps), icon: "savings" },
        { label: "Cọc đang giữ", value: formatCurrency(summary.depositsHeld), icon: "lock" },
        { label: "Người dùng", value: String(summary.totalUsers), icon: "group" },
        { label: "Sản phẩm", value: String(summary.totalProducts), icon: "inventory_2" },
        { label: "Phiên đấu giá", value: `${summary.activeAuctions}/${summary.totalAuctions}`, icon: "gavel" },
        { label: "Rút tiền chờ duyệt", value: String(summary.pendingWithdrawals), icon: "hourglass_empty" },
      ]
    : [];

  if (loading) {
    return (
      <AdminShell>
        <div className="flex h-64 items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-[1400px] space-y-lg p-margin-mobile md:p-margin-desktop">
        <div>
          <h1 className="font-display-lg-mobile text-primary md:font-display-lg">Tổng quan hệ thống</h1>
          <p className="mt-xs font-body-lg text-on-surface-variant">
            Cái nhìn tổng quan về doanh thu, giao dịch và hoạt động của nền tảng đấu giá.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-error-container p-md text-on-error-container">{error}</div>
        )}

        {/* KPI grid */}
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className={`rounded-xl border border-surface-variant p-md soft-shadow ${
                kpi.accent ? "bg-primary-container text-on-primary-container" : "bg-surface"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`font-label-md text-label-md ${kpi.accent ? "text-on-primary-container" : "text-on-surface-variant"}`}>
                  {kpi.label}
                </p>
                <span className="material-symbols-outlined">{kpi.icon}</span>
              </div>
              <p className={`mt-xs font-headline-md text-headline-md font-bold ${kpi.accent ? "text-on-primary-container" : "text-primary"}`}>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <section className="rounded-xl border border-surface-variant bg-surface p-lg soft-shadow">
          <div className="mb-md flex flex-wrap items-center justify-between gap-sm">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary">Doanh thu theo {groupBy === "day" ? "ngày" : "tháng"}</h2>
              <p className="font-body-sm text-sm text-on-surface-variant">
                Tổng trong khoảng hiển thị: <span className="font-bold text-primary">{formatCurrency(totalRevenueInRange)}</span>
              </p>
            </div>
            <div className="flex rounded-lg bg-surface-container-low p-1">
              {(["day", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setGroupBy(mode)}
                  className={`rounded-md px-4 py-1.5 font-label-md text-label-md transition-all ${
                    groupBy === mode ? "bg-surface text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {mode === "day" ? "Ngày" : "Tháng"}
                </button>
              ))}
            </div>
          </div>

          {revenue.length === 0 ? (
            <div className="py-xl text-center text-on-surface-variant">
              <span className="material-symbols-outlined mb-sm block text-4xl">bar_chart</span>
              <p>Chưa có dữ liệu doanh thu.</p>
            </div>
          ) : (
            <div className="flex h-56 items-end gap-2 overflow-x-auto pb-2">
              {revenue.map((r) => (
                <div key={r.date} className="flex min-w-[36px] flex-1 flex-col items-center justify-end gap-1">
                  <span className="font-body-sm text-[10px] text-on-surface-variant">{formatCompact(r.amount)}</span>
                  <div
                    className="w-full rounded-t-md bg-secondary transition-all hover:bg-secondary-fixed-dim"
                    style={{ height: `${maxRevenue > 0 ? Math.max(4, (r.amount / maxRevenue) * 180) : 4}px` }}
                    title={`${r.date}: ${formatCurrency(r.amount)} (${r.count} giao dịch)`}
                  />
                  <span className="font-body-sm text-[9px] text-on-surface-variant">
                    {groupBy === "day" ? r.date.slice(5) : r.date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick access to staff + admin tools */}
        <section>
          <h2 className="mb-md border-b border-surface-variant pb-xs font-headline-sm text-headline-sm text-primary">
            Truy cập nhanh
          </h2>
          <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 lg:grid-cols-6">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-xs rounded-xl border border-surface-variant bg-surface p-md text-center transition-all hover:border-secondary hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-2xl text-secondary">{link.icon}</span>
                <span className="font-label-md text-label-md text-on-surface">{link.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent sales + contracts */}
        <div className="grid grid-cols-1 gap-lg lg:grid-cols-2">
          <section className="rounded-xl border border-surface-variant bg-surface soft-shadow">
            <div className="flex items-center justify-between border-b border-surface-variant p-md">
              <h2 className="font-headline-sm text-headline-sm text-primary">Lịch sử mua bán gần đây</h2>
              <Link href="/admin/sales-history" className="font-label-md text-label-md text-secondary hover:underline">
                Xem tất cả
              </Link>
            </div>
            {sales.length === 0 ? (
              <p className="p-lg text-center text-on-surface-variant">Chưa có giao dịch hoàn tất.</p>
            ) : (
              <ul className="divide-y divide-surface-variant">
                {sales.slice(0, 5).map((s) => (
                  <li key={s.auctionId} className="flex items-center justify-between gap-sm p-md">
                    <div className="min-w-0">
                      <p className="truncate font-label-md text-label-md text-primary">{s.productName}</p>
                      <p className="truncate font-body-sm text-sm text-on-surface-variant">
                        {s.sellerName} → {s.buyerName} · {formatDate(s.paidAt)}
                      </p>
                    </div>
                    <span className="shrink-0 font-bold text-primary">{formatCurrency(s.finalPrice)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-surface-variant bg-surface soft-shadow">
            <div className="flex items-center justify-between border-b border-surface-variant p-md">
              <h2 className="font-headline-sm text-headline-sm text-primary">Hợp đồng điện tử gần đây</h2>
              <Link href="/admin/contracts" className="font-label-md text-label-md text-secondary hover:underline">
                Xem tất cả
              </Link>
            </div>
            {contracts.length === 0 ? (
              <p className="p-lg text-center text-on-surface-variant">Chưa có hợp đồng nào.</p>
            ) : (
              <ul className="divide-y divide-surface-variant">
                {contracts.slice(0, 5).map((c) => (
                  <li key={c.contractId} className="flex items-center justify-between gap-sm p-md">
                    <div className="min-w-0">
                      <p className="truncate font-label-md text-label-md text-primary">{c.referenceName}</p>
                      <p className="truncate font-body-sm text-sm text-on-surface-variant">
                        {c.typeLabel} · {formatDate(c.createdAt)}
                      </p>
                    </div>
                    {c.fileUrl && (
                      <a
                        href={resolveApiUrl(c.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center gap-xs font-label-md text-label-md text-secondary hover:underline"
                      >
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                        PDF
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
