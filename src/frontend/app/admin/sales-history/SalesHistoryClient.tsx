"use client";

import { useLocale, useTranslations } from "next-intl";
import { adminApi, type SalesHistory } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

async function loadSales(): Promise<SalesHistory[]> {
  return (await adminApi.salesHistory()).data ?? [];
}

function fmt(date: string | null, locale: string) {
  return date
    ? new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(date))
    : "—";
}

export default function SalesHistoryClient() {
  const t = useTranslations("adminSalesHistoryPage");
  const locale = useLocale();
  const vnd = new Intl.NumberFormat(locale);
  const { data: rows, loading, error } = useApiData(loadSales, []);

  const totalRevenue = rows.reduce((sum, r) => sum + (r.commission ?? 0), 0);
  const totalVolume = rows.reduce((sum, r) => sum + (r.finalPrice ?? 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
        {t("badge")}
      </p>
      <h1 className="font-display-lg mt-2 text-3xl">{t("title")}</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-[11px] text-white/40">{t("transactions")}</p>
          <p className="mt-1 text-2xl font-bold">{rows.length}</p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-[11px] text-white/40">{t("totalVolume")}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--luxora-gold-light)]">
            {vnd.format(totalVolume)} ₫
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-[11px] text-white/40">{t("platformCommission")}</p>
          <p className="mt-1 text-2xl font-bold text-green-300">{vnd.format(totalRevenue)} ₫</p>
        </div>
      </div>

      <div className="glass-panel mt-6 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-white/40">
              <th className="px-4 py-3">{t("product")}</th>
              <th className="px-4 py-3">{t("seller")}</th>
              <th className="px-4 py-3">{t("buyer")}</th>
              <th className="px-4 py-3 text-right">{t("closingPrice")}</th>
              <th className="px-4 py-3 text-right">{t("commission")}</th>
              <th className="px-4 py-3 text-right">{t("sellerPayout")}</th>
              <th className="px-4 py-3">{t("payment")}</th>
              <th className="px-4 py-3">{t("time")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.auctionId} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <p className="font-medium">{r.productName}</p>
                  <p className="text-[11px] text-white/40">{t("session", { id: r.auctionId })}</p>
                </td>
                <td className="px-4 py-3 text-white/60">{r.sellerName}</td>
                <td className="px-4 py-3 text-white/60">{r.buyerName}</td>
                <td className="px-4 py-3 text-right font-semibold text-[var(--luxora-gold-light)]">
                  {vnd.format(r.finalPrice)} ₫
                </td>
                <td className="px-4 py-3 text-right text-green-300">{vnd.format(r.commission)} ₫</td>
                <td className="px-4 py-3 text-right text-white/60">{vnd.format(r.sellerPayout)} ₫</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      "PAID".toUpperCase() === (r.paymentStatus ?? "").toUpperCase()
                        ? "bg-green-500/10 text-green-300"
                        : "bg-yellow-500/10 text-yellow-300"
                    }`}
                  >
                    {r.paymentStatus ?? r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/50">{fmt(r.paidAt, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-6 text-center text-sm text-white/40">{t("loading")}</p>}
        {!loading && rows.length === 0 && (
          <p className="p-6 text-center text-sm text-white/40">{error ?? t("empty")}</p>
        )}
      </div>
    </div>
  );
}
