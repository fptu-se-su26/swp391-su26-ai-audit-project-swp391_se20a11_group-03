"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import AdminShell from "@/components/shells/AdminShell";
import { adminApi, type AuctionSessionHistory } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

async function loadHistory(): Promise<AuctionSessionHistory[]> { return (await adminApi.auctionSessions()).data; }

export default function AuctionHistoryPage() {
  const t = useTranslations("adminAuctionHistoryPage");
  const locale = useLocale();
  const { data: rows, loading, error } = useApiData(loadHistory, []);
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("ALL");
  const filtered = useMemo(() => rows.filter((row) => (payment === "ALL" || row.paymentCategory === payment) && `${row.productName} ${row.sellerName} ${row.buyerName}`.toLowerCase().includes(query.toLowerCase())), [payment, query, rows]);
  const average = rows.length ? rows.reduce((sum, row) => sum + row.finalPrice, 0) / rows.length : 0;
  const paid = rows.filter((row) => row.paymentCategory === "PAID").length;
  return <AdminShell><div className="mx-auto max-w-7xl px-6 py-10"><h1 className="font-display-lg text-3xl">{t("title")}</h1>
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">{[
      [t("endedSessions"), rows.length.toLocaleString(locale)], [t("averageSale"), `${Math.round(average).toLocaleString(locale)} ₫`], [t("paid"), paid.toLocaleString(locale)], [t("unpaid"), (rows.length - paid).toLocaleString(locale)],
    ].map(([label, value]) => <div key={label} className="glass-panel rounded-2xl p-6"><p className="text-xs text-white/40">{label}</p><p className="mt-2 text-2xl font-bold text-[var(--luxora-gold-light)]">{loading ? "—" : value}</p></div>)}</div>
    <div className="mt-6 flex flex-wrap gap-3"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("searchPlaceholder")} className="min-w-[220px] flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]" /><select value={payment} onChange={(event) => setPayment(event.target.value)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"><option value="ALL">{t("allPayments")}</option><option value="PAID">{t("paid")}</option><option value="UNPAID">{t("unpaid")}</option></select></div>
    <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40"><th className="px-5 py-3">{t("lotNumber")}</th><th className="px-5 py-3">{t("product")}</th><th className="px-5 py-3">{t("seller")}</th><th className="px-5 py-3">{t("buyer")}</th><th className="px-5 py-3">{t("finalPrice")}</th><th className="px-5 py-3">{t("endDate")}</th><th className="px-5 py-3">{t("payment")}</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.auctionId} className="border-b border-white/5"><td className="px-5 py-4 text-[var(--luxora-gold)]">LOT-{row.productId}</td><td className="px-5 py-4 font-medium">{row.productName}</td><td className="px-5 py-4 text-white/60">{row.sellerName}</td><td className="px-5 py-4 text-white/60">{row.buyerName}</td><td className="px-5 py-4 font-semibold text-[var(--luxora-gold-light)]">{row.finalPrice.toLocaleString(locale)} ₫</td><td className="px-5 py-4 text-white/60">{row.endTime ? new Intl.DateTimeFormat(locale).format(new Date(row.endTime)) : "—"}</td><td className="px-5 py-4">{row.paymentCategory}</td></tr>)}{!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-white/45">{error ?? t("empty")}</td></tr>}</tbody></table></div>
  </div></AdminShell>;
}
