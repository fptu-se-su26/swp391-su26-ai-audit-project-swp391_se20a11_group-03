"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CollectorShell from "@/components/shells/CollectorShell";
import { ApiError, walletApi, type WalletInfo, type Withdrawal } from "@/lib/api";
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
  const tw = useTranslations("walletPage");
  const { data, loading, error, reload } = useApiData(loadEarnings, EMPTY_DATA);
  const pendingAmount = data.withdrawals
    .filter((item) => item.status.toUpperCase() === "PENDING")
    .reduce((sum, item) => sum + item.amount, 0);
  const latestBank = data.withdrawals[0];

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState(latestBank?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState(latestBank?.accountNumber ?? "");
  const [accountName, setAccountName] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  const numericWithdrawAmount = Number(withdrawAmount.replace(/\D/g, ""));

  function openWithdraw() {
    setShowWithdraw(true);
    setWithdrawError("");
    setWithdrawSuccess("");
  }

  async function submitWithdraw(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess("");

    if (!Number.isSafeInteger(numericWithdrawAmount) || numericWithdrawAmount < 10_000) {
      setWithdrawError(tw("withdrawMinError"));
      return;
    }
    if (numericWithdrawAmount > data.wallet.availableBalance) {
      setWithdrawError(tw("withdrawExceedError"));
      return;
    }

    setWithdrawing(true);
    try {
      await walletApi.withdraw({
        amount: numericWithdrawAmount,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
      });
      setWithdrawSuccess(tw("withdrawSuccess"));
      setWithdrawAmount("");
      await reload();
    } catch (cause) {
      setWithdrawError(cause instanceof ApiError ? cause.message : tw("withdrawError"));
    } finally {
      setWithdrawing(false);
    }
  }

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
              onClick={openWithdraw}
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
            onClick={openWithdraw}
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

      {showWithdraw ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="withdraw-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowWithdraw(false);
          }}
        >
          <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-white/15 bg-[var(--luxora-bg-elevated)] p-5 text-[var(--luxora-text)] shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={() => setShowWithdraw(false)}
              title={tw("closeBtn")}
              aria-label={tw("closeBtn")}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[var(--luxora-text)]/50 transition-colors hover:bg-white/10 hover:text-[var(--luxora-text)]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 id="withdraw-title" className="font-headline-md pr-12 text-xl text-[var(--luxora-text)]">
              {tw("withdrawModalTitle")}
            </h2>
            <p className="mt-1 text-sm text-[var(--luxora-text)]/60">
              {tw("withdrawModalSubtitle", {
                balance: `${data.wallet.availableBalance.toLocaleString("vi-VN")} ₫`,
              })}
            </p>

            <form onSubmit={submitWithdraw} className="mt-6 flex flex-col gap-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--luxora-text)]/60">
                  {tw("withdrawAmountLabel")}
                </span>
                <div className="mt-2 flex h-12 items-center rounded-lg border border-white/15 bg-[var(--luxora-bg-soft)] px-4 focus-within:border-[var(--luxora-gold)]">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={
                      numericWithdrawAmount
                        ? numericWithdrawAmount.toLocaleString("vi-VN")
                        : ""
                    }
                    onChange={(event) =>
                      setWithdrawAmount(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder={tw("withdrawMinPlaceholder")}
                    className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-[var(--luxora-text)] outline-none placeholder:text-[var(--luxora-text)]/40"
                  />
                  <span className="text-sm text-[var(--luxora-text)]/45">₫</span>
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--luxora-text)]/60">
                  {tw("withdrawBankLabel")}
                </span>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  placeholder={tw("withdrawBankExample")}
                  className="mt-2 h-12 w-full rounded-lg border border-white/15 bg-[var(--luxora-bg-soft)] px-4 text-sm text-[var(--luxora-text)] outline-none placeholder:text-[var(--luxora-text)]/40 focus:border-[var(--luxora-gold)]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--luxora-text)]/60">
                  {tw("withdrawAccountLabel")}
                </span>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(event) =>
                    setAccountNumber(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder={tw("withdrawAccountPlaceholder")}
                  className="mt-2 h-12 w-full rounded-lg border border-white/15 bg-[var(--luxora-bg-soft)] px-4 text-sm text-[var(--luxora-text)] outline-none placeholder:text-[var(--luxora-text)]/40 focus:border-[var(--luxora-gold)]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--luxora-text)]/60">
                  {tw("withdrawHolderLabel")}
                </span>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  placeholder={tw("withdrawHolderPlaceholder")}
                  className="mt-2 h-12 w-full rounded-lg border border-white/15 bg-[var(--luxora-bg-soft)] px-4 text-sm text-[var(--luxora-text)] outline-none placeholder:text-[var(--luxora-text)]/40 focus:border-[var(--luxora-gold)]"
                />
              </label>

              {withdrawError ? (
                <p className="text-sm text-red-500">{withdrawError}</p>
              ) : null}
              {withdrawSuccess ? (
                <p className="text-sm text-green-600">{withdrawSuccess}</p>
              ) : null}

              <button
                type="submit"
                disabled={withdrawing}
                className="gradient-cta h-11 w-full rounded-full text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {withdrawing ? tw("withdrawSubmitting") : tw("withdrawSubmitBtn")}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </CollectorShell>
  );
}
