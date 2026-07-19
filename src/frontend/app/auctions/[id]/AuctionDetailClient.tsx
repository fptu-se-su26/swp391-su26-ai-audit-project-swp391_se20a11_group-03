"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import LiveBiddingPanel from "@/components/feature/LiveBiddingPanel";
import {
  connectAuctionRealtime,
  type AuctionResultEvent,
} from "@/lib/auction-realtime";
import {
  ApiError,
  auctionApi,
  getToken,
  toImageSrc,
  userApi,
  type AuctionState,
  type BidRecord,
  type ProductDetail,
} from "@/lib/api";

type AuctionDetailClientProps = {
  initialState: AuctionState;
  product: ProductDetail;
  initialBids: BidRecord[];
};

const VND = new Intl.NumberFormat("vi-VN");

export default function AuctionDetailClient({
  initialState,
  product,
  initialBids,
}: AuctionDetailClientProps) {
  const t = useTranslations("auctionDetail");
  const locale = useLocale();
  const [state, setState] = useState(initialState);
  const [bids, setBids] = useState(initialBids);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [viewerUserId, setViewerUserId] = useState<number | null>(null);
  const [resultEvent, setResultEvent] = useState<AuctionResultEvent | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const resultPresentedRef = useRef(false);
  const [isWatched, setIsWatched] = useState(false);
  const [watchlistBusy, setWatchlistBusy] = useState(false);
  const [watchlistMessage, setWatchlistMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const images =
    product.imageUrls.length > 0
      ? product.imageUrls.map((imageUrl) => toImageSrc(imageUrl))
      : ["/images/auction-products/placeholder.png"];

  const showPreviousImage = useCallback(() => {
    setActiveImage((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);

  const showNextImage = useCallback(() => {
    setActiveImage((current) => (current + 1) % images.length);
  }, [images.length]);

  const refresh = useCallback(async () => {
    try {
      const [nextState, nextBids] = await Promise.all([
        auctionApi.state(state.auctionId),
        auctionApi.bids(state.auctionId),
      ]);
      setState(nextState);
      setBids(nextBids);
    } catch {
      // Keep current data when one polling cycle fails.
    }
  }, [state.auctionId]);

  useEffect(() => {
    const shouldPoll = state.status === "UPCOMING"
      || state.status === "ACTIVE"
      || (state.auctionMode === "LIVE" && state.paymentStatus === null);
    if (!shouldPoll) return;
    const timer = window.setInterval(() => void refresh(), 2_000);
    return () => window.clearInterval(timer);
  }, [refresh, state.auctionMode, state.paymentStatus, state.status]);

  useEffect(() => connectAuctionRealtime({
    auctionId: state.auctionId,
    onBid: (event) => {
      if (!event.success) return;
      setState((current) => ({
        ...current,
        endTime: event.endTime ?? current.endTime,
        currentHighestBid: event.currentHighestBid ?? current.currentHighestBid,
        currentWinnerUserId: event.userId ?? current.currentWinnerUserId,
        totalBids: current.totalBids + 1,
      }));
      void refresh();
    },
    onResult: (event) => {
      const shouldOpen = !resultPresentedRef.current;
      resultPresentedRef.current = true;
      setResultEvent(event);
      if (shouldOpen) setResultOpen(true);
      void refresh();
    },
  }), [refresh, state.auctionId]);

  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    userApi.profile()
      .then((response) => {
        if (!cancelled) setViewerUserId(response.data.userId);
      })
      .catch(() => {
        if (!cancelled) setViewerUserId(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const ended = !new Set(["UPCOMING", "ACTIVE"]).has(state.status);
    if (state.auctionMode !== "LIVE" || !ended || resultPresentedRef.current) return;
    resultPresentedRef.current = true;
    const hasWinner = state.totalBids > 0 && state.currentWinnerUserId !== null;
    setResultEvent({
      type: hasWinner ? "AUCTION_WON" : "AUCTION_ENDED_NO_WINNER",
      auctionId: state.auctionId,
      productId: state.productId,
      winnerUserId: hasWinner ? state.currentWinnerUserId : null,
      winnerUsername: hasWinner ? state.winnerUsername : null,
      productName: product.productName,
      finalPriceVnd: state.currentHighestBid,
      settledAt: new Date().toISOString(),
      paymentDeadline: state.paymentDeadline,
    });
    setResultOpen(true);
  }, [product.productName, state]);

  useEffect(() => {
    let cancelled = false;
    if (!getToken()) return;

    userApi
      .watchlist()
      .then((response) => {
        if (!cancelled) {
          setIsWatched(response.data.some((item) => item.productId === product.productId));
        }
      })
      .catch(() => {
        if (!cancelled) setIsWatched(false);
      });

    return () => {
      cancelled = true;
    };
  }, [product.productId]);

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, showNextImage, showPreviousImage]);

  const isActive = state.status === "ACTIVE";

  async function toggleWatchlist() {
    setWatchlistMessage(null);
    if (!getToken()) {
      setWatchlistMessage({
        kind: "error",
        text: t("watchlistLogin"),
      });
      return;
    }

    setWatchlistBusy(true);
    try {
      if (isWatched) {
        await userApi.removeFromWatchlist(product.productId);
        setIsWatched(false);
        setWatchlistMessage({ kind: "success", text: t("watchlistRemoved") });
      } else {
        await userApi.addToWatchlist(product.productId);
        setIsWatched(true);
        setWatchlistMessage({ kind: "success", text: t("watchlistAdded") });
      }
    } catch (cause) {
      setWatchlistMessage({
        kind: "error",
        text:
          cause instanceof ApiError
            ? cause.message
            : t("watchlistError"),
      });
    } finally {
      setWatchlistBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left column (2/3) */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="theme-dark-content group relative overflow-hidden rounded-3xl">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={t("openImage")}
            className="block aspect-video w-full cursor-zoom-in bg-cover bg-center"
            style={{ backgroundImage: `url(${images[activeImage]})` }}
          />
          <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-black/65 px-3 py-1.5 text-xs text-white/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            <span className="material-symbols-outlined text-base">zoom_in</span>
            {t("viewAllImages")}
          </span>
          {isActive ? (
            <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white">
              <span
                aria-hidden="true"
                className="pulse-live h-1.5 w-1.5 rounded-full bg-white"
              />
              {t("liveStatus")}
            </span>
          ) : (
            <span className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              {state.status === "UPCOMING" ? t("upcomingStatus") : t("endedStatus")}
            </span>
          )}
        </div>

        {images.length > 1 ? (
          <div className="flex gap-3">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-cover bg-center transition-colors ${
                  activeImage === i
                    ? "border-[var(--luxora-gold)]"
                    : "border-transparent opacity-60"
                }`}
                style={{ backgroundImage: `url(${img})` }}
              />
            ))}
          </div>
        ) : null}

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-white/40">
                LOT #{product.productId} · {product.categoryName ?? t("categoryFallback")}
              </p>
              <h1 className="font-display-lg mt-1 text-2xl">
                {product.productName}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void toggleWatchlist()}
                disabled={watchlistBusy}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  isWatched
                    ? "border-[var(--luxora-gold)] bg-[var(--luxora-gold)]/15 text-[var(--luxora-gold-light)]"
                    : "border-white/15 bg-white/5 text-white/75 hover:border-[var(--luxora-gold)] hover:text-[var(--luxora-gold-light)]"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {isWatched ? "favorite" : "favorite_border"}
                </span>
                {isWatched ? t("watching") : t("watch")}
              </button>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                {t("bidCount", { count: state.totalBids })}
              </span>
            </div>
          </div>

          {watchlistMessage ? (
            <p
              className={`mt-4 rounded-lg border px-3 py-2 text-xs ${
                watchlistMessage.kind === "success"
                  ? "border-green-400/30 bg-green-500/10 text-green-200"
                  : "border-red-400/30 bg-red-500/10 text-red-200"
              }`}
            >
              {watchlistMessage.text}
            </p>
          ) : null}

          <h2 className="mt-6 text-sm font-semibold text-white/70">
            {t("lotInfo")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            {product.description ?? t("noDescription")}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 p-3">
              <p className="text-[10px] text-white/40">{t("startingPrice")}</p>
              <p className="mt-1 text-sm font-semibold">
                {VND.format(state.startingPrice)} ₫
              </p>
            </div>
            <div className="rounded-xl border border-white/10 p-3">
              <p className="text-[10px] text-white/40">{t("bidStep")}</p>
              <p className="mt-1 text-sm font-semibold">
                {VND.format(state.bidStep)} ₫
              </p>
            </div>
            <div className="rounded-xl border border-white/10 p-3">
              <p className="text-[10px] text-white/40">{t("mode")}</p>
              <p className="mt-1 text-sm font-semibold">
                {state.auctionMode === "LIVE" ? "Live" : "Timed"}
              </p>
            </div>
          </div>

          {bids.length > 0 ? (
            <>
              <h2 className="mt-6 text-sm font-semibold text-white/70">
                {t("bidHistory")}
              </h2>
              <ul className="mt-2 divide-y divide-white/8">
                {bids.slice(0, 8).map((bid) => (
                  <li
                    key={bid.bidId}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="text-white/60">
                      {bid.username ?? t("anonymousBidder")}
                    </span>
                    <span className="font-semibold text-[var(--luxora-gold-light)]">
                      {VND.format(bid.bidAmount)} ₫
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      {/* Right column: bidding panel */}
      <div className="lg:col-span-1">
        <LiveBiddingPanel
          state={state}
          sellerId={product.sellerId}
          onBidPlaced={refresh}
          onTimeBoundary={refresh}
        />
      </div>

      {resultOpen && resultEvent ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auction-result-title"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          onClick={() => setResultOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--luxora-gold)]/35 bg-[var(--luxora-bg,#090806)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-[#2b210f] via-[#15110a] to-black px-7 py-8 text-center">
              <span className="material-symbols-outlined text-6xl text-[var(--luxora-gold-light)]">
                {resultEvent.type === "AUCTION_WON" ? "emoji_events" : "gavel"}
              </span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxora-gold)]">
                {t("resultFinished")}
              </p>
              <h2 id="auction-result-title" className="font-display-lg mt-2 text-3xl text-white">
                {resultEvent.type === "AUCTION_WON"
                  ? t("resultWinnerTitle")
                  : t("resultNoWinnerTitle")}
              </h2>
            </div>

            <div className="space-y-4 px-7 py-6">
              {resultEvent.type === "AUCTION_WON" ? (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs text-white/45">{t("resultWinnerLabel")}</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {resultEvent.winnerUsername ?? t("resultWinnerFallback")}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs text-white/45">{t("resultFinalPrice")}</p>
                      <p className="mt-1 text-lg font-bold text-[var(--luxora-gold-light)]">
                        {VND.format(resultEvent.finalPriceVnd)} ₫
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs text-white/45">{t("resultPaymentDeadline")}</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        }).format(new Date(
                          resultEvent.paymentDeadline
                            ?? state.paymentDeadline
                            ?? new Date(new Date(state.endTime).getTime() + 72 * 60 * 60 * 1_000).toISOString(),
                        ))}
                      </p>
                    </div>
                  </div>
                  <p className="text-center text-xs leading-5 text-white/45">
                    {t("resultPaymentNotice")}
                  </p>
                </>
              ) : (
                <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center text-sm leading-6 text-white/60">
                  {t("resultNoWinnerDescription")}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                {resultEvent.type === "AUCTION_WON"
                    && viewerUserId === resultEvent.winnerUserId ? (
                  <Link
                    href="/won-items"
                    className="gradient-cta flex-1 rounded-xl px-4 py-3 text-center text-sm font-bold text-black"
                  >
                    {t("resultPayNow")}
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => setResultOpen(false)}
                  className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/75 hover:border-[var(--luxora-gold)] hover:text-white"
                >
                  {t("resultClose")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("galleryLabel")}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-5 top-5 z-10 rounded-full border border-white/15 bg-black/60 p-2 text-white/80 hover:text-white"
            aria-label={t("closeGallery")}
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {images.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPreviousImage();
              }}
              className="absolute left-4 z-10 rounded-full border border-white/15 bg-black/60 p-3 text-white/80 hover:text-white"
              aria-label={t("previousImage")}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          ) : null}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeImage]}
            alt={t("imageAlt", { name: product.productName, number: activeImage + 1 })}
            className="max-h-[82vh] max-w-[88vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />

          {images.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNextImage();
              }}
              className="absolute right-4 z-10 rounded-full border border-white/15 bg-black/60 p-3 text-white/80 hover:text-white"
              aria-label={t("nextImage")}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          ) : null}

          <div className="absolute bottom-5 rounded-full bg-black/65 px-4 py-2 text-xs text-white/70">
            {t("keyboardHint", { current: activeImage + 1, total: images.length })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
