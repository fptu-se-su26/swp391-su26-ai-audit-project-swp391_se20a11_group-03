"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import CollectorShell from "@/components/shells/CollectorShell";
import {
  ApiError,
  walletApi,
  type DepositQrResponse,
  type WalletInfo,
  type WalletTransaction,
} from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

type WalletData = { wallet: WalletInfo; transactions: WalletTransaction[] };

async function loadWallet(): Promise<WalletData> {
  const [wallet, transactions] = await Promise.all([
    walletApi.get(),
    walletApi.transactions(),
  ]);
  return { wallet, transactions };
}

const EMPTY_WALLET: WalletData = {
  wallet: {
    walletId: 0,
    userId: 0,
    balance: 0,
    holdBalance: 0,
    availableBalance: 0,
    status: "",
  },
  transactions: [],
};

const DEPOSIT_PRESETS = [100_000, 500_000, 1_000_000, 5_000_000];

function formatVnd(value: number) {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

export default function WalletPage() {
  const t = useTranslations("walletPage");
  const { data, setData, loading, error } = useApiData(
    loadWallet,
    EMPTY_WALLET,
  );
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [amount, setAmount] = useState("100000");
  const [depositQr, setDepositQr] = useState<DepositQrResponse | null>(null);
  const [balanceBeforeDeposit, setBalanceBeforeDeposit] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [actionError, setActionError] = useState("");
  const [depositStatus, setDepositStatus] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [qrImageError, setQrImageError] = useState(false);

  const numericAmount = Number(amount.replace(/\D/g, ""));

  function openDeposit() {
    setShowDeposit(true);
    setDepositQr(null);
    setActionError("");
    setDepositStatus("");
    setCopiedField("");
    setQrImageError(false);
  }

  function closeDeposit() {
    setShowDeposit(false);
    setDepositQr(null);
    setActionError("");
    setDepositStatus("");
    setQrImageError(false);
  }

  async function createDepositQr(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Number.isSafeInteger(numericAmount) || numericAmount < 1_000) {
      setActionError(t("depositMinError"));
      return;
    }

    setSubmitting(true);
    setActionError("");
    setDepositStatus("");
    try {
      const qr = await walletApi.deposit(numericAmount);
      setBalanceBeforeDeposit(data.wallet.balance);
      setDepositQr(qr);
      setQrImageError(false);
    } catch (cause) {
      setActionError(
        cause instanceof ApiError
          ? cause.message
          : t("depositError"),
      );
    } finally {
      setSubmitting(false);
    }
  }

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
      setWithdrawError(t("withdrawMinError"));
      return;
    }
    if (numericWithdrawAmount > data.wallet.availableBalance) {
      setWithdrawError(t("withdrawExceedError"));
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
      setWithdrawSuccess(t("withdrawSuccess"));
      setWithdrawAmount("");
      const nextData = await loadWallet();
      setData(nextData);
    } catch (cause) {
      setWithdrawError(
        cause instanceof ApiError
          ? cause.message
          : t("withdrawError"),
      );
    } finally {
      setWithdrawing(false);
    }
  }

  async function copyValue(field: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(""), 1500);
    } catch {
      setActionError(t("depositCopyError"));
    }
  }

  async function checkDeposit() {
    setChecking(true);
    setActionError("");
    try {
      const nextData = await loadWallet();
      setData(nextData);
      if (nextData.wallet.balance > balanceBeforeDeposit) {
        setDepositStatus(
          t("depositReceived", { amount: formatVnd(nextData.wallet.balance - balanceBeforeDeposit) }),
        );
      } else {
        setDepositStatus(t("depositPending"));
      }
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : t("depositCheckError"),
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">{t("title")}</h1>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">{t("availableBalance")}</p>
            <p className="mt-2 text-2xl font-bold text-[var(--luxora-gold-light)]">
              {data.wallet.availableBalance.toLocaleString("vi-VN")} ₫
            </p>
            <button
              type="button"
              onClick={openDeposit}
              className="gradient-cta mt-4 w-full rounded-full py-2.5 text-xs font-semibold text-black"
            >
              {t("depositBtn")}
            </button>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">{t("holdBalance")}</p>
            <p className="mt-2 text-2xl font-bold">
              {data.wallet.holdBalance.toLocaleString("vi-VN")} ₫
            </p>
            <button
              type="button"
              onClick={openWithdraw}
              className="mt-4 w-full rounded-full border border-white/15 py-2.5 text-xs font-semibold hover:border-[var(--luxora-gold)]"
            >
              {t("withdrawBtn")}
            </button>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">{t("totalAssets")}</p>
            <p className="mt-2 text-2xl font-bold">
              {data.wallet.balance.toLocaleString("vi-VN")} ₫
            </p>
          </div>
        </div>

        <h2 className="font-headline-md mt-10 mb-4 text-lg">
          {t("transactionHistory")}
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">{t("colDate")}</th>
                <th className="px-5 py-3 font-medium">{t("colType")}</th>
                <th className="px-5 py-3 font-medium">{t("colDesc")}</th>
                <th className="px-5 py-3 font-medium">{t("colAmount")}</th>
                <th className="px-5 py-3 font-medium">{t("colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((tx) => (
                <tr key={tx.transactionId} className="border-b border-white/5">
                  <td className="px-5 py-4 text-white/60">
                    {new Intl.DateTimeFormat("vi-VN").format(
                      new Date(tx.createdAt),
                    )}
                  </td>
                  <td className="px-5 py-4">{tx.transactionTypeLabel}</td>
                  <td className="px-5 py-4 text-white/60">{tx.description}</td>
                  <td
                    className={`px-5 py-4 font-semibold ${
                      tx.signedAmount >= 0 ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {tx.signedAmount >= 0 ? "+" : ""}
                    {tx.signedAmount.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        tx.status.toUpperCase() === "COMPLETED"
                          ? "bg-green-500/10 text-green-300"
                          : "bg-yellow-500/10 text-yellow-300"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && data.transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-white/45">
                    {error ?? t("noTransactions")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDeposit ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deposit-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDeposit();
          }}
        >
          <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-white/15 bg-[#111] p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={closeDeposit}
              title={t("closeBtn")}
              aria-label={t("closeBtn")}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 id="deposit-title" className="font-headline-md pr-12 text-xl">
              {t("depositModalTitle")}
            </h2>
            <p className="mt-1 text-sm text-white/50">
              {t("depositModalSubtitle")}
            </p>

            {!depositQr ? (
              <form onSubmit={createDepositQr} className="mt-6">
                <label
                  htmlFor="deposit-amount"
                  className="text-xs font-semibold uppercase tracking-wider text-white/60"
                >
                  {t("depositAmountLabel")}
                </label>
                <div className="mt-2 flex h-12 items-center rounded-lg border border-white/15 bg-[var(--luxora-bg-soft)] px-4 focus-within:border-[var(--luxora-gold)]">
                  <input
                    id="deposit-amount"
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={numericAmount ? numericAmount.toLocaleString("vi-VN") : ""}
                    onChange={(event) =>
                      setAmount(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder={t("depositMinPlaceholder")}
                    className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none"
                  />
                  <span className="text-sm text-white/45">₫</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DEPOSIT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(String(preset))}
                      className={`h-10 rounded-lg border text-xs font-semibold transition-colors ${
                        numericAmount === preset
                          ? "border-[var(--luxora-gold)] bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold-light)]"
                          : "border-white/10 text-white/65 hover:border-white/25"
                      }`}
                    >
                      {preset.toLocaleString("vi-VN")}
                    </button>
                  ))}
                </div>

                {actionError ? (
                  <p className="mt-4 text-sm text-red-300">{actionError}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="gradient-cta mt-6 h-11 w-full rounded-full text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? t("depositCreatingBtn") : t("depositCreateBtn")}
                </button>
              </form>
            ) : (
              <div className="mt-5">
                <div className="mx-auto w-fit overflow-hidden rounded-lg bg-white p-2">
                  <Image
                    src={depositQr.qrUrl}
                    alt={`VietQR ${formatVnd(depositQr.amount)}`}
                    width={280}
                    height={280}
                    unoptimized
                    priority
                    onError={() => setQrImageError(true)}
                    className="h-auto w-[260px] sm:w-[280px]"
                  />
                </div>

                {qrImageError ? (
                  <div className="mt-3 rounded-lg border border-yellow-400/25 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-100">
                    {t.rich("depositQrError", {
                      link: (chunks) => (
                        <a
                          href={depositQr.qrUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[var(--luxora-gold-light)] underline"
                        >
                          {chunks}
                        </a>
                      ),
                    })}
                  </div>
                ) : null}

                <dl className="mt-5 divide-y divide-white/10 border-y border-white/10 text-sm">
                  <DepositDetail label={t("depositDetailAmount")} value={formatVnd(depositQr.amount)} />
                  <DepositDetail
                    label={t("depositDetailAccount")}
                    value={depositQr.bankAccount}
                    onCopy={() =>
                      void copyValue("account", depositQr.bankAccount)
                    }
                    copied={copiedField === "account"}
                    copiedLabel={t("copiedBtn")}
                    copyLabel={t("copyBtn", { label: t("depositDetailAccount").toLowerCase() })}
                  />
                  <DepositDetail
                    label={t("depositDetailHolder")}
                    value={depositQr.accountName}
                  />
                  <DepositDetail
                    label={t("depositDetailContent")}
                    value={depositQr.content}
                    emphasize
                    onCopy={() => void copyValue("content", depositQr.content)}
                    copied={copiedField === "content"}
                    copiedLabel={t("copiedBtn")}
                    copyLabel={t("copyBtn", { label: t("depositDetailContent").toLowerCase() })}
                  />
                </dl>

                {actionError ? (
                  <p className="mt-4 text-sm text-red-300">{actionError}</p>
                ) : null}
                {depositStatus ? (
                  <p
                    className={`mt-4 text-sm ${
                      depositStatus.startsWith(t("depositReceived", { amount: "" }).slice(0, 5))
                        ? "text-green-300"
                        : "text-yellow-200"
                    }`}
                  >
                    {depositStatus}
                  </p>
                ) : null}

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDepositQr(null);
                      setDepositStatus("");
                      setQrImageError(false);
                    }}
                    className="h-11 flex-1 rounded-full border border-white/15 text-sm font-semibold hover:border-white/30"
                  >
                    {t("depositChangeAmount")}
                  </button>
                  <button
                    type="button"
                    onClick={() => void checkDeposit()}
                    disabled={checking}
                    className="gradient-cta h-11 flex-1 rounded-full text-sm font-bold text-black disabled:opacity-50"
                  >
                    {checking ? t("depositChecking") : t("depositCheckBalance")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
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
          <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-white/15 bg-[#111] p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={() => setShowWithdraw(false)}
              title={t("closeBtn")}
              aria-label={t("closeBtn")}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 id="withdraw-title" className="font-headline-md pr-12 text-xl">
              {t("withdrawModalTitle")}
            </h2>
            <p className="mt-1 text-sm text-white/50">
              {t("withdrawModalSubtitle", { balance: formatVnd(data.wallet.availableBalance) })}
            </p>

            <form onSubmit={submitWithdraw} className="mt-6 flex flex-col gap-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t("withdrawAmountLabel")}
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
                    placeholder={t("withdrawMinPlaceholder")}
                    className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none"
                  />
                  <span className="text-sm text-white/45">₫</span>
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t("withdrawBankLabel")}
                </span>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  placeholder={t("withdrawBankExample")}
                  className="mt-2 h-12 w-full rounded-lg border border-white/15 bg-[var(--luxora-bg-soft)] px-4 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t("withdrawAccountLabel")}
                </span>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(event) =>
                    setAccountNumber(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder={t("withdrawAccountPlaceholder")}
                  className="mt-2 h-12 w-full rounded-lg border border-white/15 bg-[var(--luxora-bg-soft)] px-4 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t("withdrawHolderLabel")}
                </span>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  placeholder={t("withdrawHolderPlaceholder")}
                  className="mt-2 h-12 w-full rounded-lg border border-white/15 bg-[var(--luxora-bg-soft)] px-4 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
                />
              </label>

              {withdrawError ? (
                <p className="text-sm text-red-300">{withdrawError}</p>
              ) : null}
              {withdrawSuccess ? (
                <p className="text-sm text-green-300">{withdrawSuccess}</p>
              ) : null}

              <button
                type="submit"
                disabled={withdrawing}
                className="gradient-cta h-11 w-full rounded-full text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {withdrawing ? t("withdrawSubmitting") : t("withdrawSubmitBtn")}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </CollectorShell>
  );
}

function DepositDetail({
  label,
  value,
  emphasize = false,
  onCopy,
  copied = false,
  copyLabel,
  copiedLabel,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
}) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-white/45">{label}</dt>
      <dd className="flex min-w-0 items-center justify-end gap-2 text-right">
        <span
          className={`break-all font-semibold ${
            emphasize ? "text-[var(--luxora-gold-light)]" : "text-white"
          }`}
        >
          {value}
        </span>
        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            title={copied ? copiedLabel : copyLabel}
            aria-label={copied ? copiedLabel : copyLabel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">
              {copied ? "check" : "content_copy"}
            </span>
          </button>
        ) : null}
      </dd>
    </div>
  );
}
