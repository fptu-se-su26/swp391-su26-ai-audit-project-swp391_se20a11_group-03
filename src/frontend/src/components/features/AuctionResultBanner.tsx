"use client";

import Link from "next/link";
import { useTranslations } from "@/i18n/I18nProvider";
import { getStoredUser } from "@/lib/userSession";
import { canPayForWonAuction, isForfeitedPayment } from "@/lib/auctionPayment";

type AuctionResultBannerProps = {
  productName: string;
  productId: number;
  finalPrice: number;
  winnerUsername?: string | null;
  winnerUserId?: number | null;
  paymentStatus?: string | null;
  paymentDeadline?: string | null;
  variant?: "default" | "luxe";
  className?: string;
};

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export default function AuctionResultBanner({
  productName,
  productId,
  finalPrice,
  winnerUsername,
  winnerUserId,
  paymentStatus,
  paymentDeadline,
  variant = "luxe",
  className = "",
}: AuctionResultBannerProps) {
  const t = useTranslations("auctionResult");
  const tCommon = useTranslations("common");
  const me = getStoredUser();
  const amWinner =
    me?.userId != null &&
    winnerUserId != null &&
    Number(me.userId) === Number(winnerUserId);
  const hasWinner = Boolean(winnerUsername || winnerUserId);
  const isPaid = paymentStatus === "PAID";
  const forfeited = isForfeitedPayment(paymentStatus, paymentDeadline);
  const canPay = canPayForWonAuction(paymentStatus, paymentDeadline);

  const isLuxe = variant === "luxe";

  const shellClass = isLuxe
    ? forfeited && amWinner
      ? "border-red-500/40 bg-red-950/40"
      : amWinner
        ? "border-[#d4aa61]/50 bg-[#1a1610]"
        : "border-white/10 bg-[#0e0d0b]"
    : forfeited && amWinner
      ? "border-error/40 bg-error-container/25"
      : amWinner
        ? "border-secondary/50 bg-secondary-container/30"
        : "border-outline-variant bg-surface-container-low";

  const titleClass = isLuxe ? "text-[#f5ead9]" : "text-primary";
  const mutedClass = isLuxe ? "text-[#b7aea3]" : "text-on-surface-variant";
  const priceClass = isLuxe ? "text-[#efcf88]" : "text-primary";
  const iconClass =
    forfeited && amWinner
      ? isLuxe ? "text-red-400" : "text-error"
      : isLuxe ? "text-[#efcf88]" : "text-secondary";
  const winnerAccent = isLuxe ? "text-[#efcf88]" : "text-secondary";

  return (
    <div className={`rounded-xl border p-lg text-center ${shellClass} ${className}`}>
      <span className={`material-symbols-outlined text-5xl ${iconClass}`}>
        {forfeited && amWinner ? "money_off" : amWinner ? "emoji_events" : hasWinner ? "flag" : "hourglass_disabled"}
      </span>
      <h2 className={`mt-sm font-headline-md text-headline-md ${titleClass}`}>
        {forfeited && amWinner
          ? t("paymentOverdue")
          : amWinner
            ? t("congratulations")
            : t("sessionEnded")}
      </h2>
      <p className={`mt-xs text-sm ${mutedClass}`}>{productName}</p>

      <div className="mt-md space-y-xs">
        <p className={`font-label-sm text-label-sm uppercase tracking-widest ${mutedClass}`}>
          {t("finalPrice")}
        </p>
        <p className={`text-[32px] font-bold ${priceClass}`}>{formatVnd(finalPrice)}</p>
      </div>

      {hasWinner ? (
        <p className={`mt-md ${isLuxe ? "text-[#f5ead9]" : "text-on-surface"}`}>
          {t("winner")}:{" "}
          <span className={`font-bold ${winnerAccent}`}>
            {amWinner ? tCommon("you") : winnerUsername ?? `#${winnerUserId}`}
          </span>
        </p>
      ) : (
        <p className={`mt-md ${mutedClass}`}>{t("noWinner")}</p>
      )}

      {amWinner && forfeited && (
        <p className={`mt-md rounded-md border px-4 py-3 text-sm ${
          isLuxe
            ? "border-red-500/40 bg-red-950/50 text-red-300"
            : "border-error/30 bg-error-container/30 text-error"
        }`}>
          {t("forfeitDepositMsg")}
        </p>
      )}

      {amWinner && canPay && !isPaid && (
        <Link
          href={`/auctions/${productId}`}
          className={`mt-md inline-block rounded-md px-md py-sm font-label-md ${
            isLuxe
              ? "bg-[#c99a4b] text-[#100d08] hover:brightness-110"
              : "bg-secondary text-on-secondary hover:opacity-90"
          }`}
        >
          {t("payNow")}
        </Link>
      )}

      {amWinner && isPaid && (
        <p className={`mt-md inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
          isLuxe
            ? "border border-[#3f9d78]/40 bg-[#3f9d78]/20 text-[#8bd6b6]"
            : "bg-tertiary-fixed text-on-tertiary-fixed-variant"
        }`}>
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          {t("paid")}
        </p>
      )}

      {!amWinner && hasWinner && (
        <Link
          href="/live"
          className={`mt-md inline-block rounded-md border px-md py-sm ${
            isLuxe
              ? "border-white/15 text-[#f5ead9] hover:bg-white/5"
              : "border-outline-variant text-on-surface hover:bg-surface-container-low"
          }`}
        >
          {t("viewOtherSessions")}
        </Link>
      )}
    </div>
  );
}
