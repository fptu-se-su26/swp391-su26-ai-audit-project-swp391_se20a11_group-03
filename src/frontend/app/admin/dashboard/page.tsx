"use client";

import AdminShell from "@/components/shells/AdminShell";
import { useLocale, useTranslations } from "next-intl";
import { adminApi, type AdminDashboardSummary } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

const EMPTY_SUMMARY: AdminDashboardSummary = { totalUsers: 0, totalProducts: 0, totalAuctions: 0, activeAuctions: 0, totalRevenue: 0, totalTopUps: 0, depositsHeld: 0, pendingWithdrawals: 0, adminBalance: 0 };
async function loadSummary() { return (await adminApi.summary()).data; }

export default function AdminDashboardPage() {
  const t = useTranslations("adminDashboardPage");
  const locale = useLocale();
  const { data, loading, error } = useApiData(loadSummary, EMPTY_SUMMARY);
  const stats = [
    { label: t("stats.users"), value: data.totalUsers.toLocaleString(locale), icon: "group" },
    { label: t("stats.products"), value: data.totalProducts.toLocaleString(locale), icon: "inventory_2" },
    { label: t("stats.activeAuctions"), value: data.activeAuctions.toLocaleString(locale), icon: "gavel" },
    { label: t("stats.revenue"), value: `${data.totalRevenue.toLocaleString(locale)} ₫`, icon: "payments" },
  ];

  return <AdminShell><div className="mx-auto max-w-7xl px-6 py-10">
    <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">{t("controlCenter")}</p>
    <h1 className="font-display-lg mt-2 text-3xl">{t("title")}</h1>
    {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => <div key={item.label} className="glass-panel rounded-2xl p-6"><span className="material-symbols-outlined text-2xl text-[var(--luxora-gold)]">{item.icon}</span><p className="mt-4 text-xs text-white/40">{item.label}</p><p className="mt-2 text-2xl font-bold text-[var(--luxora-gold-light)]">{loading ? "—" : item.value}</p></div>)}
    </div>
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <section className="glass-panel rounded-2xl p-6 lg:col-span-2"><h2 className="font-headline-md text-lg">{t("cashFlow")}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label={t("totalTopUps")} value={data.totalTopUps} locale={locale} />
        <Metric label={t("depositsHeld")} value={data.depositsHeld} locale={locale} />
        <Metric label={t("adminBalance")} value={data.adminBalance} locale={locale} />
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"><p className="text-xs text-white/45">{t("pendingWithdrawals")}</p><p className="mt-1 text-lg font-semibold">{data.pendingWithdrawals}</p></div>
      </div></section>
      <section className="glass-panel rounded-2xl p-6"><h2 className="font-headline-md text-lg">{t("auctionSessions")}</h2><div className="mt-5 space-y-4 text-sm"><div className="flex justify-between"><span className="text-white/50">{t("totalSessions")}</span><span className="font-semibold">{data.totalAuctions}</span></div><div className="flex justify-between"><span className="text-white/50">{t("active")}</span><span className="font-semibold text-green-300">{data.activeAuctions}</span></div></div></section>
    </div>
  </div></AdminShell>;
}

function Metric({ label, value, locale }: { label: string; value: number; locale: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"><p className="text-xs text-white/45">{label}</p><p className="mt-1 text-lg font-semibold text-[var(--luxora-gold-light)]">{value.toLocaleString(locale)} ₫</p></div>;
}
