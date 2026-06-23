"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import CollectorShell from "@/components/layout/CollectorShell";
import { getProductImage } from "@/lib/productPresentation";
import { getWatchlistIds, refreshWatchlistIds, subscribeWatchlist } from "@/lib/watchlist";
import { StoredUser, getStoredUser, getUserDisplayName, subscribeStoredUser } from "@/lib/userSession";
import { BidInfo, getMyBids, getWonItems, WonItem } from "@/lib/services/userBidService";
import { getProductDetail } from "@/lib/services/productService";
import { getAuctionState, placeBid } from "@/lib/services/auctionService";
import { subscribeAuction } from "@/lib/services/auctionPolling";
import CountdownTimer from "@/components/features/CountdownTimer";
import { useTranslations } from "@/i18n/I18nProvider";
import { calculateBidStep, computeMinNextBid } from "@/lib/bidStep";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/dashboard/EmptyState";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";
import DataTable from "@/components/dashboard/DataTable";

const BASE_STATS = [
  { icon: "gavel", label: "Active Bids", value: "0", color: "primary-fixed-dim" },
  { icon: "emoji_events", label: "Items Won", value: "0", color: "tertiary-fixed-dim" },
  { icon: "payments", label: "Total Spent", value: "₫0", color: "secondary-fixed-dim" },
];

const STAT_ACCENTS: Record<string, string> = {
  "primary-fixed-dim": "bg-primary-fixed-dim",
  "tertiary-fixed-dim": "bg-tertiary-fixed-dim",
  "secondary-fixed-dim": "bg-secondary-fixed-dim",
  "outline-variant": "bg-outline-variant",
};

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [bids, setBids] = useState<BidInfo[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState(true);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    const syncWatchlist = () => setWatchlistCount(getWatchlistIds().length);

    syncUser();
    syncWatchlist();
    refreshWatchlistIds().then(syncWatchlist);

    const unsubscribeUser = subscribeStoredUser(syncUser);
    const unsubscribeWatchlist = subscribeWatchlist(syncWatchlist);

    return () => {
      unsubscribeUser();
      unsubscribeWatchlist();
    };
  }, []);

  // Fetch real bids from API
  const fetchBids = useCallback(async () => {
    setIsLoadingBids(true);
    try {
      const myBids = await getMyBids();
      setBids(myBids);
    } catch (error) {
      console.error("Failed to fetch bids:", error);
      setBids([]);
    } finally {
      setIsLoadingBids(false);
    }
  }, []);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const displayName = getUserDisplayName(currentUser);
  const leadingCount = bids.filter(b => b.status === "leading").length;
  const wonCount = bids.filter(b => b.status === "won").length;
  const totalSpent = bids
    .filter(b => b.status === "won")
    .reduce((sum, b) => sum + b.currentBid, 0);

  const stats = [
    ...BASE_STATS.slice(0, 1).map(s => ({ ...s, label: t("activeBids"), value: String(bids.length) })),
    ...BASE_STATS.slice(1, 2).map(s => ({ ...s, label: t("itemsWon"), value: String(wonCount) })),
    ...BASE_STATS.slice(2, 3).map(s => ({ ...s, label: t("totalSpent"), value: `₫${totalSpent.toLocaleString('vi-VN')}` })),
    { icon: "visibility", label: t("watchlist"), value: String(watchlistCount), color: "outline-variant" },
  ];

  return (
    <CollectorShell>
      <div className="mx-auto max-w-[1260px] space-y-8 px-4 py-10 sm:px-7 lg:px-10 lg:py-14">
        <section>
          <DashboardHeader title={t("pageTitle")} subtitle={t("welcomeBack", { name: displayName })} actionLabel="Khám phá phiên đấu giá" actionHref="/live" />

          <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {stats.map((stat, index) => <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} tone={index === 0 ? "gold" : index === 1 ? "green" : "navy"} detail={index === 0 && leadingCount > 0 ? `${leadingCount} leading` : undefined} />)}
          </div>
        </section>

        <WonItemsBanner />

        <div className="grid grid-cols-1 gap-lg xl:grid-cols-3">
          <section className="space-y-md xl:col-span-2">
            <div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#9a7429]">Live bidding activity</p><h3 className="mt-2 font-display-lg text-xl font-semibold text-[#071626]">{t("myActiveBids")}</h3></div>
            <div>
              {isLoadingBids ? (
                <LoadingSkeleton cards={2} />
              ) : bids.length === 0 ? (
                <EmptyState icon="gavel" title={t("noActiveBids")} description="Các phiên bạn tham gia sẽ xuất hiện tại đây cùng trạng thái bid theo thời gian thực." actionLabel={t("browseAuctions")} actionHref="/live" />
              ) : (
                <DataTable headers={["tableLotItem", "tableCurrentBid", "tableTimeLeft", "tableStatus", "tableQuickBid", "tableActions"].map((key) => t(key))}>
                      {bids.map((bid) => (
                        <ActiveBidRow key={bid.bidId} bid={bid} onRefresh={fetchBids} />
                      ))}
                </DataTable>
              )}
            </div>
          </section>

          <section className="space-y-md">
            <div className="relative overflow-hidden rounded-2xl border border-[#e1d7c5] bg-white/75 p-5 shadow-[0_8px_28px_rgba(18,31,44,.04)]">
              <div className="absolute left-0 top-0 h-full w-1 bg-[#bd963f]" />
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined mt-1 text-error">timer</span>
                <div>
                  <h4 className="font-bold text-on-surface">{t("quickTips")}</h4>
                  <p className="mt-1 text-sm font-body-md text-on-surface-variant">
                    {t("depositTip")}
                  </p>
                  <Link href="/wallet" className="mt-sm inline-block font-label-sm text-label-sm text-secondary hover:underline">
                    {t("depositFunds")}
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#071626] p-6 text-white shadow-[0_18px_45px_rgba(7,22,38,.18)]">
              <h3 className="mb-sm font-headline-sm text-headline-sm text-on-primary">{t("quickAccess")}</h3>
              <p className="mb-md text-sm font-body-md opacity-80">{t("quickAccessDesc")}</p>
              <div className="grid gap-sm">
                <Link href="/watchlist" className="rounded-lg border border-outline-variant px-4 py-3 text-center font-label-md transition-colors hover:bg-on-primary/10">
                  {t("openWatchlist")}
                </Link>
                <Link href="/wallet" className="rounded-lg bg-secondary px-4 py-3 text-center font-label-md text-on-secondary transition-colors hover:bg-secondary-fixed-dim">
                  {t("manageWallet")}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </CollectorShell>
  );
}

