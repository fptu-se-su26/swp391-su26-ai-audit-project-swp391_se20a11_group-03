"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import { BidRecord, getAuctionState, getBidHistory } from "@/lib/services/auctionService";

interface BidHistoryProps {
  auctionId: number;
  maxItems?: number;
  anonymous?: boolean;
}

function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BidHistory({ auctionId, maxItems = 10, anonymous = false }: BidHistoryProps) {
  const t = useTranslations("bidHistory");
  const [bids, setBids] = useState<BidRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBids, setTotalBids] = useState(0);

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
      if (document.hidden) return;
      try {
        if (anonymous) {
          const state = await getAuctionState(auctionId);
          if (!cancelled) {
            setTotalBids(state.totalBids ?? 0);
            setBids([]);
          }
          return;
        }
        const list = await getBidHistory(auctionId, maxItems);
        if (!cancelled) setBids(list ?? []);
      } catch (err) {
        console.error("getBidHistory failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchHistory();
    const handle = setInterval(fetchHistory, anonymous ? 5_000 : 3_000);
    const onVisible = () => fetchHistory();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(handle);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [auctionId, maxItems, anonymous]);

  if (anonymous) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-md text-sm text-on-surface-variant">
        <p className="font-label-md text-label-md text-primary">{t("timedAnonymousTitle")}</p>
        <p className="mt-1 text-xs leading-relaxed">{t("timedAnonymousDesc")}</p>
        {totalBids > 0 && (
          <p className="mt-2 text-xs font-medium text-secondary">
            {t("timedBidCount", { count: totalBids })}
          </p>
        )}
      </div>
    );
  }

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
