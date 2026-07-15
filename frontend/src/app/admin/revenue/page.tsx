"use client";

import { useEffect, useState, useCallback } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { searchProducts } from "@/lib/services/productService";
import { apiClient } from "@/lib/apiClient";
import { DashboardSummary, getDashboardSummary } from "@/lib/services/dashboardService";
import { useTranslations } from "@/i18n/I18nProvider";

type Withdrawal = {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
};

type Stats = {
  totalProducts: number;
  activeProducts: number;
  completedWithdrawals: number;
  pendingWithdrawals: number;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function RevenuePage() {
  const t = useTranslations("adminRevenue");
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeProducts: 0,
    completedWithdrawals: 0,
    pendingWithdrawals: 0,
  });
  const [recentWithdrawals, setRecentWithdrawals] = useState<Withdrawal[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, withdrawalsRes, summaryRes] = await Promise.all([
        searchProducts({ size: 1 }),
        apiClient<{ data: Withdrawal[] }>("/staff/withdrawals").catch(() => ({ data: [] })),
        getDashboardSummary().catch(() => null),
      ]);
      setSummary(summaryRes);

      const totalProducts = productsRes.totalElements || 0;
      const activeProducts = productsRes.content.filter(
        (p: { status: string }) => p.status === "ACTIVE"
      ).length;

      const withdrawals = withdrawalsRes.data || [];
      const completed = withdrawals.filter((w: Withdrawal) => w.status === "COMPLETED").length;
      const pending = withdrawals.filter((w: Withdrawal) => w.status === "PENDING").length;

      setStats({
        totalProducts,
        activeProducts,
        completedWithdrawals: completed,
        pendingWithdrawals: pending,
      });

      setRecentWithdrawals(withdrawals.slice(0, 10));
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const STATS_CONFIG = [
    { labelKey: "totalProducts", value: stats.totalProducts, icon: "inventory_2", color: "primary" },
    { labelKey: "activeProducts", value: stats.activeProducts, icon: "check_circle", color: "secondary" },
    { labelKey: "pendingWithdrawals", value: stats.pendingWithdrawals, icon: "hourglass_empty", color: "tertiary" },
    { labelKey: "completedPayouts", value: stats.completedWithdrawals, icon: "payments", color: "primary" },
  ];

  if (loading) {
    return (
      <AdminShell>
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        </div>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell>
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          <div className="bg-error-container rounded-xl p-lg text-center">
            <p className="text-on-error-container">{error}</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{t("pageTitle")}</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Revenue summary from backend dashboard API */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
            {[
              { label: t("platformRevenue"), value: formatCurrency(summary.totalRevenue) },
              { label: t("adminWalletBalance"), value: formatCurrency(summary.adminBalance) },
              { label: t("totalSepayTopUps"), value: formatCurrency(summary.totalTopUps) },
              { label: t("depositsHeld"), value: formatCurrency(summary.depositsHeld) },
            ].map((card) => (
              <div key={card.label} className="bg-primary-container rounded-xl p-md soft-shadow border border-surface-variant">
                <p className="font-label-md text-label-md text-on-primary-container">{card.label}</p>
                <p className="font-headline-md text-headline-md md:text-[28px] font-bold text-on-primary-container mt-xs">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
          {STATS_CONFIG.map((stat) => (
            <div key={stat.labelKey} className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
              <div className="flex items-start justify-between mb-sm">
                <span className="material-symbols-outlined text-on-surface-variant">{stat.icon}</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant">{t(stat.labelKey)}</p>
              <p className="font-headline-md text-headline-md md:text-[28px] font-bold text-primary mt-xs">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Withdrawals */}
        <section>
          <h2 className="font-headline-sm text-headline-sm text-primary border-b border-surface-variant pb-xs mb-md">
            {t("recentWithdrawals")}
          </h2>
          {recentWithdrawals.length === 0 ? (
            <div className="bg-surface rounded-xl p-lg text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-md">payments</span>
              <p className="text-on-surface-variant">{t("noWithdrawals")}</p>
            </div>
          ) : (
            <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-variant">
                    {[t("tableId"), t("tableAmount"), t("tableStatus"), t("tableDate")].map((h) => (
                      <th key={h} className="p-md font-label-sm text-label-sm text-on-surface-variant">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentWithdrawals.map((row) => (
                    <tr key={row.id} className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                      <td className="p-md font-label-md text-label-md text-primary">#{row.id}</td>
                      <td className="p-md font-bold text-primary">{formatCurrency(row.amount)}</td>
                      <td className="p-md">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            row.status === "COMPLETED"
                              ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                              : row.status === "PENDING"
                              ? "bg-secondary-container text-on-secondary-container"
                              : "bg-error-container text-on-error-container"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-md font-body-md text-sm text-on-surface-variant">
                        {new Date(row.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
