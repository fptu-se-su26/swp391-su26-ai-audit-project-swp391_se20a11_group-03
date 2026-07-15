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
import { canPayForWonAuction, isForfeitedPayment } from "@/lib/auctionPayment";
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

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [bids, setBids] = useState<BidInfo[]>([]);
  const [wonItems, setWonItems] = useState<WonItem[]>([]);
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
  const fetchBids = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingBids(true);
    try {
      const [myBids, won] = await Promise.all([getMyBids(), getWonItems()]);
      setBids(myBids);
      setWonItems(won);
    } catch (error) {
      console.error("Failed to fetch bids:", error);
      setBids([]);
      setWonItems([]);
    } finally {
      if (!silent) setIsLoadingBids(false);
    }
  }, []);

  useEffect(() => {
    fetchBids();
    const fetchWhenVisible = () => {
      if (!document.hidden) fetchBids(true);
    };
    const handle = setInterval(fetchWhenVisible, 5_000);
    document.addEventListener("visibilitychange", fetchWhenVisible);
    return () => {
      clearInterval(handle);
      document.removeEventListener("visibilitychange", fetchWhenVisible);
    };
  }, [fetchBids]);

  const displayName = getUserDisplayName(currentUser);
  const activeBids = bids.filter((b) => b.timeLeft !== "Ended" && !["won", "lost"].includes(b.status));
  const endedBids = bids.filter((b) => b.timeLeft === "Ended" || b.status === "won" || b.status === "lost");
  const leadingCount = bids.filter((b) => b.status === "leading").length;
  const wonCount = wonItems.length || bids.filter((b) => b.status === "won").length;
  const totalSpent = wonItems
    .filter((w) => w.status === "paid")
    .reduce((sum, w) => sum + w.finalPrice, 0);
  const pendingPayment = wonItems.filter(
    (w) =>
      w.status === "pending_payment" &&
      canPayForWonAuction(w.paymentStatus, w.paymentDeadline),
  );
  const forfeitedWins = wonItems.filter(
    (w) => w.status === "forfeited" || isForfeitedPayment(w.paymentStatus, w.paymentDeadline),
  );

  const stats = [
    ...BASE_STATS.slice(0, 1).map((s) => ({ ...s, label: t("activeBids"), value: String(bids.length) })),
    ...BASE_STATS.slice(1, 2).map((s) => ({ ...s, label: t("itemsWon"), value: String(wonCount) })),
    ...BASE_STATS.slice(2, 3).map((s) => ({
      ...s,
      label: t("totalSpent"),
      value: `₫${totalSpent.toLocaleString("vi-VN")}`,
    })),
    { icon: "visibility", label: t("watchlist"), value: String(watchlistCount), color: "outline-variant" },
  ];

  return (
    <CollectorShell>
      <div className="mx-auto max-w-[1320px] space-y-8 px-4 py-8 sm:px-7 lg:px-10 lg:py-12">
        <section>
          <DashboardHeader title={t("pageTitle")} subtitle={t("welcomeBack", { name: displayName })} actionLabel={t("exploreAuctions")} actionHref="/live" />

          <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {stats.map((stat, index) => <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} tone={index === 0 ? "gold" : index === 1 ? "green" : "navy"} detail={index === 0 && leadingCount > 0 ? `${leadingCount} leading` : undefined} />)}
          </div>
        </section>

        <WonItemsBanner wonItems={wonItems} onRefresh={fetchBids} />

        {forfeitedWins.length > 0 && (
          <section className="space-y-sm">
            <h3 className="border-b border-error/30 pb-xs font-headline-sm text-headline-sm text-error">
              {t("forfeitedWins")}
            </h3>
            <div className="grid gap-md md:grid-cols-2">
              {forfeitedWins.map((w) => (
                <div
                  key={w.id}
                  className="rounded-xl border border-error/40 bg-error-container/20 p-md soft-shadow"
                >
                  <p className="font-label-md text-label-md text-error">{w.productName}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {t("wonAt", { price: `₫${w.finalPrice.toLocaleString("vi-VN")}`, lot: w.lotNumber })}
                  </p>
                  <p className="mt-sm text-sm text-error">{t("paymentOverdueMsg")}</p>
                  <Link
                    href={`/auctions/${w.productId}`}
                    className="mt-sm inline-block text-xs text-on-surface-variant hover:underline"
                  >
                    {t("viewLot")}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-5 xl:col-span-1">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.2em] text-[#d4aa61]">Live bidding activity</p>
              <h3 className="mt-2 font-display-lg text-2xl font-black tracking-[-.04em] text-white">{t("myActiveBids")}</h3>
            </div>
            <div>
              {isLoadingBids ? (
                <LoadingSkeleton cards={2} />
              ) : activeBids.length === 0 && bids.length === 0 ? (
                <EmptyState
                  icon="gavel"
                  title={t("noActiveBids")}
                  description={t("emptyActiveBidsDesc")}
                  actionLabel={t("browseAuctions")}
                  actionHref="/live"
                />
              ) : activeBids.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#0e0d0b] p-5 text-sm text-[#b7aea3] shadow-[0_12px_34px_rgba(0,0,0,.35)]">
                  {t("noLiveSessionsHint")}
                </div>
              ) : (
                <DataTable
                  headers={["tableLotItem", "tableCurrentBid", "tableTimeLeft", "tableStatus", "tableQuickBid", "tableActions"].map(
                    (key) => t(key),
                  )}
                >
                  {activeBids.map((bid) => (
                    <ActiveBidRow key={`${bid.auctionId ?? bid.bidId}`} bid={bid} onRefresh={fetchBids} />
                  ))}
                </DataTable>
              )}
            </div>

            {endedBids.length > 0 && (
              <div className="mt-8 space-y-5">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.2em] text-[#d4aa61]">{t("participationHistory")}</p>
                  <h3 className="mt-2 font-display-lg text-2xl font-black tracking-[-.04em] text-white">{t("endedSessionsTitle")}</h3>
                </div>
                <DataTable
                  headers={["tableLotItem", "tableCurrentBid", "tableYourBid", "tableStatus", "tablePayment", "tableActions"].map(
                    (key) => (key.startsWith("table") ? t(key) : key),
                  )}
                >
                  {endedBids.map((bid) => (
                    <EndedBidRow key={`ended-${bid.auctionId ?? bid.bidId}`} bid={bid} />
                  ))}
                </DataTable>
              </div>
            )}
          </section>

          <section className="space-y-5">
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0e0d0b] p-6 shadow-[0_18px_50px_rgba(0,0,0,.4)]">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#d2ad55]/16 blur-2xl" />
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#b8860b] via-[#d7b55c] to-transparent" />
              <div className="relative flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#2a2211] text-[#f0d98b] shadow-inner shadow-black/40">
                  <span className="material-symbols-outlined text-[22px]">timer</span>
                </span>
                <div>
                  <h4 className="font-display-lg text-lg font-black tracking-[-.03em] text-white">{t("quickTips")}</h4>
                  <p className="mt-2 text-sm leading-6 text-[#b7aea3]">
                    {t("depositTip")}
                  </p>
                  <Link href="/wallet" className="mt-3 inline-flex items-center gap-1 text-xs font-black text-[#e7c57c] hover:underline">
                    {t("depositFunds")}
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0b09] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,.5)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#d4aa61]/18 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#d2ad55]/70 to-transparent" />
              <h3 className="relative mb-2 font-display-lg text-2xl font-black tracking-[-.05em] text-white">{t("quickAccess")}</h3>
              <p className="relative mb-5 text-sm leading-6 text-[#b8c5d3]">{t("quickAccessDesc")}</p>
              {pendingPayment.length > 0 && (
                <p className="relative mb-5 rounded-2xl border border-[#d2ad55]/20 bg-[#d2ad55]/12 px-4 py-3 text-sm text-[#f0d98b]">
                  {pendingPayment.length} phiên chờ thanh toán · ₫
                  {pendingPayment.reduce((s, w) => s + w.finalPrice, 0).toLocaleString("vi-VN")}
                </p>
              )}
              <div className="relative grid gap-3">
                <Link href="/won-items" className="rounded-2xl border border-white/12 px-4 py-3 text-center text-sm font-bold text-[#dce8f5] transition hover:-translate-y-0.5 hover:border-[#d2ad55]/45 hover:bg-white/[.06]">
                  Sản phẩm đã thắng ({wonCount})
                </Link>
                <Link href="/watchlist" className="rounded-2xl border border-white/12 px-4 py-3 text-center text-sm font-bold text-[#dce8f5] transition hover:-translate-y-0.5 hover:border-[#d2ad55]/45 hover:bg-white/[.06]">
                  {t("openWatchlist")}
                </Link>
                <Link href="/wallet" className="rounded-2xl bg-gradient-to-r from-[#b8860b] via-[#d7b55c] to-[#f0d98b] px-4 py-3 text-center text-sm font-black text-[#06111f] shadow-[0_16px_34px_rgba(199,160,62,.22)] transition hover:-translate-y-0.5">
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

function EndedBidRow({ bid }: { bid: BidInfo }) {
  const t = useTranslations("dashboard");
  const forfeited =
    bid.status === "won" &&
    isForfeitedPayment(bid.paymentStatus, bid.paymentDeadline ?? null);
  const paymentLabel =
    bid.status === "won"
      ? bid.paymentStatus === "PAID"
        ? t("statusPaid")
        : forfeited
          ? t("statusPaymentOverdue")
          : t("awaitingPayment")
      : "—";

  return (
    <tr
      className={`border-b border-surface-variant transition-colors hover:bg-surface-container-lowest ${
        forfeited ? "bg-error-container/15" : ""
      }`}
    >
      <td className="p-md">
        <div className="flex items-center gap-sm">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-surface-variant">
            <img src={getProductImage(bid.image)} alt={bid.productName} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-label-md text-label-md text-primary">{bid.lotNumber}</p>
            <p className="w-40 truncate text-sm text-on-surface-variant">{bid.productName}</p>
          </div>
        </div>
      </td>
      <td className="p-md text-[16px] font-bold text-primary">₫{bid.currentBid.toLocaleString("vi-VN")}</td>
      <td className="p-md text-sm text-on-surface-variant">
        {bid.userHighestBid ? `₫${bid.userHighestBid.toLocaleString("vi-VN")}` : "—"}
      </td>
      <td className="p-md">
        {bid.status === "won" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-2 py-1 text-[10px] font-label-sm text-on-secondary-container">
            <span className="material-symbols-outlined text-[12px]">emoji_events</span>
            {t("statusWon")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2 py-1 text-[10px] font-label-sm text-on-surface-variant">
            {t("statusLost")}
          </span>
        )}
      </td>
      <td className={`p-md text-sm ${forfeited ? "font-medium text-error" : ""}`}>{paymentLabel}</td>
      <td className="p-md text-right">
        <Link href={`/auctions/${bid.productId}`} className="font-label-sm text-label-sm text-secondary hover:underline">
          {bid.status === "won" && canPayForWonAuction(bid.paymentStatus, bid.paymentDeadline) ? t("payNow") : t("viewLot")}
        </Link>
      </td>
    </tr>
  );
}

function ActiveBidRow({ bid, onRefresh }: { bid: BidInfo; onRefresh: () => void }) {
  const t = useTranslations("dashboard");
  const [startingPrice, setStartingPrice] = useState(0);
  const [currentBid, setCurrentBid] = useState(bid.currentBid || 0);
  const [auctionId, setAuctionId] = useState<number | null>(null);
  const [auctionMode, setAuctionMode] = useState<"LIVE" | "TIMED">(bid.auctionMode ?? "LIVE");
  const [priceHidden, setPriceHidden] = useState(Boolean(bid.priceHidden));
  const [timeLeft, setTimeLeft] = useState(bid.timeLeft);
  const isTimedBlind =
    (auctionMode === "TIMED" || priceHidden) &&
    timeLeft !== "Ended" &&
    bid.timeLeft !== "Ended" &&
    bid.status !== "won" &&
    bid.status !== "lost";
  const bidStep = isTimedBlind ? 1 : calculateBidStep(startingPrice);
  const minRequired = isTimedBlind
    ? startingPrice
    : computeMinNextBid(startingPrice, currentBid, bidStep);
  const [quickAmount, setQuickAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const resolvedAuctionId = bid.auctionId ?? null;
    if (resolvedAuctionId) {
      setAuctionId(resolvedAuctionId);
      setStartingPrice(bid.startingPrice ?? 0);
      setCurrentBid(bid.currentBid ?? 0);
    }
    getProductDetail(bid.productId)
      .then((detail) => {
        if (cancelled) return;
        setStartingPrice(detail.startingPrice ?? bid.startingPrice ?? 0);
        setCurrentBid(detail.currentBid ?? detail.startingPrice ?? bid.currentBid ?? 0);
        setAuctionMode((detail.auctionMode ?? bid.auctionMode ?? "LIVE") as "LIVE" | "TIMED");
        setAuctionId(resolvedAuctionId ?? detail.auction?.auctionId ?? detail.auctionId ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [bid.productId, bid.currentBid, bid.auctionId, bid.startingPrice]);

  useEffect(() => {
    if (!auctionId) return;
    return subscribeAuction(auctionId, (state) => {
      if (state.priceHidden) {
        setPriceHidden(true);
      } else {
        setPriceHidden(false);
        setCurrentBid(state.currentHighestBid);
      }
      if (state.auctionMode) {
        setAuctionMode(state.auctionMode);
      }
      if (state.startingPrice) setStartingPrice(state.startingPrice);
      if (state.endTime) {
        const seconds = Math.max(0, Math.floor((new Date(state.endTime).getTime() - Date.now()) / 1000));
        if (seconds <= 0) {
          setTimeLeft("Ended");
        } else if (seconds < 60) {
          setTimeLeft(`${seconds}s`);
        } else if (seconds < 3600) {
          setTimeLeft(`${Math.floor(seconds / 60)}m`);
        } else {
          setTimeLeft(`${Math.floor(seconds / 3600)}h`);
        }
      }
    });
  }, [auctionId]);

  useEffect(() => {
    if (bid.timeLeft === "Ended") return;
    if (!auctionId) return;
    return subscribeAuction(auctionId, (state) => {
      const endMs = state.endTime ? new Date(state.endTime).getTime() : 0;
      if (endMs > 0 && endMs <= Date.now()) {
        onRefresh();
      }
    });
  }, [auctionId, bid.timeLeft, onRefresh]);

  useEffect(() => {
    setQuickAmount(String(minRequired));
  }, [minRequired]);

  const isEnded = timeLeft === "Ended" || bid.timeLeft === "Ended" || bid.status === "won" || bid.status === "lost";
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
          message: isTimedBlind
            ? t("timedBidRecorded")
            : t("quickBidPlaced", { amount: amountNumber.toLocaleString("vi-VN"), product: bid.productName }),
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
        <td className="p-md text-[16px] font-bold text-primary">
          {isTimedBlind ? (
            <span className="text-sm font-body-md text-on-surface-variant">{t("priceHidden")}</span>
          ) : (
            <>₫{currentBid.toLocaleString("vi-VN")}</>
          )}
        </td>
        <td className={`p-md text-sm font-body-md ${bid.status === "outbid" ? "font-bold text-error" : "text-on-surface-variant"}`}>
          {timeLeft}
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
          ) : bid.status === "sealed" || (isTimedBlind && bid.status !== "deposited") ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2 py-1 text-[10px] font-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[12px]">lock</span>
              {t("statusSealed")}
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
              placeholder={isTimedBlind ? t("timedBidPlaceholder") : undefined}
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

function WonItemsBanner({
  wonItems,
  onRefresh,
}: {
  wonItems: WonItem[];
  onRefresh: () => void;
}) {
  const t = useTranslations("dashboard");
  const [items, setItems] = useState<WonItemWithDeadline[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function enrich() {
      const enriched: WonItemWithDeadline[] = await Promise.all(
        wonItems.map(async (w) => {
          try {
            const auctionId = w.auctionId ?? w.id;
            const state = await getAuctionState(auctionId);
            return {
              ...w,
              paymentDeadline: state.paymentDeadline,
              paymentStatus: state.paymentStatus ?? w.paymentStatus ?? null,
              auctionId,
            };
          } catch {
            return { ...w, paymentDeadline: null, paymentStatus: w.paymentStatus ?? null, auctionId: w.auctionId ?? w.id };
          }
        }),
      );
      if (!cancelled) setItems(enriched);
    }
    enrich();
    return () => {
      cancelled = true;
    };
  }, [wonItems]);

  const awaitingPayment = items.filter(
    (i) =>
      (i.status === "pending_payment" || i.paymentStatus === "AWAITING_PAYMENT") &&
      canPayForWonAuction(i.paymentStatus, i.paymentDeadline),
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

