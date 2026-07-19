"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import type { WalletTransaction } from "@/lib/services/walletService";

function useTxTypes() {
  const t = useTranslations("walletLedger");
  const tCommon = useTranslations("common");
  return useMemo(
    () => [
      { value: "", label: tCommon("allTypes") },
      { value: "DEPOSIT", label: t("typeDeposit") },
      { value: "WITHDRAWAL", label: t("typeWithdrawal") },
      { value: "HOLD_BID", label: t("typeHoldBid") },
      { value: "AUCTION_PAYMENT", label: t("typeAuctionPayment") },
      { value: "AUCTION_PAYOUT", label: t("typeAuctionPayout") },
      { value: "REFUND_DEPOSIT", label: t("typeRefundDeposit") },
      { value: "FORFEIT_DEPOSIT", label: t("typeForfeitDeposit") },
      { value: "PLATFORM_COMMISSION", label: t("typePlatformCommission") },
      { value: "ADMIN_AUCTION_REVENUE", label: t("typeAdminAuctionRevenue") },
    ],
    [t, tCommon],
  );
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysAgoIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toIsoDate(d);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function formatDayKey(value: string): string {
  try {
    return new Date(value).toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return value.slice(0, 10);
  }
}

function statusBadge(status: string, tCommon: ReturnType<typeof useTranslations>) {
  const normalized = (status ?? "").toUpperCase();
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    COMPLETED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  const labels: Record<string, string> = {
    PENDING: tCommon("statusPending"),
    COMPLETED: tCommon("statusCompleted"),
    REJECTED: tCommon("statusRejected"),
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${styles[normalized] ?? "bg-slate-100 text-slate-700"}`}
    >
      {labels[normalized] ?? status}
    </span>
  );
}

export type LedgerFetchParams = {
  from: string;
  to: string;
  type?: string;
  userId?: number;
};

type Props = {
  mode: "user" | "admin";
  fetchTransactions: (params: LedgerFetchParams) => Promise<WalletTransaction[]>;
  title?: string;
  subtitle?: string;
};

export default function WalletBalanceLedger({
  mode,
  fetchTransactions,
  title,
  subtitle,
}: Props) {
  const t = useTranslations("walletLedger");
  const tCommon = useTranslations("common");
  const TX_TYPES = useTxTypes();
  const resolvedTitle = title ?? t("title");
  const resolvedSubtitle = subtitle ?? t("subtitle");
  const today = toIsoDate(new Date());
  const [from, setFrom] = useState(daysAgoIso(29));
  const [to, setTo] = useState(today);
  const [type, setType] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [groupByDay, setGroupByDay] = useState(false);
  const [rows, setRows] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = userIdFilter.trim() ? Number(userIdFilter.trim()) : undefined;
      const data = await fetchTransactions({
        from,
        to,
        type: type || undefined,
        userId: Number.isFinite(userId) ? userId : undefined,
      });
      setRows(data);
    } catch {
      setError(t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions, from, to, type, userIdFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    let credit = 0;
    let debit = 0;
    let platformRevenue = 0;
    for (const r of rows) {
      if (r.signedAmount >= 0) credit += r.signedAmount;
      else debit += Math.abs(r.signedAmount);
      const type = (r.transactionType ?? "").toUpperCase();
      if (
        type === "PLATFORM_COMMISSION" ||
        type === "ADMIN_AUCTION_REVENUE" ||
        type === "FORFEIT_DEPOSIT"
      ) {
        platformRevenue += Math.abs(r.amount ?? r.signedAmount ?? 0);
      }
    }
    return { credit, debit, net: credit - debit, platformRevenue };
  }, [rows]);

  const grouped = useMemo(() => {
    if (!groupByDay) return null;
    const map = new Map<string, WalletTransaction[]>();
    for (const r of rows) {
      const key = r.createdAt ? r.createdAt.slice(0, 10) : "unknown";
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [rows, groupByDay]);

  const applyPreset = (preset: "today" | "7d" | "30d") => {
    const end = toIsoDate(new Date());
    setTo(end);
    if (preset === "today") {
      setFrom(end);
    } else if (preset === "7d") {
      setFrom(daysAgoIso(6));
    } else {
      setFrom(daysAgoIso(29));
    }
  };

  return (
    <section className="space-y-md">
      <div>
        <h2 className="font-headline-sm text-headline-sm text-primary">{resolvedTitle}</h2>
        {resolvedSubtitle && <p className="mt-1 text-sm text-on-surface-variant">{resolvedSubtitle}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["today", "7d", "30d"] as const).map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => applyPreset(preset)}
            className="rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:border-primary hover:text-primary"
          >
            {preset === "today" ? t("presetToday") : preset === "7d" ? t("preset7d") : t("preset30d")}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <label className="flex flex-col gap-1 text-xs font-medium text-on-surface-variant">
          {tCommon("fromDate")}
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-on-surface-variant">
          {tCommon("toDate")}
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-on-surface-variant">
          {t("txTypeLabel")}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {TX_TYPES.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        {mode === "admin" && (
          <label className="flex flex-col gap-1 text-xs font-medium text-on-surface-variant">
            User ID
            <input
              type="number"
              min={1}
              placeholder={t("allUsers")}
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="w-32 rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        )}
        <label className="flex items-center gap-2 pb-2 text-sm text-on-surface-variant">
          <input
            type="checkbox"
            checked={groupByDay}
            onChange={(e) => setGroupByDay(e.target.checked)}
            className="rounded border-outline-variant"
          />
          {t("groupByDay")}
        </label>
        <button
          type="button"
          onClick={load}
          className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-on-primary"
        >
          {t("apply")}
        </button>
      </div>

      {!loading && rows.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
          {mode === "admin" && (
            <span>
              {t("platformRevenue")}:{" "}
              <strong className="text-[#d4aa61]">{formatCurrency(totals.platformRevenue)}</strong>
            </span>
          )}
          <span>
            {t("increase")}: <strong className="text-emerald-400">{formatCurrency(totals.credit)}</strong>
          </span>
          <span>
            {t("decrease")}: <strong className="text-red-400">{formatCurrency(totals.debit)}</strong>
          </span>
          <span>
            {t("net")}:{" "}
            <strong className={totals.net >= 0 ? "text-emerald-400" : "text-red-400"}>
              {formatCurrency(totals.net)}
            </strong>
            {mode === "admin" && (
              <span className="ml-1 text-xs text-on-surface-variant/80">({t("netHint")})</span>
            )}
          </span>
          <span>{t("transactionCount", { count: rows.length })}</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-error-container px-md py-sm text-on-error-container">{error}</div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-md text-sm text-on-surface-variant">
          {t("empty")}
        </p>
      ) : groupByDay && grouped ? (
        <div className="space-y-lg">
          {grouped.map(([day, dayRows]) => {
            const dayCredit = dayRows.filter((r) => r.signedAmount >= 0).reduce((s, r) => s + r.signedAmount, 0);
            const dayDebit = dayRows
              .filter((r) => r.signedAmount < 0)
              .reduce((s, r) => s + Math.abs(r.signedAmount), 0);
            return (
              <div key={day} className="overflow-hidden rounded-xl border border-surface-variant bg-surface soft-shadow">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-variant bg-surface-container-low px-md py-3">
                  <h3 className="font-semibold text-on-surface">{formatDayKey(day + "T12:00:00")}</h3>
                  <p className="text-xs text-on-surface-variant">
                    +{formatCurrency(dayCredit)} / −{formatCurrency(dayDebit)} · {dayRows.length} GD
                  </p>
                </div>
                <LedgerTable rows={dayRows} showUser={mode === "admin"} t={t} tCommon={tCommon} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-surface-variant bg-surface soft-shadow">
          <LedgerTable rows={rows} showUser={mode === "admin"} t={t} tCommon={tCommon} />
        </div>
      )}
    </section>
  );
}

function LedgerTable({
  rows,
  showUser,
  t,
  tCommon,
}: {
  rows: WalletTransaction[];
  showUser: boolean;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
}) {
  return (
    <table className="w-full min-w-[800px] text-left text-sm">
      <thead>
        <tr className="border-b border-surface-variant bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
          <th className="p-md">{t("colTime")}</th>
          {showUser && <th className="p-md">{t("colUser")}</th>}
          <th className="p-md">{t("colType")}</th>
          <th className="p-md">{t("colChange")}</th>
          <th className="p-md">{t("colStatus")}</th>
          <th className="p-md">{t("colRefDesc")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.transactionId} className="border-b border-surface-variant/50 hover:bg-surface-container-lowest">
            <td className="p-md whitespace-nowrap text-on-surface-variant">{formatDateTime(row.createdAt)}</td>
            {showUser && (
              <td className="p-md">
                <p className="font-medium text-on-surface">{row.userName}</p>
                {row.userId != null && <p className="text-xs text-on-surface-variant">#{row.userId}</p>}
              </td>
            )}
            <td className="p-md text-on-surface">{row.transactionTypeLabel}</td>
            <td className="p-md whitespace-nowrap font-bold">
              <span className={row.signedAmount >= 0 ? "text-emerald-400" : "text-red-400"}>
                {row.signedAmount >= 0 ? "+" : "−"}
                {formatCurrency(Math.abs(row.signedAmount))}
              </span>
              {showUser && (
                <p className="mt-0.5 text-[10px] font-normal text-on-surface-variant">
                  {row.signedAmount >= 0 ? t("walletCredit") : t("walletDebit")}
                </p>
              )}
            </td>
            <td className="p-md">{statusBadge(row.status, tCommon)}</td>
            <td className="p-md text-on-surface-variant">
              {row.referenceCode && <p className="font-mono text-xs">{row.referenceCode}</p>}
              <p className="line-clamp-2">{row.description ?? "—"}</p>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
