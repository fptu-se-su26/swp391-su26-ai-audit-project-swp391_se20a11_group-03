"use client";

import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import WatchlistButton from "@/components/features/WatchlistButton";
import { getProductImage } from "@/lib/productPresentation";
import type { ProductSummary } from "@/lib/services/productService";
import CountdownBadge from "./CountdownBadge";
import StatusBadge from "./StatusBadge";
import { displayFont } from "@/components/luxe/theme";

const numberFormatter = new Intl.NumberFormat("vi-VN");

type Translator = (key: string, values?: Record<string, string | number>) => string;

function formatTime(t: Translator, endTime?: string | null) {
  if (!endTime) return t("lotCard.tbd");

  const diffMs = new Date(endTime).getTime() - Date.now();
  if (diffMs <= 0) return t("lotCard.ended");

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return t("timeFormat.daysHours", { days, hours });
  if (hours > 0) return t("timeFormat.hoursMinutes", { hours, minutes });
  return t("timeFormat.minutesShort", { minutes });
}

function ProductAuctionCard({
  product,
  t,
  index = 0,
}: {
  product: ProductSummary;
  t: Translator;
  index?: number;
}) {
  const isLive = product.auctionStatus === "ACTIVE";
  const price = product.currentBid || product.startingPrice;
  const timeLabel = isLive
    ? formatTime(t, product.auctionEndTime)
    : product.auctionStartTime
      ? new Date(product.auctionStartTime).toLocaleDateString("vi-VN")
      : t("lotCard.tbd");

  return (
    <article
      className="animate-fade-up group relative flex min-h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0e0d0b] transition-all duration-500 hover:-translate-y-2 hover:border-[#d4aa61]/45 hover:shadow-[0_24px_70px_rgba(0,0,0,.5)]"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <Link href={`/auctions/${product.productId}`} className="absolute inset-0 z-10" aria-label={`View ${product.productName}`} />
      <div className="relative aspect-[4/3] overflow-hidden bg-[#11100d]">
        <Image
          src={getProductImage(product.imageUrl)}
          alt={product.productName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <StatusBadge status={product.auctionStatus} label={isLive ? t("lotCard.live") : product.auctionStatus || "Lot"} />
          <div className="relative z-20">
            <WatchlistButton productId={product.productId} className="!static grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/45 text-[#d4aa61] backdrop-blur transition hover:scale-105 hover:bg-black/60" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[11px] font-bold text-[#efcf88] backdrop-blur">
          Lot #{product.productId}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#d4aa61]">
          {product.categoryName ?? t("lotCard.uncategorized")}
        </p>
        <h3 className={`${displayFont} mt-3 line-clamp-2 min-h-[56px] text-xl font-medium leading-7 text-white`}>
          {product.productName}
        </h3>

        <div className="mt-5 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9d948a]">
              {isLive ? t("lotCard.currentBid") : t("lotCard.startingBid")}
            </p>
            <p className="mt-1 text-lg font-extrabold text-[#efcf88]">
              {numberFormatter.format(price)} VND
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9d948a]">
              {isLive ? t("lotCard.endsIn") : t("lotCard.starts")}
            </p>
            <div className="mt-1 flex sm:justify-end">
              <CountdownBadge label={timeLabel} urgent={isLive} />
            </div>
          </div>
        </div>

        <div className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-4 py-3 text-sm font-bold text-[#100d08] transition duration-300 hover:brightness-110">
          <span className="material-symbols-outlined text-[18px]">gavel</span>
          {isLive ? t("lotCard.bidNow") : t("lotCard.viewLot")}
        </div>
      </div>
    </article>
  );
}

export default memo(ProductAuctionCard);
