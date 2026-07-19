"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import CollectorShell from "@/components/layout/CollectorShell";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WalletCard from "@/components/dashboard/WalletCard";
import {
  createDepositQr,
  createWithdrawal,
  DepositQr,
  getMyTransactions,
  getMyWallet,
  getMyWithdrawals,
  Wallet,
  Withdrawal,
} from "@/lib/services/walletService";
import WalletBalanceLedger from "@/components/features/WalletBalanceLedger";
import { ApiError, clearStoredAuth, getStoredToken } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/I18nProvider";

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

function withdrawalStatusLabel(status: string, t: (key: string) => string) {
  switch (status.toUpperCase()) {
    case "PENDING":
      return t("withdrawStatusPending");
    case "COMPLETED":
      return t("withdrawStatusCompleted");
    case "REJECTED":
      return t("withdrawStatusRejected");
    default:
      return status;
  }
}

function withdrawalStatusClass(status: string) {
  switch (status.toUpperCase()) {
    case "PENDING":
      return "bg-amber-100 text-amber-800";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function WalletPage() {
  const t = useTranslations("wallet");
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [qr, setQr] = useState<DepositQr | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const availableBalance =
    wallet?.availableBalance ??
    Math.max(0, (wallet?.balance ?? 0) - (wallet?.holdBalance ?? 0));

  const fetchLedger = useCallback(
    (params: { from: string; to: string; type?: string }) =>
      getMyTransactions({ from: params.from, to: params.to, type: params.type }),
    [],
  );

  const refreshWallet = async () => {
    const [walletData, withdrawalData] = await Promise.all([
      getMyWallet(),
      getMyWithdrawals().catch(() => [] as Withdrawal[]),
    ]);
    setWallet(walletData);
    setWithdrawals(withdrawalData);
  };

  useEffect(() => {
    if (!getStoredToken()) {
      router.replace("/auth");
      return;
    }

    refreshWallet()
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          clearStoredAuth();
          router.replace("/auth");
          return;
        }
        setError(err instanceof Error ? err.message : t("unableToLoadWallet"));
      })
      .finally(() => setLoading(false));
  }, [router, t]);

  const handleDeposit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const amount = Number(depositAmount);
      const data = await createDepositQr(amount);
      setQr(data);
      setMessage(t("scanToDeposit"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unableToCreateDeposit"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await createWithdrawal({
        amount: Number(withdrawAmount),
        bankName,
        accountNumber,
        accountName,
      });
      setMessage(t("withdrawalSubmitted"));
      setWithdrawAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      await refreshWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unableToSubmitWithdrawal"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CollectorShell>
      <div className="mx-auto max-w-[1260px] space-y-7 px-4 py-10 sm:px-7 lg:px-10 lg:py-14">
        <DashboardHeader eyebrow="Secure payment vault" title={t("pageTitle")} subtitle={t("pageSubtitle")} />

        {error && (
          <div className="rounded-lg bg-error-container text-on-error-container px-md py-sm font-body-md">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant px-md py-sm font-body-md">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="md:col-span-2">
            <WalletCard
              balance={
                loading
                  ? t("loading")
                  : formatVnd(availableBalance).replace("₫", "")
              }
            />
            <p className="mt-3 px-2 text-xs text-[#9d948a]">
              {t("totalBalance")}: <strong className="text-[#f5ead9]">{formatVnd(wallet?.balance ?? 0)}</strong>
              {" · "}
              {t("lockedDeposits")}: <strong className="text-[#f5ead9]">{formatVnd(wallet?.holdBalance ?? 0)}</strong>
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0e0d0b] p-5 shadow-[0_8px_28px_rgba(18,31,44,.05)]">
            <h2 className="font-headline-sm text-headline-sm text-primary mb-sm">{t("deposit")}</h2>
            <form onSubmit={handleDeposit} className="space-y-sm">
              <input
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value)}
                type="number"
                min="1000"
                placeholder={t("amountVnd")}
                className="w-full rounded-xl border border-white/10 bg-[#0c0b0a] px-4 py-3 text-sm outline-none transition focus:border-[#b9974f] focus:ring-2 focus:ring-[#b9974f]/15"
                required
              />
              <button
                disabled={submitting}
                className="w-full rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-5 py-3 text-xs font-bold text-[#100d08] hover:brightness-110 disabled:opacity-60"
              >
                {t("generateVietQr")}
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <section className="rounded-2xl border border-white/10 bg-[#0e0d0b] p-6 shadow-[0_8px_28px_rgba(18,31,44,.05)]">
            <h2 className="font-headline-sm text-headline-sm text-primary mb-sm">{t("sepayQrCode")}</h2>
            {qr ? (
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-md items-start">
                <img src={qr.qrUrl} alt="SePay VietQR code" className="w-full max-w-[220px] rounded-lg border border-surface-variant" />
                <div className="space-y-xs font-body-md text-on-surface-variant">
                  <p><strong className="text-on-surface">{t("amount")}</strong> {formatVnd(qr.amount)}</p>
                  <p><strong className="text-on-surface">{t("bank")}</strong> {qr.bankId}</p>
                  <p><strong className="text-on-surface">{t("account")}</strong> {qr.bankAccount}</p>
                  <p><strong className="text-on-surface">{t("content")}</strong> {qr.content}</p>
                </div>
              </div>
            ) : (
              <p className="font-body-md text-on-surface-variant">{t("enterAmountToGenerate")}</p>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0e0d0b] p-6 shadow-[0_8px_28px_rgba(18,31,44,.05)]">
            <h2 className="font-headline-sm text-headline-sm text-primary mb-sm">{t("withdrawFunds")}</h2>
            <p className="mb-sm text-xs text-on-surface-variant">{t("withdrawHoldHint")}</p>
            <form onSubmit={handleWithdraw} className="grid grid-cols-1 md:grid-cols-2 gap-sm">
              <input value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} type="number" min="1000" max={availableBalance || undefined} placeholder={t("amountVnd")} className="rounded-xl border border-white/10 bg-[#0c0b0a] px-4 py-3 text-sm outline-none focus:border-[#b9974f]" required />
              <input value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder={t("bankName")} className="rounded-xl border border-white/10 bg-[#0c0b0a] px-4 py-3 text-sm outline-none focus:border-[#b9974f]" required />
              <input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder={t("accountNumber")} className="rounded-xl border border-white/10 bg-[#0c0b0a] px-4 py-3 text-sm outline-none focus:border-[#b9974f]" required />
              <input value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder={t("accountName")} className="rounded-xl border border-white/10 bg-[#0c0b0a] px-4 py-3 text-sm outline-none focus:border-[#b9974f]" required />
              <button disabled={submitting} className="md:col-span-2 rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-5 py-3 text-xs font-bold text-[#100d08] hover:brightness-110 disabled:opacity-60">
                {t("submitWithdrawal")}
              </button>
            </form>
          </section>
        </div>

        <WalletBalanceLedger mode="user" fetchTransactions={fetchLedger} />

        <section className="rounded-2xl border border-white/10 bg-[#0e0d0b] p-6 shadow-[0_8px_28px_rgba(18,31,44,.05)]">
          <h2 className="font-headline-sm text-headline-sm text-primary">{t("withdrawalRequests")}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{t("withdrawalRequestsDesc")}</p>

          {withdrawals.length === 0 ? (
            <p className="mt-md rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-md text-sm text-on-surface-variant">
              {t("noWithdrawalRequests")}
            </p>
          ) : (
            <div className="mt-md overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant text-xs uppercase tracking-wide text-on-surface-variant">
                    <th className="py-2 pr-4">{t("tableDate")}</th>
                    <th className="py-2 pr-4">{t("tableAmount")}</th>
                    <th className="py-2 pr-4">{t("tableBank")}</th>
                    <th className="py-2 pr-4">{t("tableStatus")}</th>
                    <th className="py-2">{t("tableNote")}</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((item) => (
                    <tr key={item.id} className="border-b border-outline-variant/40">
                      <td className="py-3 pr-4 whitespace-nowrap text-on-surface-variant">
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-primary">{formatVnd(item.amount)}</td>
                      <td className="py-3 pr-4 text-on-surface-variant">
                        {item.bankName}
                        <br />
                        <span className="text-xs">{item.accountNumber}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${withdrawalStatusClass(item.status)}`}>
                          {withdrawalStatusLabel(item.status, t)}
                        </span>
                      </td>
                      <td className="py-3 text-on-surface-variant">{item.staffNote ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </CollectorShell>
  );
}
