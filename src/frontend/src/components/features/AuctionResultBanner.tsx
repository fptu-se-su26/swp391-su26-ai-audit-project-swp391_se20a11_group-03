"use client";

import Link from "next/link";
import { getStoredUser } from "@/lib/userSession";

type AuctionResultBannerProps = {
  productName: string;
  productId: number;
  finalPrice: number;
  winnerUsername?: string | null;
  winnerUserId?: number | null;
  paymentStatus?: string | null;
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
  className = "",
}: AuctionResultBannerProps) {
  const me = getStoredUser();
  const amWinner =
    me?.userId != null &&
    winnerUserId != null &&
    Number(me.userId) === Number(winnerUserId);
  const hasWinner = Boolean(winnerUsername || winnerUserId);
  const isPaid = paymentStatus === "PAID";

  return (
    <div
      className={`rounded-xl border p-lg text-center ${
        amWinner
          ? "border-secondary/50 bg-secondary-container/30"
          : "border-outline-variant bg-surface-container-low"
      } ${className}`}
    >
      <span className="material-symbols-outlined text-5xl text-secondary">
        {amWinner ? "emoji_events" : hasWinner ? "flag" : "hourglass_disabled"}
      </span>
      <h2 className="mt-sm font-headline-md text-headline-md text-primary">
        {amWinner ? "Chúc mừng! Bạn đã thắng phiên đấu giá" : "Phiên đấu giá đã kết thúc"}
      </h2>
      <p className="mt-xs text-sm text-on-surface-variant">{productName}</p>

      <div className="mt-md space-y-xs">
        <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
          Giá cuối cùng
        </p>
        <p className="text-[32px] font-bold text-primary">{formatVnd(finalPrice)}</p>
      </div>

      {hasWinner ? (
        <p className="mt-md text-on-surface">
          Người thắng:{" "}
          <span className="font-bold text-secondary">
            {amWinner ? "Bạn" : winnerUsername ?? `#${winnerUserId}`}
          </span>
        </p>
      ) : (
        <p className="mt-md text-on-surface-variant">Không có người thắng cuộc.</p>
      )}

      {amWinner && !isPaid && (
        <Link
          href={`/auctions/${productId}`}
          className="mt-md inline-block rounded-md bg-secondary px-md py-sm font-label-md text-on-secondary hover:opacity-90"
        >
          Thanh toán ngay
        </Link>
      )}

      {amWinner && isPaid && (
        <p className="mt-md inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-3 py-1 text-sm text-on-tertiary-fixed-variant">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          Đã thanh toán
        </p>
      )}

      {!amWinner && hasWinner && (
        <Link
          href="/live"
          className="mt-md inline-block rounded-md border border-outline-variant px-md py-sm text-on-surface hover:bg-surface-container-low"
        >
          Xem phiên khác
        </Link>
      )}
    </div>
  );
}
