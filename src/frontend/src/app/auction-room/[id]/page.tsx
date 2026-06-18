"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/layout/TopNav";
import WatchlistButton from "@/components/features/WatchlistButton";
import CountdownTimer from "@/components/features/CountdownTimer";
import BidPanel from "@/components/features/BidPanel";
import BidHistory from "@/components/features/BidHistory";
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
    product?.auction?.status,
    product?.auction?.startTime,
    product?.auction?.endTime
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
    if (!auctionId || auctionStatus === "ENDED") {
      setEligibility(null);
      return;
    }
    getAuctionEligibility(auctionId)
      .then(setEligibility)
      .catch(() => setEligibility(null));
  }, [auctionId, auctionStatus]);

  const images = useMemo(() => {
    if (product?.imageUrls?.length) {
      return product.imageUrls.map((url) => getProductImage(url));
    }
    return [getProductImage(product?.imageUrl)];
  }, [product?.imageUrl, product?.imageUrls]);

  const currentBid = product?.currentBid ?? product?.startingPrice ?? 0;
  const sellerCanEnter = isSellerOfProduct;
  const canEnterBidding = sellerCanEnter || eligibility?.alreadyDeposited;

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

  if (auctionStatus === "ENDED") {
    return (
      <main className="min-h-screen bg-surface-container-lowest text-on-surface">
        <TopNav />
        <div className="mx-auto max-w-screen-2xl px-margin-mobile py-xl md:px-margin-desktop">
          <div className="rounded-lg border border-outline-variant bg-surface p-md">
            <h2 className="font-headline-md text-headline-md text-primary">{t("roomClosedTitle")}</h2>
            <p className="mt-sm text-on-surface-variant">
              {t("roomClosedDesc", { productName: product.productName })}
            </p>
            <div className="mt-md flex gap-sm">
              <Link
                href="/results"
                className="rounded-md bg-primary px-md py-sm text-on-primary hover:opacity-90"
              >
                {t("btnViewResults")}
              </Link>
              <Link
                href={`/auctions/${productId}`}
                className="rounded-md border border-outline-variant px-md py-sm text-on-surface hover:bg-surface-container-low"
              >
                {t("btnProductDetail")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (auctionStatus === "UPCOMING") {
    return (
      <main className="min-h-screen bg-surface-container-lowest text-on-surface">
        <TopNav />
        <div className="mx-auto max-w-screen-2xl px-margin-mobile py-xl md:px-margin-desktop">
          <div className="rounded-lg border border-secondary/40 bg-secondary-container/20 p-md">
            <h2 className="font-headline-md text-headline-md text-primary">{t("roomNotOpenTitle")}</h2>
            <p className="mt-sm text-on-surface-variant">
              {t("roomNotOpenDesc", { productName: product.productName, startTime: formatDateTime(product.auction?.startTime) })}
            </p>
            <p className="mt-sm text-on-surface-variant">
              {t("roomNotOpenReturn")}
            </p>
            <Link
              href="/upcoming"
              className="mt-md inline-block rounded-md bg-primary px-md py-sm text-on-primary hover:opacity-90"
            >
              {t("btnUpcomingAuctions")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-container-lowest text-on-surface">
      <TopNav />

      {/* Live banner */}
      <div className="bg-error-container text-on-error-container">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-md px-margin-mobile py-xs md:px-margin-desktop">
          <div className="flex items-center gap-sm">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-on-error-container opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-on-error-container"></span>
            </span>
            <span className="font-label-md text-label-md uppercase tracking-widest">{t("liveBanner")}</span>
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
              <p className="font-label-sm text-label-sm uppercase tracking-widest text-error">{t("currentPrice")}</p>
              <p className="mt-1 text-[36px] font-bold text-primary">
                {formatVnd(liveState?.currentHighestBid || currentBid)}
              </p>
              <div className="mt-sm flex items-center gap-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant">{t("timeRemaining")}</span>
                <CountdownTimer
                  endsAt={product.auction?.endTime}
                  variant={product.auctionMode === "TIMED" ? "timed" : "live"}
                />
              </div>
            </div>

            {isSellerOfProduct ? (
              <div className="rounded-lg border border-tertiary/30 bg-tertiary-container/20 p-md">
                <p className="font-label-md text-label-md text-primary">{t("sellerBannerTitle")}</p>
                <p className="mt-xs text-sm text-on-surface-variant">
                  {t("sellerBannerDesc")}
                </p>
              </div>
            ) : canEnterBidding ? (
              <BidPanel
                auctionId={auctionId!}
                currentBid={currentBid}
                canBid={true}
                onBidPlaced={() => {
                  getProductDetail(params.id).then((p) => setProduct(p)).catch(() => {});
                }}
              />
            ) : (
              <div className="rounded-lg border border-outline-variant bg-surface p-md space-y-sm">
                <p className="font-label-md text-label-md text-primary">{t("depositRequiredTitle")}</p>
                <p className="text-sm text-on-surface-variant">
                  {t("depositRequiredDesc")}
                </p>
                <Link
                  href={`/auctions/${productId}`}
                  className="block rounded-md bg-primary px-md py-sm text-center text-on-primary hover:opacity-90"
                >
                  {t("btnGoToDeposit")}
                </Link>
              </div>
            )}

            {auctionId && <BidHistory auctionId={auctionId} maxItems={8} />}
          </div>

          {/* Right: Live chat */}
          <div className="lg:sticky lg:top-md lg:self-start lg:max-h-[calc(100vh-2rem)]">
            <div className="flex h-[600px] lg:h-[calc(100vh-2rem)] flex-col rounded-lg border border-outline-variant bg-surface overflow-hidden">
              <div className="flex items-center justify-between border-b border-outline-variant px-md py-sm">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-secondary">forum</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">{t("chatRoomTitle")}</h3>
                </div>
                <span className="rounded-full bg-tertiary-container px-2 py-0.5 text-[10px] font-bold uppercase text-on-tertiary-container">
                  {t("chatLive")}
                </span>
              </div>
              <div className="flex-1 min-h-0 p-md overflow-y-auto">
                <div className="text-center text-sm text-on-surface-variant py-xl">
                  <span className="material-symbols-outlined text-4xl block mb-sm text-secondary">forum</span>
                  <p className="font-label-md text-label-md text-primary">{t("chatLiveRoom")}</p>
                  <p className="mt-xs">{t("chatComingSoon")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
