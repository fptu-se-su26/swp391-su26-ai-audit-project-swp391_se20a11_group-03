"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  userApi,
  walletApi,
  type UserProfile,
  type WalletInfo,
  type WalletTransaction,
} from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

type WalletData = {
  wallet: WalletInfo;
  transactions: WalletTransaction[];
};

async function loadProfile(): Promise<UserProfile> {
  return (await userApi.profile()).data;
}

async function loadWallet(): Promise<WalletData> {
  const [wallet, transactions] = await Promise.all([
    walletApi.get(),
    walletApi.transactions(),
  ]);
  return { wallet, transactions };
}

const EMPTY_PROFILE: UserProfile = {
  userId: 0,
  fullName: "",
  email: "",
  emailVerified: false,
  phone: null,
  phoneVerified: false,
  phoneVerifiedAt: null,
  identityNumber: null,
  roleName: "",
  status: "",
  identityVerified: false,
  profileStatus: null,
  identityVerifiedAt: null,
  active: false,
  paymentStrikeCount: 0,
  lockedByPaymentStrikes: false,
};

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

type InfoItemProps = {
  icon: string;
  label: string;
  children: React.ReactNode;
};

function InfoItem({ icon, label, children }: InfoItemProps) {
  return (
    <div className="flex min-h-[66px] gap-3 border-b border-[#eee7dc] py-3 last:border-b-0">
      <span className="material-symbols-outlined mt-0.5 text-[20px] text-[#667085]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-[#667085]">{label}</p>
        <div className="mt-1 text-sm font-semibold text-[#17151b]">{children}</div>
      </div>
    </div>
  );
}

