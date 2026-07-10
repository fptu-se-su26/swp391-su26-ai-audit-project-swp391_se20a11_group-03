"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TopNav from "@/components/layout/TopNav";
import WatchlistButton from "@/components/features/WatchlistButton";
import AuctionCountdownPanel from "@/components/features/AuctionCountdownPanel";
import BidPanel from "@/components/features/BidPanel";
import BidHistory from "@/components/features/BidHistory";
import LiveBidActivity from "@/components/features/LiveBidActivity";
import AuctionRoomChat from "@/components/features/AuctionRoomChat";
import AuctionResultBanner from "@/components/features/AuctionResultBanner";
import { getStoredToken } from "@/lib/apiClient";
import { useTranslations } from "@/i18n/I18nProvider";
import { computeEffectiveAuctionStatus, getProductImage } from "@/lib/productPresentation";
import {
  AuctionEligibility,
  AuctionState,
  getAuctionEligibility,
} from "@/lib/services/auctionService";
import { getProductDetail, ProductDetail } from "@/lib/services/productService";
import { subscribeAuction } from "@/lib/services/auctionPolling";
import { getStoredUser, subscribeStoredUser } from "@/lib/userSession";
import { calculateBidStep } from "@/lib/bidStep";

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN");
}

export default function AuctionRoomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("auctionRoom");
  const tCountdown = useTranslations("countdown");
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [eligibility, setEligibility] = useState<AuctionEligibility | null>(null);
  const [liveState, setLiveState] = useState<AuctionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const productId = Number(params.id);
  const auctionId = product?.auction?.auctionId ?? null;
  const hasToken = Boolean(getStoredToken());
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const isSellerOfProduct =
    currentUser?.userId != null &&
    product?.sellerId != null &&
    Number(currentUser.userId) === Number(product.sellerId);

  const auctionStatus = computeEffectiveAuctionStatus(
    liveState?.status ?? product?.auction?.status,
    liveState?.startTime ?? product?.auction?.startTime,
    liveState?.endTime ?? product?.auction?.endTime
  );

  const effectiveStartTime = liveState?.startTime ?? product?.auction?.startTime ?? null;
  const effectiveEndTime = liveState?.endTime ?? product?.auction?.endTime ?? null;

  const isAuctionEnded =
    auctionStatus === "ENDED" ||
    auctionStatus === "AWAITING_PAYMENT" ||
    auctionStatus === "PAID" ||
    auctionStatus === "FORFEITED" ||
    Boolean(
      effectiveEndTime &&
        new Date(effectiveEndTime).getTime() <= Date.now() &&
        auctionStatus !== "UPCOMING"
    );

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    setError("");
    getProductDetail(params.id)
      .then((data) => setProduct(data))
      .catch((err) => setError(err instanceof Error ? err.message : t("errors.loadProduct")))
      .finally(() => setLoading(false));
  }, [params.id, t]);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    return subscribeStoredUser(() => setCurrentUser(getStoredUser()));
  }, []);

  useEffect(() => {
    if (!auctionId) return;
    return subscribeAuction(auctionId, (state) => setLiveState(state));
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId || isAuctionEnded) {
      setEligibility(null);
      return;
    }
    getAuctionEligibility(auctionId)
      .then(setEligibility)
      .catch(() => setEligibility(null));
  }, [auctionId, isAuctionEnded]);

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-container-lowest text-on-surface">
        <TopNav />
        <div className="mx-auto max-w-screen-2xl px-margin-mobile py-xl md:px-margin-desktop">
          <div className="rounded-lg border border-outline-variant bg-surface p-xl text-center text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin inline-block text-4xl">progress_activity</span>
            <p className="mt-sm">{t("loadingOpening")}</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-surface-container-lowest text-on-surface">
        <TopNav />
        <div className="mx-auto max-w-screen-2xl px-margin-mobile py-xl md:px-margin-desktop">
          <div className="rounded-lg border border-error/30 bg-error-container p-md text-error">
            {error || t("errorNotFound")}
          </div>
          <Link
            href="/dashboard"
            className="mt-md inline-block rounded-md bg-primary px-md py-sm text-on-primary hover:opacity-90"
          >
            {t("btnBackDashboard")}
          </Link>
        </div>
      </main>
    );
  }

  const images = product.imageUrls?.length
    ? product.imageUrls.map((url) => getProductImage(url))
    : [getProductImage(product.imageUrl)];

  const currentBid = product.currentBid ?? product.startingPrice ?? 0;
  const startingPrice = product.startingPrice ?? 0;
  const bidStep = calculateBidStep(startingPrice);
  const displayCurrentBid = liveState?.currentHighestBid ?? currentBid;
  const auctionMode = product.auctionMode === "TIMED" ? "TIMED" : "LIVE";
  const isTimedBlind =
    auctionMode === "TIMED" &&
    !isAuctionEnded &&
    Boolean(liveState?.priceHidden ?? true);
  const sellerCanEnter = isSellerOfProduct;
  const canBid = sellerCanEnter || eligibility?.alreadyDeposited;
  const countdownTarget =
    effectiveStartTime && new Date(effectiveStartTime).getTime() > Date.now()
      ? effectiveStartTime
      : effectiveEndTime;

  if (auctionStatus === "UPCOMING") {
    const upcomingStart = effectiveStartTime ?? product.auction?.startTime ?? null;
    return (
      <main className="min-h-screen luxe-page text-[#f5ead9]">
        <TopNav />
        <div className="mx-auto max-w-screen-2xl px-margin-mobile py-xl md:px-margin-desktop">
          <div className="rounded-2xl border border-[#d4aa61]/40 bg-[#0e0d0b] p-md sm:p-lg">
            <h2 className="text-2xl font-semibold text-[#f5ead9]">{t("roomNotOpenTitle")}</h2>
            <p className="mt-sm text-[#b7aea3]">
              {t("roomNotOpenDesc", { productName: product.productName, startTime: formatDateTime(product.auction?.startTime) })}
            </p>
            {upcomingStart && (
              <AuctionCountdownPanel
                endsAt={upcomingStart}
                mode="upcoming"
                auctionMode={product.auctionMode}
              />
            )}
            <p className="mt-md text-sm text-[#9d948a]">{t("roomNotOpenReturn")}</p>
            <div className="mt-md flex flex-wrap gap-3">
              <Link
                href={`/auctions/${productId}`}
                className="inline-block rounded-md border border-[#d4aa61]/50 px-md py-sm text-[#efcf88] hover:bg-[#d4aa61]/10"
              >
                {t("btnViewProductDetail")}
              </Link>
              <Link
                href="/upcoming"
                className="inline-block rounded-md bg-[#c99a4b] px-md py-sm font-semibold text-[#100d08] hover:brightness-110"
              >
                {t("btnUpcomingAuctions")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-container-lowest text-on-surface">
      <TopNav />

      {/* Live / ended banner */}
      <div className={isAuctionEnded ? "bg-surface-container-high text-on-surface" : "bg-error-container text-on-error-container"}>
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-md px-margin-mobile py-xs md:px-margin-desktop">
          <div className="flex items-center gap-sm">
            {!isAuctionEnded && (
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-on-error-container opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-on-error-container"></span>
              </span>
            )}
            <span className="font-label-md text-label-md uppercase tracking-widest">
              {isAuctionEnded ? t("sessionEnded") : t("liveBanner")}
            </span>
          </div>
          <Link
            href={`/auctions/${productId}`}
            className="text-xs hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">info</span>
            {t("btnViewProductDetail")}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-margin-mobile py-lg md:px-margin-desktop">
        <div className="grid gap-lg lg:grid-cols-[1.2fr_1fr_0.9fr]">
          {/* Left: Product visualization */}
          <div>
            <div className="relative overflow-hidden rounded-lg border border-outline-variant bg-surface">
              <img
                src={images[activeImage]}
                alt={product.productName}
                className="aspect-[4/3] w-full object-cover"
              />
              <WatchlistButton
                productId={product.productId}
                className="absolute right-3 top-3 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-surface/90 text-on-surface shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:text-error"
              />
            </div>
            <div className="mt-sm grid grid-cols-4 gap-sm">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden rounded-md border ${activeImage === index ? "border-secondary" : "border-outline-variant opacity-70 hover:opacity-100"}`}
                >
                  <img src={image} alt="" className="aspect-[4/3] w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Bidding + History */}
          <div className="space-y-md">
            <div>
              <p className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">LOT #{product.productId}</p>
              <h1 className="mt-1 text-[28px] font-bold leading-tight text-primary">{product.productName}</h1>
              <p className="mt-1 text-sm text-on-surface-variant">
                {product.categoryName ?? t("uncategorized")} · {t("sellerLabel", { sellerId: product.sellerId ?? "-" })}
              </p>
            </div>

            <div className="rounded-lg border border-error/30 bg-error-container/10 p-md">
              <p className="font-label-sm text-label-sm uppercase tracking-widest text-error">
                {isTimedBlind ? t("timedBlindPriceLabel") : t("currentPrice")}
              </p>
              <p className="mt-1 text-[36px] font-bold text-primary">
                {isTimedBlind ? formatVnd(startingPrice) : formatVnd(displayCurrentBid)}
              </p>
              {isTimedBlind && (
                <p className="mt-1 text-xs text-on-surface-variant">{t("timedBlindPriceHint")}</p>
              )}
              {!isAuctionEnded && countdownTarget && (
                <AuctionCountdownPanel
                  key={countdownTarget ?? "no-timer"}
                  endsAt={countdownTarget}
                  mode={
                    effectiveStartTime && new Date(effectiveStartTime).getTime() > Date.now()
                      ? "upcoming"
                      : "live"
                  }
                  label={
                    effectiveStartTime && new Date(effectiveStartTime).getTime() > Date.now()
                      ? tCountdown("startsIn")
                      : t("timeRemaining")
                  }
                  auctionMode={product.auctionMode}
                />
              )}
            </div>

            {isAuctionEnded ? (
              <AuctionResultBanner
                productName={product.productName}
                productId={productId}
                finalPrice={displayCurrentBid}
                winnerUsername={liveState?.winnerUsername}
                winnerUserId={liveState?.currentWinnerUserId}
                paymentStatus={liveState?.paymentStatus}
                paymentDeadline={liveState?.paymentDeadline}
              />
            ) : (
              <>
                {auctionId && !isTimedBlind && <LiveBidActivity auctionId={auctionId} />}

                {isSellerOfProduct ? (
                  <div className="rounded-lg border border-tertiary/30 bg-tertiary-container/20 p-md">
                    <p className="font-label-md text-label-md text-primary">{t("sellerBannerTitle")}</p>
                    <p className="mt-xs text-sm text-on-surface-variant">
                      {t("sellerBannerDesc")}
                    </p>
                  </div>
                ) : canBid ? (
                  <BidPanel
                    auctionId={auctionId!}
                    currentBid={displayCurrentBid}
                    startingPrice={startingPrice}
                    bidStep={bidStep}
                    auctionMode={product.auctionMode === "TIMED" ? "TIMED" : "LIVE"}
                    canBid={true}
                    onBidPlaced={() => {
                      getProductDetail(params.id).then((p) => setProduct(p)).catch(() => {});
                    }}
                  />
                ) : hasToken && eligibility?.kycVerified === false ? (
                  <div className="rounded-lg border border-secondary/40 bg-secondary-container/20 p-md space-y-sm">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-secondary">verified_user</span>
                      <p className="font-label-md text-label-md text-primary">{t("kycRequiredTitle")}</p>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {t("kycRequiredDesc")}
                    </p>
                    <Link
                      href="/kyc"
                      className="block rounded-md bg-secondary px-md py-sm text-center text-on-secondary hover:bg-secondary-fixed-dim"
                    >
                      {t("btnGoToKyc")}
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-lg border border-outline-variant bg-surface p-md space-y-sm">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-error">visibility</span>
                      <p className="font-label-md text-label-md text-primary">{t("spectatorTitle")}</p>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {t("spectatorDesc")}
                    </p>
                    <Link
                      href={`/auctions/${productId}`}
                      className="block rounded-md bg-primary px-md py-sm text-center text-on-primary hover:opacity-90"
                    >
                      {t("btnGoToDeposit")}
                    </Link>
                  </div>
                )}
              </>
            )}

            {auctionId && (
              <BidHistory
                auctionId={auctionId}
                maxItems={8}
                anonymous={isTimedBlind}
              />
            )}
          </div>

          {/* Right: Live chat */}
          <div className="lg:sticky lg:top-md lg:self-start lg:max-h-[calc(100vh-2rem)]">
            {auctionId ? (
              <AuctionRoomChat auctionId={auctionId} endTime={effectiveEndTime} />
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
