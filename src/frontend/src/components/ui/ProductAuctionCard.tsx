"use client";

import Link from "next/link";
import WatchlistButton from "@/components/features/WatchlistButton";
import { getProductImage } from "@/lib/productPresentation";
import type { ProductSummary } from "@/lib/services/productService";
import CountdownBadge from "./CountdownBadge";
import StatusBadge from "./StatusBadge";

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

export default function ProductAuctionCard({
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
      className="animate-fade-up group relative flex min-h-full flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_14px_45px_rgba(15,23,42,.08)] transition-all duration-500 hover:-translate-y-2 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(15,23,42,.14)]"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <Link href={`/auctions/${product.productId}`} className="absolute inset-0 z-10" aria-label={`View ${product.productName}`} />
      <div className="relative overflow-hidden bg-slate-100">
        <img
          src={getProductImage(product.imageUrl)}
          alt={product.productName}
          className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <StatusBadge status={product.auctionStatus} label={isLive ? t("lotCard.live") : product.auctionStatus || "Lot"} />
          <div className="relative z-20">
            <WatchlistButton productId={product.productId} className="!static grid h-10 w-10 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm backdrop-blur transition hover:scale-105 hover:text-red-600" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur">
          Lot #{product.productId}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#9a6b13]">
          {product.categoryName ?? t("lotCard.uncategorized")}
        </p>
        <h3 className="mt-3 line-clamp-2 min-h-[56px] font-display-lg text-xl font-semibold leading-7 tracking-[-.025em] text-slate-950">
          {product.productName}
        </h3>

        <div className="mt-5 grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {isLive ? t("lotCard.currentBid") : t("lotCard.startingBid")}
            </p>
            <p className="mt-1 text-lg font-extrabold text-slate-950">
              {numberFormatter.format(price)} VND
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {isLive ? t("lotCard.endsIn") : t("lotCard.starts")}
            </p>
            <div className="mt-1 flex sm:justify-end">
              <CountdownBadge label={timeLabel} urgent={isLive} />
            </div>
          </div>
        </div>

        <div className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-bold text-white transition duration-300 group-hover:bg-[#9a6b13]">
          <span className="material-symbols-outlined text-[18px]">gavel</span>
          {isLive ? t("lotCard.bidNow") : t("lotCard.viewLot")}
        </div>
      </div>
    </article>
  );
}
