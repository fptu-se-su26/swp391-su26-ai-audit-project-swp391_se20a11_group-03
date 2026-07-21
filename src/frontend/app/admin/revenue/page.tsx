"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import AdminShell from "@/components/shells/AdminShell";
import LuxuryDatePicker from "@/components/ui/LuxuryDatePicker";
import {
  adminApi,
  type AdminDashboardSummary,
  type DailyRevenue,
  type SalesHistory,
} from "@/lib/api";

type ViewMode = "DAY" | "MONTH";
type AppliedRange = { from: string; to: string; groupBy: "day" | "month" };
type RevenueData = {
  summary: AdminDashboardSummary;
  revenue: DailyRevenue[];
  sales: SalesHistory[];
};

const EMPTY_SUMMARY: AdminDashboardSummary = {
  totalUsers: 0,
  totalProducts: 0,
  totalAuctions: 0,
  activeAuctions: 0,
  totalRevenue: 0,
  totalTopUps: 0,
  depositsHeld: 0,
  pendingWithdrawals: 0,
  adminBalance: 0,
};

function dateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function lastDaysRange(days: number): AppliedRange {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - Math.max(0, days - 1));
  return { from: dateValue(from), to: dateValue(to), groupBy: "day" };
}

export default function AdminRevenuePage() {
  const t = useTranslations("adminRevenuePage");
  const locale = useLocale();
  const now = new Date();
  const initialRange = useMemo(() => lastDaysRange(30), []);
  const [mode, setMode] = useState<ViewMode>("DAY");
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [year, setYear] = useState(now.getFullYear());
  const [appliedRange, setAppliedRange] = useState<AppliedRange>(initialRange);
  const [data, setData] = useState<RevenueData>({
    summary: EMPTY_SUMMARY,
    revenue: [],
    sales: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [summary, revenue, sales] = await Promise.all([
          adminApi.summary(),
          adminApi.revenue(appliedRange),
          adminApi.salesHistory(appliedRange),
        ]);
        if (!cancelled) {
          setData({ summary: summary.data, revenue: revenue.data, sales: sales.data });
          setSelectedPeriod(null);
        }
      } catch (reason: unknown) {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : t("loadError"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [appliedRange, t]);

  const maxValue = Math.max(1, ...data.revenue.map((item) => item.amount));
  const periodRevenue = data.revenue.reduce((sum, item) => sum + item.amount, 0);
  const totalTransactions = data.revenue.reduce((sum, item) => sum + item.count, 0);
  const selected = data.revenue.find((item) => item.date === selectedPeriod) ?? null;
  const years = Array.from({ length: 6 }, (_, index) => now.getFullYear() - index);

  const money = (value: number) => `${value.toLocaleString(locale)} ₫`;
  const labelForPeriod = (value: string) => {
    if (/^\d{4}-\d{2}$/.test(value)) {
      const [itemYear, month] = value.split("-").map(Number);
      return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(
        new Date(itemYear, month - 1, 1),
      );
    }
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit" }).format(date);
  };

  function applyRange() {
    setValidationError("");
    if (mode === "DAY") {
      if (!from || !to) {
        setValidationError(t("rangeRequired"));
        return;
      }
      if (from > to) {
        setValidationError(t("invalidRange"));
        return;
      }
      setAppliedRange({ from, to, groupBy: "day" });
      return;
    }
    setAppliedRange({
      from: `${year}-01-01`,
      to: `${year}-12-31`,
      groupBy: "month",
    });
  }

  function applyPreset(days: number) {
    const range = lastDaysRange(days);
    setMode("DAY");
    setFrom(range.from);
    setTo(range.to);
    setValidationError("");
    setAppliedRange(range);
  }

  const stats = [
    { icon: "payments", label: t("stats.periodRevenue"), value: money(periodRevenue) },
    { icon: "receipt_long", label: t("stats.transactions"), value: totalTransactions.toLocaleString(locale) },
    { icon: "group", label: t("stats.users"), value: data.summary.totalUsers.toLocaleString(locale) },
    { icon: "account_balance", label: t("stats.adminBalance"), value: money(data.summary.adminBalance) },
  ];

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">{t("controlCenter")}</p>
        <h1 className="font-display-lg mt-2 text-3xl">{t("title")}</h1>

        <section className="glass-panel mt-6 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{t("filters.title")}</h2>
              <p className="mt-1 text-xs text-[var(--luxora-text-muted)] opacity-70">{t("filters.description")}</p>
            </div>
            <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
              {(["DAY", "MONTH"] as ViewMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  aria-pressed={mode === item}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                    mode === item ? "bg-[var(--luxora-gold)] text-black" : "text-[var(--luxora-text-muted)]"
                  }`}
                >
                  {item === "DAY" ? t("filters.byDay") : t("filters.byMonth")}
                </button>
              ))}
            </div>
          </div>

          {mode === "DAY" ? (
            <div className="mt-5 grid items-end gap-4 md:grid-cols-[1fr_1fr_auto]">
              <label className="block text-xs font-semibold">
                <span className="mb-2 block text-[var(--luxora-text-muted)] opacity-75">{t("filters.from")}</span>
                <LuxuryDatePicker value={from} onChange={setFrom} max={to || undefined} ariaLabel={t("filters.from")} />
              </label>
              <label className="block text-xs font-semibold">
                <span className="mb-2 block text-[var(--luxora-text-muted)] opacity-75">{t("filters.to")}</span>
                <LuxuryDatePicker value={to} onChange={setTo} min={from || undefined} max={dateValue(now)} ariaLabel={t("filters.to")} />
              </label>
              <button type="button" onClick={applyRange} className="gradient-cta rounded-xl px-6 py-3 text-sm font-bold text-black">
                {t("filters.apply")}
              </button>
            </div>
          ) : (
            <div className="mt-5 grid items-end gap-4 sm:grid-cols-[1fr_auto]">
              <label className="block text-xs font-semibold">
                <span className="mb-2 block text-[var(--luxora-text-muted)] opacity-75">{t("filters.year")}</span>
                <select
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--luxora-text)] outline-none focus:border-[var(--luxora-gold)]"
                >
                  {years.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <button type="button" onClick={applyRange} className="gradient-cta rounded-xl px-6 py-3 text-sm font-bold text-black">
                {t("filters.viewYear")}
              </button>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => applyPreset(days)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-[var(--luxora-text-muted)] transition hover:border-[var(--luxora-gold)]"
              >
                {t("filters.lastDays", { days })}
              </button>
            ))}
          </div>
          {validationError && <p className="mt-3 text-sm text-red-300">{validationError}</p>}
        </section>

        {error && <p className="mt-5 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="glass-panel rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs text-[var(--luxora-text-muted)] opacity-70">
                <span className="material-symbols-outlined text-lg text-[var(--luxora-gold)]">{item.icon}</span>
                {item.label}
              </div>
              <p className="mt-3 text-2xl font-bold text-[var(--luxora-gold-light)]">{loading ? "—" : item.value}</p>
            </div>
          ))}
        </div>

        <section className="glass-panel mt-8 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider">{appliedRange.groupBy === "month" ? t("monthlyRevenue") : t("dailyRevenue")}</h2>
              <p className="mt-1 text-xs text-[var(--luxora-text-muted)] opacity-65">{t("chartHint")}</p>
            </div>
            {selected && (
              <div className="rounded-xl border border-[var(--luxora-gold)]/25 bg-[var(--luxora-gold)]/10 px-4 py-2 text-right text-xs">
                <p className="font-semibold">{labelForPeriod(selected.date)}</p>
                <p className="mt-1 text-[var(--luxora-gold-light)]">{money(selected.amount)} · {t("transactionCount", { count: selected.count })}</p>
              </div>
            )}
          </div>
          <div className="mt-7 overflow-x-auto pb-2">
            <div className="flex h-56 min-w-[720px] items-end gap-2 border-b border-white/10 px-1">
              {data.revenue.map((item) => (
                <button
                  key={item.date}
                  type="button"
                  onClick={() => setSelectedPeriod(item.date)}
                  className="group flex h-full min-w-5 flex-1 flex-col items-center justify-end gap-2"
                  title={`${labelForPeriod(item.date)}: ${money(item.amount)}`}
                >
                  <span
                    className={`w-full rounded-t-md transition group-hover:bg-[var(--luxora-gold-light)] ${
                      selectedPeriod === item.date ? "bg-[var(--luxora-gold-light)]" : "bg-[var(--luxora-gold)]/65"
                    }`}
                    style={{ height: `${Math.max(3, (item.amount / maxValue) * 88)}%` }}
                  />
                  <span className="h-8 text-[9px] text-[var(--luxora-text-muted)] opacity-65 [writing-mode:vertical-rl]">
                    {labelForPeriod(item.date)}
                  </span>
                </button>
              ))}
              {!loading && data.revenue.length === 0 && (
                <p className="m-auto text-sm text-[var(--luxora-text-muted)] opacity-60">{t("noRevenue")}</p>
              )}
            </div>
          </div>
        </section>

        <div className="mb-4 mt-10 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-headline-md text-lg">{t("recentTransactions")}</h2>
          <span className="text-xs text-[var(--luxora-text-muted)] opacity-65">{t("rows", { count: data.sales.length })}</span>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-[var(--luxora-text-muted)] opacity-70">
                <th className="px-5 py-3">Lot #</th>
                <th className="px-5 py-3">{t("productFlow")}</th>
                <th className="px-5 py-3">{t("salePrice")}</th>
                <th className="px-5 py-3">{t("commission")}</th>
                <th className="px-5 py-3">{t("date")}</th>
                <th className="px-5 py-3">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {data.sales.map((row) => (
                <tr key={row.auctionId} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4 text-[var(--luxora-gold)]">LOT-{row.productId}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{row.productName}</p>
                    <p className="mt-1 text-xs text-[var(--luxora-text-muted)] opacity-65">{row.sellerName} → {row.buyerName}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[var(--luxora-gold-light)]">{money(row.finalPrice)}</td>
                  <td className="px-5 py-4">{money(row.commission)}</td>
                  <td className="px-5 py-4 text-[var(--luxora-text-muted)] opacity-75">
                    {row.paidAt ? new Intl.DateTimeFormat(locale).format(new Date(row.paidAt)) : "—"}
                  </td>
                  <td className="px-5 py-4"><span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-300">{row.paymentStatus ?? row.status}</span></td>
                </tr>
              ))}
              {!loading && data.sales.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[var(--luxora-text-muted)] opacity-60">{t("noTransactions")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
