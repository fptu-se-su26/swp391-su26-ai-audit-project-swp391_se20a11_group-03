"use client";

import { useTranslations } from "@/i18n/I18nProvider";

type Props = {
  balance: string;
  currency?: string;
};

export default function WalletCard({ balance, currency = "VND" }: Props) {
  const t = useTranslations("wallet");

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#d4aa61]/25 bg-[#0c0b09] p-7 text-white shadow-[0_24px_70px_rgba(0,0,0,.5)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_15%,rgba(212,170,97,.28),transparent_32%),radial-gradient(circle_at_8%_90%,rgba(201,154,75,.16),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-7 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d4aa61]/60 to-transparent" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[.2em] text-[#e7c57c]">{t("availableBalance")}</span>
          <span className="material-symbols-outlined text-[#e7c57c]">account_balance_wallet</span>
        </div>
        <p className="mt-6 font-display-lg text-3xl font-black tracking-[-.04em]">
          {balance} <span className="text-sm font-medium text-[#b7aea3]">{currency}</span>
        </p>
        <p className="mt-2 text-xs text-[#b7aea3]">{t("securePayment")}</p>
        <div className="mt-7 flex gap-2">
          <button className="rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-5 py-2.5 text-xs font-bold text-[#100d08] transition hover:brightness-110">
            {t("deposit")}
          </button>
          <button className="rounded-full border border-[#d4aa61]/40 px-5 py-2.5 text-xs font-semibold text-[#f0d98b] transition hover:bg-[#d4aa61]/10">
            {t("withdraw")}
          </button>
        </div>
      </div>
    </div>
  );
}
