"use client";

import { useEffect, useState, useCallback } from "react";
import CollectorShell from "@/components/layout/CollectorShell";
import { useTranslations } from "@/i18n/I18nProvider";
import { getMyWallet, getMyWithdrawals, Withdrawal } from "@/lib/services/walletService";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  PROCESSED: { label: "", class: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  PENDING: { label: "", class: "bg-secondary-container text-on-secondary-container" },
  REJECTED: { label: "", class: "bg-error-container text-on-error-container" },
};

export default function EarningsPage() {
  const t = useTranslations("earnings");
  const [wallet, setWallet] = useState<{ balance: number; holdBalance: number } | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusLabels: Record<string, string> = {
    COMPLETED: t("processed"),
    PROCESSED: t("processed"),
    PENDING: t("pending"),
    REJECTED: t("rejected"),
  };

  const fetchData = useCallback(async () => {
    try {
      const [walletData, withdrawalsData] = await Promise.all([
        getMyWallet().catch(() => null),
        getMyWithdrawals().catch(() => []),
      ]);
      setWallet(walletData);
      setWithdrawals(withdrawalsData);
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const balance = wallet?.balance || 0;
  const holdBalance = wallet?.holdBalance || 0;
  const availableBalance = balance - holdBalance;

  if (loading) {
    return (
      <CollectorShell>
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        </div>
      </CollectorShell>
    );
  }

  if (error) {
    return (
      <CollectorShell>
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          <div className="bg-error-container rounded-xl p-lg text-center">
            <p className="text-on-error-container">{error}</p>
          </div>
        </div>
      </CollectorShell>
    );
  }

  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{t("title")}</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">
            {t("subtitle")}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
            <p className="font-label-md text-label-md text-on-surface-variant mb-xs">{t("currentBalance")}</p>
            <h3 className="font-headline-md text-headline-md md:text-[32px] md:leading-[40px] font-bold text-primary">
              {formatCurrency(balance)}
            </h3>
            <div className="mt-md flex items-center text-on-tertiary-container text-xs">
              <span className="material-symbols-outlined text-[16px] mr-1">account_balance</span>
              <span>{t("totalWalletBalance")}</span>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
            <p className="font-label-md text-label-md text-on-surface-variant mb-xs">{t("holdBalance")}</p>
            <h3 className="font-headline-md text-headline-md md:text-[32px] md:leading-[40px] font-bold text-primary">
              {formatCurrency(holdBalance)}
            </h3>
            <p className="mt-md text-[12px] text-on-surface-variant leading-tight">
              {t("fundsReserved")}
            </p>
          </div>

          <div className="bg-surface rounded-xl p-md soft-shadow border border-secondary/20 bg-gradient-to-br from-surface to-secondary-container/5">
            <p className="font-label-md text-label-md text-on-surface-variant mb-xs">{t("availableToWithdraw")}</p>
            <h3 className="font-headline-md text-headline-md md:text-[32px] md:leading-[40px] font-bold text-primary">
              {formatCurrency(availableBalance)}
            </h3>
            <button
              className="w-full mt-md bg-secondary text-on-secondary font-label-md py-sm rounded-lg hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-colors glow-accent"
              disabled={availableBalance <= 0}
            >
              {t("withdrawFunds")}
            </button>
          </div>
        </div>

        {/* Payout History */}
        <section className="space-y-md">
          <h2 className="font-headline-sm text-headline-sm text-primary border-b border-surface-variant pb-xs">
            {t("withdrawalHistory")}
          </h2>
          {withdrawals.length === 0 ? (
            <div className="bg-surface rounded-xl p-lg text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-md">payments</span>
              <p className="text-on-surface-variant">{t("noWithdrawalHistory")}</p>
            </div>
          ) : (
            <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-variant">
                    {[t("date"), t("reference"), t("amount"), t("destination"), t("status")].map((h) => (
                      <th key={h} className="p-md font-label-sm text-label-sm text-on-surface-variant">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-body-md text-sm">
                  {withdrawals.map((payout) => {
                    const cfg = STATUS_CONFIG[payout.status] || { label: payout.status, class: "bg-surface-variant text-on-surface-variant" };
                    cfg.label = statusLabels[payout.status] || payout.status;
                    const shortRef = `WD-${payout.id}`;

                    return (
                      <tr key={payout.id} className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                        <td className="p-md text-on-surface whitespace-nowrap">{formatDate(payout.createdAt)}</td>
                        <td className="p-md font-mono text-xs text-on-surface-variant">{shortRef}</td>
                        <td className="p-md font-bold text-primary">{formatCurrency(payout.amount)}</td>
                        <td className="p-md text-on-surface-variant">
                          {payout.bankName} ****{payout.accountNumber.slice(-4)}
                        </td>
                        <td className="p-md">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.class}`}>
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </CollectorShell>
  );
}
