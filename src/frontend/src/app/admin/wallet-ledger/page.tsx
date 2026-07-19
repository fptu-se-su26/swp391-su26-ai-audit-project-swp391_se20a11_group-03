"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import WalletBalanceLedger from "@/components/features/WalletBalanceLedger";
import {
  WalletLedgerRow,
  getBalanceLedger,
  getDepositHistory,
  getWithdrawalHistory,
} from "@/lib/services/dashboardService";
import { useTranslations } from "@/i18n/I18nProvider";

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

function statusBadge(
  status: string,
  labels: Record<string, string>,
) {
  const normalized = status.toUpperCase();
  const styles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    COMPLETED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${styles[normalized] ?? "bg-slate-100 text-slate-700"}`}>
      {labels[normalized] ?? status}
    </span>
  );
}

export default function WalletLedgerPage() {
  const t = useTranslations("adminWalletLedger");
  const [tab, setTab] = useState<"ledger" | "deposits" | "withdrawals">("ledger");
  const [deposits, setDeposits] = useState<WalletLedgerRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WalletLedgerRow[]>([]);
  const [withdrawFilter, setWithdrawFilter] = useState<"ALL" | "PENDING" | "COMPLETED" | "REJECTED">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusLabels = useMemo(
    () => ({
      PENDING: t("statusPending"),
      COMPLETED: t("statusCompleted"),
      REJECTED: t("statusRejected"),
    }),
    [t],
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getDepositHistory(), getWithdrawalHistory()])
      .then(([depositRows, withdrawalRows]) => {
        setDeposits(depositRows);
        setWithdrawals(withdrawalRows);
      })
      .catch(() => setError(t("loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  const filteredDeposits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deposits;
    return deposits.filter(
      (r) =>
        r.userName.toLowerCase().includes(q) ||
        (r.userEmail ?? "").toLowerCase().includes(q) ||
        (r.referenceCode ?? "").toLowerCase().includes(q),
    );
  }, [deposits, search]);

  const filteredWithdrawals = useMemo(() => {
    let rows = withdrawals;
    if (withdrawFilter !== "ALL") {
      rows = rows.filter((r) => r.status.toUpperCase() === withdrawFilter);
    }
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.userName.toLowerCase().includes(q) ||
        (r.userEmail ?? "").toLowerCase().includes(q) ||
        (r.bankName ?? "").toLowerCase().includes(q) ||
        (r.accountNumber ?? "").includes(q),
    );
  }, [withdrawals, withdrawFilter, search]);

  const depositTotal = filteredDeposits
    .filter((r) => r.status?.toUpperCase() === "COMPLETED")
    .reduce((s, r) => s + r.amount, 0);

  const fetchLedger = useCallback(
    (params: { from: string; to: string; type?: string; userId?: number }) =>
      getBalanceLedger({
        from: params.from,
        to: params.to,
        type: params.type,
        userId: params.userId,
      }),
    [],
  );

  return (
    <AdminShell>
      <div className="mx-auto max-w-[1400px] space-y-lg p-margin-mobile md:p-margin-desktop">
        <div>
          <h1 className="font-display-lg-mobile text-primary md:font-display-lg">{t("pageTitle")}</h1>
          <p className="mt-xs font-body-lg text-on-surface-variant">{t("pageSubtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("ledger")}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
              tab === "ledger" ? "bg-primary text-on-primary" : "border border-outline-variant bg-surface text-on-surface-variant"
            }`}
          >
            {t("tabLedger")}
          </button>
          <button
            type="button"
            onClick={() => setTab("deposits")}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
              tab === "deposits" ? "bg-primary text-on-primary" : "border border-outline-variant bg-surface text-on-surface-variant"
            }`}
          >
            {t("tabDeposits")}
          </button>
          <button
            type="button"
            onClick={() => setTab("withdrawals")}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
              tab === "withdrawals" ? "bg-primary text-on-primary" : "border border-outline-variant bg-surface text-on-surface-variant"
            }`}
          >
            {t("tabWithdrawals")}
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {tab !== "ledger" && (
            <>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full max-w-md rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary sm:flex-1"
              />
              {tab === "withdrawals" && (
                <select
                  value={withdrawFilter}
                  onChange={(e) => setWithdrawFilter(e.target.value as typeof withdrawFilter)}
                  className="rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
                >
                  <option value="ALL">{t("allStatuses")}</option>
                  <option value="PENDING">{t("statusPending")}</option>
                  <option value="COMPLETED">{t("statusCompleted")}</option>
                  <option value="REJECTED">{t("statusRejected")}</option>
                </select>
              )}
            </>
          )}
        </div>

        {error && tab !== "ledger" && (
          <div className="rounded-lg bg-error-container px-md py-sm text-on-error-container">{error}</div>
        )}

        {tab === "ledger" ? (
          <WalletBalanceLedger
            mode="admin"
            fetchTransactions={fetchLedger}
            subtitle={t("ledgerSubtitle")}
          />
        ) : loading ? (
          <div className="flex h-48 items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : tab === "deposits" ? (
          <div className="space-y-md">
            <p className="text-sm text-on-surface-variant">
              {t("depositTotal")} <strong className="text-primary">{formatCurrency(depositTotal)}</strong>
              {" · "}{t("transactionCount", { count: filteredDeposits.length })}
            </p>
            <div className="overflow-x-auto rounded-xl border border-surface-variant bg-surface soft-shadow">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-surface-variant bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
                    <th className="p-md">{t("tableTime")}</th>
                    <th className="p-md">{t("tableUser")}</th>
                    <th className="p-md">{t("tableAmount")}</th>
                    <th className="p-md">{t("tableStatus")}</th>
                    <th className="p-md">{t("tableRefDesc")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeposits.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-md text-on-surface-variant">{t("noDeposits")}</td>
                    </tr>
                  ) : (
                    filteredDeposits.map((row) => (
                      <tr key={row.id} className="border-b border-surface-variant/50 hover:bg-surface-container-lowest">
                        <td className="p-md whitespace-nowrap text-sm">{formatDateTime(row.createdAt)}</td>
                        <td className="p-md">
                          <p className="font-medium text-on-surface">{row.userName}</p>
                          <p className="text-xs text-on-surface-variant">{row.userEmail ?? "—"}</p>
                        </td>
                        <td className="p-md font-bold text-primary whitespace-nowrap">{formatCurrency(row.amount)}</td>
                        <td className="p-md">{statusBadge(row.status, statusLabels)}</td>
                        <td className="p-md text-sm text-on-surface-variant">
                          {row.referenceCode && <p>{row.referenceCode}</p>}
                          <p className="line-clamp-2">{row.description ?? "—"}</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-surface-variant bg-surface soft-shadow">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
                  <th className="p-md">{t("tableTime")}</th>
                  <th className="p-md">{t("tableUser")}</th>
                  <th className="p-md">{t("tableAmount")}</th>
                  <th className="p-md">{t("tableBank")}</th>
                  <th className="p-md">{t("tableStatus")}</th>
                  <th className="p-md">{t("tableNote")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-md text-on-surface-variant">{t("noWithdrawals")}</td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((row) => (
                    <tr key={row.id} className="border-b border-surface-variant/50 hover:bg-surface-container-lowest">
                      <td className="p-md whitespace-nowrap text-sm">{formatDateTime(row.createdAt)}</td>
                      <td className="p-md">
                        <p className="font-medium text-on-surface">{row.userName}</p>
                        <p className="text-xs text-on-surface-variant">{row.userEmail ?? "—"}</p>
                      </td>
                      <td className="p-md font-bold text-primary whitespace-nowrap">{formatCurrency(row.amount)}</td>
                      <td className="p-md text-sm text-on-surface-variant">
                        <p>{row.bankName}</p>
                        <p>{row.accountNumber} · {row.accountName}</p>
                      </td>
                      <td className="p-md">{statusBadge(row.status, statusLabels)}</td>
                      <td className="p-md text-sm text-on-surface-variant">{row.staffNote ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
