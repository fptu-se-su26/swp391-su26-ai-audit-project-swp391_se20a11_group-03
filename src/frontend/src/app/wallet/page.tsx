"use client";

import { FormEvent, useEffect, useState } from "react";
import CollectorShell from "@/components/layout/CollectorShell";
import {
  createDepositQr,
  createWithdrawal,
  DepositQr,
  getMyWallet,
  Wallet,
} from "@/lib/services/walletService";
import { ApiError, clearStoredAuth, getStoredToken } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/I18nProvider";

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export default function WalletPage() {
  const t = useTranslations("wallet");
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
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

  const refreshWallet = async () => {
    const data = await getMyWallet();
    setWallet(data);
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
  }, [router]);

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
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{t("pageTitle")}</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">{t("pageSubtitle")}</p>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="md:col-span-2 bg-primary-container text-on-primary rounded-xl p-lg soft-shadow">
            <p className="font-label-md text-label-md text-on-primary/60 uppercase tracking-widest mb-xs">{t("availableBalance")}</p>
            <h2 className="text-[40px] md:text-[48px] font-bold leading-none text-secondary-fixed mb-md">
              {loading ? t("loading") : formatVnd(wallet?.balance ?? 0)}
            </h2>
            <div>
              <p className="font-label-sm text-label-sm text-on-primary/60">{t("lockedDeposits")}</p>
              <p className="font-headline-sm text-headline-sm font-bold">{formatVnd(wallet?.holdBalance ?? 0)}</p>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
            <h2 className="font-headline-sm text-headline-sm text-primary mb-sm">{t("deposit")}</h2>
            <form onSubmit={handleDeposit} className="space-y-sm">
              <input
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value)}
                type="number"
                min="1000"
                placeholder={t("amountVnd")}
                className="w-full rounded-lg border border-outline-variant bg-surface px-sm py-sm"
                required
              />
              <button
                disabled={submitting}
                className="w-full bg-secondary text-on-secondary rounded-lg px-md py-sm font-label-md hover:opacity-90 disabled:opacity-60"
              >
                {t("generateVietQr")}
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <section className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
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

          <section className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
            <h2 className="font-headline-sm text-headline-sm text-primary mb-sm">{t("withdrawFunds")}</h2>
            <form onSubmit={handleWithdraw} className="grid grid-cols-1 md:grid-cols-2 gap-sm">
              <input value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} type="number" min="1000" placeholder={t("amountVnd")} className="rounded-lg border border-outline-variant bg-surface px-sm py-sm" required />
              <input value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder={t("bankName")} className="rounded-lg border border-outline-variant bg-surface px-sm py-sm" required />
              <input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder={t("accountNumber")} className="rounded-lg border border-outline-variant bg-surface px-sm py-sm" required />
              <input value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder={t("accountName")} className="rounded-lg border border-outline-variant bg-surface px-sm py-sm" required />
              <button disabled={submitting} className="md:col-span-2 bg-primary text-on-primary rounded-lg px-md py-sm font-label-md hover:opacity-90 disabled:opacity-60">
                {t("submitWithdrawal")}
              </button>
            </form>
          </section>
        </div>
      </div>
    </CollectorShell>
  );
}
