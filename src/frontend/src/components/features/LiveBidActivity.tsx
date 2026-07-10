"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import { BidRecord, getBidHistory } from "@/lib/services/auctionService";

function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

interface LiveBidActivityProps {
  auctionId: number;
  maxItems?: number;
}

export default function LiveBidActivity({ auctionId, maxItems = 8 }: LiveBidActivityProps) {
  const t = useTranslations("liveActivity");
  const [bids, setBids] = useState<BidRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const newestBidId = useRef<number | null>(null);
  const [flashBidId, setFlashBidId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const list = await getBidHistory(auctionId, maxItems);
        if (cancelled) return;

        const next = list ?? [];
        const top = next[0];
        if (top && newestBidId.current !== null && top.bidId !== newestBidId.current) {
          setFlashBidId(top.bidId);
          window.setTimeout(() => setFlashBidId(null), 2400);
        }
        if (top) newestBidId.current = top.bidId;

        setBids(next);
      } catch (err) {
        console.debug("LiveBidActivity poll failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    const handle = window.setInterval(poll, 2_000);
    return () => {
      cancelled = true;
      window.clearInterval(handle);
    };
  }, [auctionId, maxItems]);

  if (loading && bids.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-md text-sm text-on-surface-variant">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-error/25 bg-error-container/5">
      <div className="flex items-center gap-sm border-b border-error/20 px-md py-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-error" />
        </span>
        <h3 className="font-label-md text-label-md text-error">{t("title")}</h3>
      </div>

      {bids.length === 0 ? (
        <p className="px-md py-lg text-sm text-on-surface-variant">{t("noBidsYet")}</p>
      ) : (
        <ul className="max-h-56 divide-y divide-outline-variant/30 overflow-y-auto">
          {bids.map((bid) => {
            const name = bid.username ? bid.username : t("userNumber", { number: bid.userId });
            const isNew = bid.bidId === flashBidId;
            return (
              <li
                key={bid.bidId}
                className={`px-md py-sm text-sm transition-colors ${
                  isNew ? "animate-pulse bg-tertiary-container/40" : ""
                }`}
              >
                <span className="font-medium text-on-surface">
                  {t("userBid", { name, amount: formatVnd(bid.bidAmount) })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
