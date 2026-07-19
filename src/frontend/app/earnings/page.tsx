"use client";

import { useTranslations } from "next-intl";
import CollectorShell from "@/components/shells/CollectorShell";
import { walletApi, type WalletInfo, type Withdrawal } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

type EarningsData = { wallet: WalletInfo; withdrawals: Withdrawal[] };

const EMPTY_DATA: EarningsData = {
  wallet: { walletId: 0, userId: 0, balance: 0, holdBalance: 0, availableBalance: 0, status: "" },
  withdrawals: [],
};

async function loadEarnings(): Promise<EarningsData> {
  const [wallet, withdrawals] = await Promise.all([
    walletApi.get(),
    walletApi.withdrawals(),
  ]);
  return { wallet, withdrawals };
}

export default function EarningsPage() {
  const t = useTranslations("earnings");
  const { data, loading, error } = useApiData(loadEarnings, EMPTY_DATA);
  const pendingAmount = data.withdrawals
    .filter((item) => item.status.toUpperCase() === "PENDING")
    .reduce((sum, item) => sum + item.amount, 0);
  const latestBank = data.withdrawals[0];
  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">{t("title")}</h1>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">{t("netIncome")}</p>
            <p className="mt-2 text-2xl font-bold text-[var(--luxora-gold-light)]">
              {data.wallet.balance.toLocaleString("vi-VN")} ₫
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">{t("pending")}</p>
            <p className="mt-2 text-2xl font-bold">{pendingAmount.toLocaleString("vi-VN")} ₫</p>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">{t("available")}</p>
            <p className="mt-2 text-2xl font-bold">{data.wallet.availableBalance.toLocaleString("vi-VN")} ₫</p>
            <button
              type="button"
              className="gradient-cta mt-4 w-full rounded-full py-2.5 text-xs font-semibold text-black"
            >
              {t("withdraw")}
            </button>
          </div>
        </div>

        <div className="glass-panel mt-6 flex items-center justify-between rounded-2xl p-6">
          <div>
            <p className="text-xs text-white/40">{t("bankInfo")}</p>
            <p className="mt-1 text-sm font-semibold">
              {latestBank
                ? `${latestBank.bankName} ****${latestBank.accountNumber.slice(-4)}`
                : t("noBankAccount")}
            </p>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-[var(--luxora-gold)] hover:underline"
          >
            {t("editAccount")}
          </button>
        </div>

        <h2 className="font-headline-md mt-10 mb-4 text-lg">
          {t("paymentHistory")}
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">{t("col.date")}</th>
                <th className="px-5 py-3 font-medium">{t("col.ref")}</th>
                <th className="px-5 py-3 font-medium">{t("col.amount")}</th>
                <th className="px-5 py-3 font-medium">{t("col.account")}</th>
                <th className="px-5 py-3 font-medium">{t("col.status")}</th>
              </tr>
            </thead>
            <tbody>
              {data.withdrawals.map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="px-5 py-4 text-white/60">
                    {new Intl.DateTimeFormat("vi-VN").format(new Date(p.createdAt))}
                  </td>
                  <td className="px-5 py-4 text-white/60">WD-{p.id}</td>
                  <td className="px-5 py-4 font-semibold text-[var(--luxora-gold-light)]">
                    {p.amount.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-5 py-4 text-white/60">
                    {p.bankName} ****{p.accountNumber.slice(-4)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        p.status.toUpperCase() === "COMPLETED"
                          ? "bg-green-500/10 text-green-300"
                          : "bg-yellow-500/10 text-yellow-300"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && data.withdrawals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-white/45">
                    {error ?? t("empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </CollectorShell>
  );
}
