"use client";

import AdminShell from "@/components/shells/AdminShell";
import { useLocale, useTranslations } from "next-intl";
import { adminApi, type AdminDashboardSummary, type DailyRevenue, type SalesHistory } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

type RevenueData = { summary: AdminDashboardSummary; revenue: DailyRevenue[]; sales: SalesHistory[] };
const EMPTY_DATA: RevenueData = { summary: { totalUsers: 0, totalProducts: 0, totalAuctions: 0, activeAuctions: 0, totalRevenue: 0, totalTopUps: 0, depositsHeld: 0, pendingWithdrawals: 0, adminBalance: 0 }, revenue: [], sales: [] };
async function loadRevenue(): Promise<RevenueData> { const [summary, revenue, sales] = await Promise.all([adminApi.summary(), adminApi.revenue(), adminApi.salesHistory()]); return { summary: summary.data, revenue: revenue.data, sales: sales.data }; }

export default function AdminRevenuePage() {
  const t = useTranslations("adminRevenuePage");
  const locale = useLocale();
  const { data, loading, error } = useApiData(loadRevenue, EMPTY_DATA);
  const curve = data.revenue.slice(-12);
  const maxValue = Math.max(1, ...curve.map((item) => item.amount));
  const totalTransactions = data.revenue.reduce((sum, item) => sum + item.count, 0);
  const stats = [
    { label: t("stats.revenue"), value: `${data.summary.totalRevenue.toLocaleString(locale)} ₫` },
    { label: t("stats.transactions"), value: totalTransactions.toLocaleString(locale) },
    { label: t("stats.users"), value: data.summary.totalUsers.toLocaleString(locale) },
    { label: t("stats.adminBalance"), value: `${data.summary.adminBalance.toLocaleString(locale)} ₫` },
  ];
  return <AdminShell><div className="mx-auto max-w-7xl px-6 py-10">
    <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">ADMIN CONTROL CENTER</p><h1 className="font-display-lg mt-2 text-3xl">{t("title")}</h1>
    {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">{stats.map((item) => <div key={item.label} className="glass-panel rounded-2xl p-6"><p className="text-xs text-white/40">{item.label}</p><p className="mt-2 text-2xl font-bold text-[var(--luxora-gold-light)]">{loading ? "—" : item.value}</p></div>)}</div>
    <div className="glass-panel mt-8 rounded-2xl p-6"><p className="mb-6 text-xs font-semibold uppercase tracking-wider text-white/40">{t("dailyRevenue")}</p><div className="flex h-40 items-end gap-2">{curve.map((item) => <div key={item.date} className="flex-1 rounded-t-md bg-[var(--luxora-gold)]/60" style={{ height: `${Math.max(4, item.amount / maxValue * 100)}%` }} title={`${item.date}: ${item.amount.toLocaleString(locale)} ₫`} />)}{!loading && curve.length === 0 && <p className="m-auto text-sm text-white/45">{t("noRevenue")}</p>}</div></div>
    <h2 className="font-headline-md mt-10 mb-4 text-lg">{t("recentTransactions")}</h2><div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40"><th className="px-5 py-3">Lot #</th><th className="px-5 py-3">{t("productFlow")}</th><th className="px-5 py-3">{t("salePrice")}</th><th className="px-5 py-3">{t("date")}</th><th className="px-5 py-3">{t("status")}</th></tr></thead><tbody>{data.sales.slice(0, 8).map((row) => <tr key={row.auctionId} className="border-b border-white/5"><td className="px-5 py-4 text-[var(--luxora-gold)]">LOT-{row.productId}</td><td className="px-5 py-4"><p className="font-medium">{row.productName}</p><p className="text-xs text-white/40">{row.sellerName} → {row.buyerName}</p></td><td className="px-5 py-4 font-semibold text-[var(--luxora-gold-light)]">{row.finalPrice.toLocaleString(locale)} ₫</td><td className="px-5 py-4 text-white/60">{row.paidAt ? new Intl.DateTimeFormat(locale).format(new Date(row.paidAt)) : "—"}</td><td className="px-5 py-4">{row.paymentStatus ?? row.status}</td></tr>)}</tbody></table></div>
  </div></AdminShell>;
}
