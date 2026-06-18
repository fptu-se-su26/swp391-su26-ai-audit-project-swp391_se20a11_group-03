"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import { BidRecord, getBidHistory } from "@/lib/services/auctionService";

interface BidHistoryProps {
  auctionId: number;
  maxItems?: number;
}

function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BidHistory({ auctionId, maxItems = 10 }: BidHistoryProps) {
  const t = useTranslations("bidHistory");
  const [bids, setBids] = useState<BidRecord[]>([]);
  const [loading, setLoading] = useState(true);

  function timeAgo(iso: string | null | undefined): string {
    if (!iso) return "—";
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "—";
    const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
    if (diffSec < 60) return t("secondsAgo", { seconds: diffSec });
    if (diffSec < 3600) return t("minutesAgo", { minutes: Math.floor(diffSec / 60) });
    if (diffSec < 86400) return t("hoursAgo", { hours: Math.floor(diffSec / 3600) });
    return t("daysAgo", { days: Math.floor(diffSec / 86400) });
  }
  useEffect(() => {
    let cancelled = false;
    async function fetchHistory() {
      try {
        const list = await getBidHistory(auctionId, maxItems);
        if (!cancelled) setBids(list ?? []);
      } catch (err) {
        console.error("getBidHistory failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchHistory();
    const handle = setInterval(fetchHistory, 3_000);
    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, [auctionId, maxItems]);

  if (loading && bids.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-md text-sm text-on-surface-variant">
        {t("loadingBidHistory")}
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-md text-sm text-on-surface-variant">
        {t("noBidsYet")}
      </div>
    );
  }

  const newestBidId = bids[0]?.bidId;

  return (
    <div className="overflow-hidden rounded-xl border border-surface-variant bg-surface soft-shadow">
      <div className="border-b border-outline-variant px-md py-sm">
        <h3 className="font-headline-sm text-headline-sm text-primary">{t("bidHistory")}</h3>
      </div>
      <ul className="divide-y divide-outline-variant/30">
        {bids.map((bid) => (
          <li
            key={bid.bidId}
            className={`flex items-center justify-between px-md py-sm text-sm transition-colors ${
              bid.bidId === newestBidId ? "bg-tertiary-container/30" : ""
            }`}
          >
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-primary">
                {bid.username ? bid.username : t("userNumber", { number: bid.userId })}
              </span>
              <span className="text-xs text-on-surface-variant">{timeAgo(bid.bidTime)}</span>
            </div>
            <span className="font-headline-sm text-headline-sm text-primary">
              {formatVnd(bid.bidAmount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BidHistory;