export default function ProfileClient() {
  const t = useTranslations("profilePage");
  const locale = useLocale();
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
  const { data: profile, setData, loading, error } = useApiData(
    loadProfile,
    EMPTY_PROFILE,
  );
  const {
    data: walletData,
    loading: walletLoading,
    error: walletError,
  } = useApiData(loadWallet, EMPTY_WALLET);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function startEditing() {
    setFullName(profile.fullName);
    setSaveError("");
    setEditing(true);
  }

  function cancelEditing() {
    setFullName(profile.fullName);
    setSaveError("");
    setEditing(false);
  }

  async function save() {
    if (!fullName.trim()) {
      setSaveError(t("fullNameRequired"));
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const response = await userApi.updateProfile(fullName.trim());
      setData(response.data);
      setEditing(false);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  function formatMoney(value: number) {
    return `${value.toLocaleString(dateLocale)} đ`;
  }

  function transactionStatus(status: string) {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "SUCCESS":
        return t("statusCompleted");
      case "FAILED":
      case "CANCELLED":
        return t("statusFailed");
      default:
        return t("statusPending");
    }
  }

  const initials = profile.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#faf8f4] text-[#17151b]">
      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b5790a]">
              {t("accountEyebrow")}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-xl border border-[#ded6ca] bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-[#c99a42] disabled:opacity-50"
                >
                  {t("cancelBtn")}
                </button>
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d69417] to-[#e8b64f] px-4 py-2.5 text-sm font-bold text-[#2c1c02] shadow-[0_8px_22px_rgba(207,145,29,0.22)] transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {saving ? t("saving") : t("saveBtn")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                disabled={loading || Boolean(error)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f3dfb8] px-4 py-2.5 text-sm font-bold text-[#2c1c02] transition hover:bg-[#edcf94] disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                {t("editBtn")}
              </button>
            )}
          </div>
        </header>

        {(error || saveError) && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError || error}
          </div>
        )}

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#e9e2d8] bg-white shadow-[0_12px_40px_rgba(74,55,28,0.06)]">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f7e9cb] to-[#edc979] text-2xl font-bold text-[#94600a] ring-4 ring-[#fbf6ec]">
              {initials || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="truncate text-xl font-bold">
                  {profile.fullName || t("loading")}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    profile.identityVerified
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-[#fbf0da] text-[#a66b06]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {profile.identityVerified ? "verified" : "shield"}
                  </span>
                  {profile.identityVerified
                    ? t("verifiedBadge")
                    : t("notVerifiedBadge")}
                </span>
              </div>
              <p className="mt-1 text-sm capitalize text-[#667085]">
                {profile.roleName || t("memberFallback")}
              </p>
            </div>
            <Link
              href="/security"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-[#e6dccd] px-4 py-2.5 text-sm font-semibold text-[#7c5a1b] transition hover:border-[#d19a35] hover:bg-[#fffaf0] sm:self-center"
            >
              <span className="material-symbols-outlined text-[18px]">shield_lock</span>
              {t("securityLink")}
            </Link>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-[#e9e2d8] bg-white p-5 shadow-[0_12px_40px_rgba(74,55,28,0.05)] sm:p-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#5e6472]">
            {t("accountInfoTitle")}
          </h2>
          <div className="mt-2 grid grid-cols-1 gap-x-10 md:grid-cols-2">
            <div>
              <InfoItem icon="person" label={t("fullNameLabel")}>
                {editing ? (
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full rounded-lg border border-[#ded6ca] bg-[#fffdfa] px-3 py-2 outline-none transition focus:border-[#d39a32] focus:ring-2 focus:ring-[#e4b65e]/20"
                  />
                ) : (
                  profile.fullName || "—"
                )}
              </InfoItem>
              <InfoItem icon="call" label={t("phoneLabel")}>
                {profile.phone || t("notUpdated")}
              </InfoItem>
              <InfoItem icon="badge" label={t("idNumberLabel")}>
                {profile.identityNumber || t("noIdNumber")}
              </InfoItem>
            </div>
            <div>
              <InfoItem icon="mail" label={t("emailLabel")}>
                <span className="break-all">{profile.email || "—"}</span>
              </InfoItem>
              <InfoItem icon="groups" label={t("roleLabel")}>
                <span className="capitalize">
                  {profile.roleName || t("memberFallback")}
                </span>
              </InfoItem>
              <InfoItem icon="account_circle" label={t("accountStatusLabel")}>
                <span className={profile.active ? "text-emerald-700" : "text-amber-700"}>
                  {profile.active ? t("activeStatus") : t("inactiveStatus")}
                </span>
              </InfoItem>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{t("walletTitle")}</h2>
              <p className="mt-1 text-sm text-[#667085]">{t("walletSubtitle")}</p>
            </div>
            <Link
              href="/wallet"
              className="hidden items-center gap-1 text-sm font-bold text-[#a66b06] hover:text-[#754900] sm:inline-flex"
            >
              {t("manageWallet")}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <article className="rounded-2xl border border-[#e9e2d8] bg-white p-5 shadow-[0_10px_30px_rgba(74,55,28,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-[#667085]">{t("availableBalance")}</p>
                  <p className="mt-2 text-2xl font-bold">
                    {walletLoading ? "—" : formatMoney(walletData.wallet.availableBalance)}
                  </p>
                </div>
                <span className="material-symbols-outlined rounded-full bg-[#fbf0da] p-3 text-[#c3840e]">
                  account_balance_wallet
                </span>
              </div>
              <Link
                href="/wallet"
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#d69417] to-[#e8b64f] py-2.5 text-sm font-bold text-[#2c1c02] transition hover:brightness-105"
              >
                {t("depositBtn")}
              </Link>
            </article>

            <article className="rounded-2xl border border-[#e9e2d8] bg-white p-5 shadow-[0_10px_30px_rgba(74,55,28,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-[#667085]">{t("holdBalance")}</p>
                  <p className="mt-2 text-2xl font-bold">
                    {walletLoading ? "—" : formatMoney(walletData.wallet.holdBalance)}
                  </p>
                </div>
                <span className="material-symbols-outlined rounded-full bg-[#f7f2e9] p-3 text-[#b87b0d]">
                  lock
                </span>
              </div>
              <Link
                href="/wallet"
                className="mt-4 flex w-full items-center justify-center rounded-xl border border-[#ded6ca] py-2.5 text-sm font-bold transition hover:border-[#d39a32] hover:bg-[#fffaf0]"
              >
                {t("withdrawBtn")}
              </Link>
            </article>

            <article className="rounded-2xl border border-[#e9e2d8] bg-white p-5 shadow-[0_10px_30px_rgba(74,55,28,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-[#667085]">{t("totalAssets")}</p>
                  <p className="mt-2 text-2xl font-bold">
                    {walletLoading ? "—" : formatMoney(walletData.wallet.balance)}
                  </p>
                  <p className="mt-4 text-xs text-[#8a8f9b]">{t("totalAssetsHint")}</p>
                </div>
                <span className="material-symbols-outlined rounded-full bg-[#fbf0da] p-3 text-[#c3840e]">
                  data_usage
                </span>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#e9e2d8] bg-white shadow-[0_12px_40px_rgba(74,55,28,0.05)]">
          <div className="flex items-center justify-between border-b border-[#eee7dc] px-5 py-4">
            <div>
              <h2 className="text-lg font-bold">{t("transactionHistory")}</h2>
              <p className="mt-0.5 text-xs text-[#7b8190]">{t("transactionSubtitle")}</p>
            </div>
            <Link
              href="/wallet"
              className="text-sm font-bold text-[#a66b06] hover:text-[#754900]"
            >
              {t("viewAll")}
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#faf8f4] text-[11px] uppercase tracking-wider text-[#667085]">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t("colDate")}</th>
                  <th className="px-5 py-3 font-semibold">{t("colType")}</th>
                  <th className="px-5 py-3 font-semibold">{t("colDescription")}</th>
                  <th className="px-5 py-3 font-semibold">{t("colAmount")}</th>
                  <th className="px-5 py-3 font-semibold">{t("colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {walletData.transactions.slice(0, 5).map((transaction) => {
                  const completed = ["COMPLETED", "SUCCESS"].includes(
                    transaction.status.toUpperCase(),
                  );
                  const failed = ["FAILED", "CANCELLED"].includes(
                    transaction.status.toUpperCase(),
                  );
                  return (
                    <tr
                      key={transaction.transactionId}
                      className="border-t border-[#f0ebe3] transition hover:bg-[#fffdf9]"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 text-[#667085]">
                        {new Intl.DateTimeFormat(dateLocale, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }).format(new Date(transaction.createdAt))}
                      </td>
                      <td className="px-5 py-3.5 font-semibold">
                        {transaction.transactionTypeLabel || transaction.transactionType}
                      </td>
                      <td className="max-w-[300px] truncate px-5 py-3.5 text-[#667085]">
                        {transaction.description || transaction.referenceCode || "—"}
                      </td>
                      <td
                        className={`whitespace-nowrap px-5 py-3.5 font-bold ${
                          transaction.signedAmount >= 0
                            ? "text-emerald-700"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.signedAmount > 0 ? "+" : ""}
                        {formatMoney(transaction.signedAmount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            completed
                              ? "bg-emerald-50 text-emerald-700"
                              : failed
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {transactionStatus(transaction.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!walletLoading && walletData.transactions.length === 0 && (
            <div className="flex flex-col items-center px-5 py-9 text-center">
              <span className="material-symbols-outlined text-5xl text-[#ded6ca]">
                inventory_2
              </span>
              <p className="mt-2 font-bold text-[#4e5563]">{t("emptyTransactions")}</p>
              <p className="mt-1 text-sm text-[#8a8f9b]">{t("emptyTransactionsDesc")}</p>
            </div>
          )}

          {walletError && (
            <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
              {walletError}
            </div>
          )}
        </section>

        <Link
          href="/wallet"
          className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#a66b06] sm:hidden"
        >
          {t("manageWallet")}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </main>
  );
}