function ActiveBidRow({ bid, onRefresh }: { bid: BidInfo; onRefresh: () => void }) {
  const t = useTranslations("dashboard");
  const [startingPrice, setStartingPrice] = useState(0);
  const [currentBid, setCurrentBid] = useState(bid.currentBid || 0);
  const [auctionId, setAuctionId] = useState<number | null>(null);
  const bidStep = calculateBidStep(startingPrice);
  const minRequired = computeMinNextBid(startingPrice, currentBid, bidStep);
  const [quickAmount, setQuickAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProductDetail(bid.productId)
      .then((detail) => {
        if (cancelled) return;
        setStartingPrice(detail.startingPrice ?? 0);
        setCurrentBid(detail.currentBid ?? detail.startingPrice ?? bid.currentBid ?? 0);
        setAuctionId(detail.auction?.auctionId ?? detail.auctionId ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [bid.productId, bid.currentBid]);

  useEffect(() => {
    if (!auctionId) return;
    return subscribeAuction(auctionId, (state) => {
      setCurrentBid(state.currentHighestBid);
      if (state.startingPrice) setStartingPrice(state.startingPrice);
    });
  }, [auctionId]);

  useEffect(() => {
    setQuickAmount(String(minRequired));
  }, [minRequired]);

  const isEnded = bid.timeLeft === "Ended" || bid.status === "won" || bid.status === "lost";
  const amountNumber = Number(quickAmount);
  const isValidAmount = !Number.isNaN(amountNumber) && amountNumber >= minRequired;

  const handleQuickBid = async () => {
    if (!isValidAmount) {
      setFeedback({
        tone: "error",
        message: t("minBidError", { amount: minRequired.toLocaleString("vi-VN") }),
      });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const detail = await getProductDetail(bid.productId);
      const resolvedAuctionId = detail?.auction?.auctionId ?? detail?.auctionId;
      if (!resolvedAuctionId) {
        setFeedback({ tone: "error", message: t("noAuctionSession") });
        return;
      }
      const stored = getStoredUser();
      if (!stored?.userId) {
        setFeedback({ tone: "error", message: t("signInAgain") });
        return;
      }
      const result = await placeBid(resolvedAuctionId, amountNumber);
      if (result?.success) {
        setFeedback({
          tone: "success",
          message: t("quickBidPlaced", { amount: amountNumber.toLocaleString("vi-VN"), product: bid.productName }),
        });
        onRefresh();
      } else {
        setFeedback({ tone: "error", message: result?.message || t("quickBidRejected") });
      }
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : t("quickBidFailed"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <tr
        className={`border-b border-surface-variant transition-colors hover:bg-surface-container-lowest ${
          bid.status === "outbid" ? "bg-error-container/10" : ""
        }`}
      >
        <td className="p-md">
          <div className="flex items-center gap-sm">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-surface-variant">
              <img
                src={getProductImage(bid.image)}
                alt={bid.productName}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-label-md text-label-md text-primary">{bid.lotNumber}</p>
              <p className="w-40 truncate text-sm font-body-md text-on-surface-variant">{bid.productName}</p>
            </div>
          </div>
        </td>
        <td className="p-md text-[16px] font-bold text-primary">₫{currentBid.toLocaleString("vi-VN")}</td>
        <td className={`p-md text-sm font-body-md ${bid.status === "outbid" ? "font-bold text-error" : "text-on-surface-variant"}`}>
          {bid.timeLeft}
        </td>
        <td className="p-md">
          {bid.status === "leading" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2 py-1 text-[10px] font-label-sm text-on-tertiary-fixed-variant">
              <span className="h-2 w-2 animate-pulse rounded-full bg-on-tertiary-container" />
              {t("statusLeading")}
            </span>
          ) : bid.status === "won" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-2 py-1 text-[10px] font-label-sm text-on-secondary-container">
              <span className="material-symbols-outlined text-[12px]">emoji_events</span>
              {t("statusWon")}
            </span>
          ) : bid.status === "lost" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2 py-1 text-[10px] font-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[12px]">close</span>
              {t("statusLost")}
            </span>
          ) : bid.status === "deposited" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-2 py-1 text-[10px] font-label-sm text-on-secondary-container">
              <span className="material-symbols-outlined text-[12px]">verified</span>
              {t("statusDeposited")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-error-container px-2 py-1 text-[10px] font-label-sm text-on-error-container">
              <span className="material-symbols-outlined text-[12px]">warning</span>
              {t("statusOutbid")}
            </span>
          )}
        </td>
        <td className="p-md">
          {isEnded ? (
            <span className="text-sm text-on-surface-variant">—</span>
          ) : (
            <input
              type="number"
              min={minRequired}
              step={bidStep}
              value={quickAmount}
              onChange={(event) => setQuickAmount(event.target.value)}
              disabled={isSubmitting}
              className="w-32 rounded border border-outline-variant bg-surface px-2 py-1 font-body-sm text-body-sm outline-none transition-colors focus:border-secondary disabled:opacity-50"
            />
          )}
        </td>
        <td className="p-md text-right">
          {isEnded ? (
            <Link
              href={`/auctions/${bid.productId}`}
              className="font-label-sm text-label-sm text-secondary hover:underline"
            >
              {t("viewLot")}
            </Link>
          ) : (
            <div className="flex items-center justify-end gap-xs">
              <Link
                href={`/auctions/${bid.productId}`}
                className="rounded border border-outline-variant px-3 py-1.5 text-[12px] font-label-sm text-label-sm text-on-surface transition-colors hover:border-secondary hover:text-secondary"
              >
                {t("bidNow")}
              </Link>
              <button
                type="button"
                onClick={handleQuickBid}
                disabled={isSubmitting || !isValidAmount}
                className="flex items-center gap-1 rounded bg-tertiary px-3 py-1.5 text-[12px] font-label-sm text-label-sm text-on-tertiary transition-colors hover:bg-tertiary-fixed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">flash_on</span>
                {isSubmitting ? t("placing") : t("quickBid")}
              </button>
            </div>
          )}
        </td>
      </tr>
      {feedback && (
        <tr className="border-b border-surface-variant bg-surface-container-lowest">
          <td colSpan={6} className="px-md pb-md">
            <div
              className={`rounded border px-3 py-2 text-sm ${
                feedback.tone === "success"
                  ? "border-tertiary/40 bg-tertiary-container/40 text-on-tertiary-container"
                  : "border-error/40 bg-error-container/40 text-error"
              }`}
            >
              {feedback.message}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

type WonItemWithDeadline = WonItem & {
  paymentDeadline: string | null;
  paymentStatus: string | null;
  auctionId: number | null;
};

function WonItemsBanner() {
  const t = useTranslations("dashboard");
  const [items, setItems] = useState<WonItemWithDeadline[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const won = await getWonItems();
        const enriched: WonItemWithDeadline[] = await Promise.all(
          won.map(async (w) => {
            try {
              const detail = await getProductDetail(w.productId);
              const auctionId = detail?.auctionId ?? null;
              if (!auctionId) {
                return { ...w, paymentDeadline: null, paymentStatus: null, auctionId: null };
              }
              const state = await getAuctionState(auctionId);
              return {
                ...w,
                paymentDeadline: state.paymentDeadline,
                paymentStatus: state.paymentStatus,
                auctionId,
              };
            } catch {
              return { ...w, paymentDeadline: null, paymentStatus: null, auctionId: null };
            }
          }),
        );
        if (!cancelled) setItems(enriched);
      } catch (err) {
        console.error("WonItemsBanner load failed", err);
      }
    }
    load();
    const handle = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, []);

  const awaitingPayment = items.filter(
    (i) => i.paymentStatus === "AWAITING_PAYMENT" && i.paymentDeadline,
  );
  if (awaitingPayment.length === 0) return null;

  return (
    <section className="space-y-sm">
      <h3 className="border-b border-surface-variant pb-xs font-headline-sm text-headline-sm text-primary">
        {t("awaitingPayment")}
      </h3>
      <div className="grid gap-md md:grid-cols-2">
        {awaitingPayment.map((w) => {
          const hoursLeft =
            w.paymentDeadline
              ? Math.max(0, Math.floor((new Date(w.paymentDeadline).getTime() - Date.now()) / 3_600_000))
              : 0;
          const urgent = hoursLeft <= 2;
          return (
            <div
              key={w.id}
              className={`rounded-xl border p-md soft-shadow ${
                urgent
                  ? "border-error/40 bg-error-container/40"
                  : "border-tertiary-fixed/30 bg-tertiary-container/30"
              }`}
            >
              <div className="flex items-start gap-sm">
                <span
                  className={`material-symbols-outlined mt-1 ${urgent ? "text-error" : "text-tertiary"}`}
                >
                  {urgent ? "timer_off" : "schedule"}
                </span>
                <div className="flex-1">
                  <p className="font-label-md text-label-md text-primary">{w.productName}</p>
                  <p className="text-xs text-on-surface-variant">
                    {t("wonAt", { price: `₫${w.finalPrice.toLocaleString("vi-VN")}`, lot: w.lotNumber })}
                  </p>
                  {w.paymentDeadline && (
                    <p className="mt-sm text-sm">
                      {t("payIn")}{" "}
                      <CountdownTimer
                        endsAt={w.paymentDeadline}
                        variant="timed"
                        className="!text-base"
                      />
                    </p>
                  )}
                  <Link
                    href={`/auctions/${w.productId}`}
                    className={`mt-sm inline-block rounded-md px-3 py-1.5 text-[12px] font-label-md ${
                      urgent
                        ? "bg-error text-on-error"
                        : "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                    }`}
                  >
                    {t("payNow")}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

