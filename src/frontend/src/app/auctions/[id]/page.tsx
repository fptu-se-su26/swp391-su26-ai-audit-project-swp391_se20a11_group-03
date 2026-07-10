"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/layout/TopNav";
import WatchlistButton from "@/components/features/WatchlistButton";
import AuctionCountdownPanel from "@/components/features/AuctionCountdownPanel";
import PurchaseContractPanel from "@/components/features/PurchaseContractPanel";
import AuctionResultBanner from "@/components/features/AuctionResultBanner";
import StatusBadge from "@/components/ui/StatusBadge";
import { ApiError, getStoredToken } from "@/lib/apiClient";
import { useNavigationContext } from "@/lib/NavigationContext";
import { useTranslations } from "@/i18n/I18nProvider";
import { computeEffectiveAuctionStatus, getProductImage } from "@/lib/productPresentation";
import { canPayForWonAuction, isForfeitedPayment } from "@/lib/auctionPayment";
import {
  AuctionDeposit,
  AuctionEligibility,
  AuctionState,
  createAuctionDeposit,
  getAuctionEligibility,
  payAuction,
} from "@/lib/services/auctionService";
import { getProductDetail, ProductDetail } from "@/lib/services/productService";
import { getMyWallet, Wallet } from "@/lib/services/walletService";
import { forceRefresh, subscribeAuction } from "@/lib/services/auctionPolling";
import { getStoredUser } from "@/lib/userSession";
import { getPurchaseContract } from "@/lib/services/purchaseContractService";
import { calculateBidStep } from "@/lib/bidStep";
import { displayFont } from "@/components/luxe/theme";

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

function formatDateTime(value?: string | null, t?: (key: string) => string) {
  if (!value) {
    return t ? t("auction.dateUnknown") : "Chưa xác định";
  }

  return new Date(value).toLocaleString("vi-VN");
}

export default function AuctionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { parentPage, setParentPage } = useNavigationContext();
  const t = useTranslations("auction");
  const tCountdown = useTranslations("countdown");
  const tContracts = useTranslations("contracts");
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [eligibility, setEligibility] = useState<AuctionEligibility | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [liveState, setLiveState] = useState<AuctionState | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [depositSubmitting, setDepositSubmitting] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [purchaseContractSigned, setPurchaseContractSigned] = useState(false);
  const [error, setError] = useState("");
  const [panelError, setPanelError] = useState("");
  const [panelMessage, setPanelMessage] = useState("");

  const productId = Number(params.id);
  const auctionId = product?.auction?.auctionId ?? null;
  const hasToken = Boolean(getStoredToken());
  const effectiveStartTime = liveState?.startTime ?? product?.auction?.startTime ?? null;
  const effectiveEndTime = liveState?.endTime ?? product?.auction?.endTime ?? null;
  const auctionStatus = computeEffectiveAuctionStatus(
    liveState?.status ?? product?.auction?.status,
    effectiveStartTime,
    effectiveEndTime,
  );
  const isAuctionEnded =
    auctionStatus === "ENDED" ||
    auctionStatus === "AWAITING_PAYMENT" ||
    auctionStatus === "PAID" ||
    auctionStatus === "FORFEITED" ||
    Boolean(
      effectiveEndTime &&
        new Date(effectiveEndTime).getTime() <= Date.now() &&
        auctionStatus !== "UPCOMING",
    );

  useEffect(() => {
    if (!params.id) {
      return;
    }

    setLoading(true);
    setError("");

    getProductDetail(params.id)
      .then((data) => {
        setProduct(data);
        const effective = computeEffectiveAuctionStatus(
          data.auction?.status,
          data.auction?.startTime,
          data.auction?.endTime,
        );
        if (effective === "ENDED") {
          setParentPage("results");
        } else if (effective === "UPCOMING") {
          setParentPage("upcoming");
        } else {
          setParentPage("home");
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : t("errors.loadDetail")))
      .finally(() => setLoading(false));
  }, [params.id, setParentPage, t]);

  useEffect(() => {
    if (!auctionId || isAuctionEnded) {
      setEligibility(null);
      return;
    }

    setEligibilityLoading(true);
    setPanelError("");

    const requests: Promise<unknown>[] = [getAuctionEligibility(auctionId).then(setEligibility)];
    if (hasToken) {
      requests.push(
        getMyWallet()
          .then(setWallet)
          .catch((err) => {
            if (!(err instanceof ApiError && (err.status === 401 || err.status === 403))) {
              throw err;
            }
          }),
      );
    } else {
      setWallet(null);
    }

    Promise.all(requests)
      .catch((err) => setPanelError(err instanceof Error ? err.message : t("errors.loadEligibility")))
      .finally(() => setEligibilityLoading(false));
  }, [auctionId, isAuctionEnded, hasToken, t]);

  useEffect(() => {
    if (!auctionId) return;
    return subscribeAuction(auctionId, (state) => setLiveState(state));
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId || !hasToken || !isAuctionEnded) {
      setPurchaseContractSigned(false);
      return;
    }
    const me = getStoredUser();
    const amWinner =
      me?.userId != null &&
      liveState?.currentWinnerUserId != null &&
      Number(me.userId) === Number(liveState.currentWinnerUserId);
    if (!amWinner) {
      setPurchaseContractSigned(false);
      return;
    }
    getPurchaseContract(auctionId)
      .then((c) => setPurchaseContractSigned(Boolean(c.signed || c.acknowledged)))
      .catch(() => setPurchaseContractSigned(false));
  }, [auctionId, isAuctionEnded, hasToken, liveState?.currentWinnerUserId]);

  const images = useMemo(() => {
    if (product?.imageUrls?.length) {
      return product.imageUrls.map((imageUrl) => getProductImage(imageUrl));
    }

    return [getProductImage(product?.imageUrl)];
  }, [product?.imageUrl, product?.imageUrls]);

  const highestBid = liveState?.currentHighestBid ?? product?.currentBid ?? product?.startingPrice ?? 0;
  const isTimedBlind =
    product?.auctionMode === "TIMED" &&
    !isAuctionEnded &&
    Boolean(liveState?.priceHidden ?? true);
  const displayPrice = isTimedBlind
    ? (product?.startingPrice ?? 0)
    : highestBid;
  const countdownTarget =
    effectiveStartTime && new Date(effectiveStartTime).getTime() > Date.now()
      ? effectiveStartTime
      : effectiveEndTime;
  const depositAmount = eligibility?.depositAmount ?? Math.round((product?.startingPrice ?? 0) * 0.1);
  const walletBalance = wallet?.balance ?? 0;
  const needsTopUp = hasToken && eligibility != null && !eligibility.alreadyDeposited && walletBalance < depositAmount;
  const shortfall = Math.max(0, depositAmount - walletBalance);
  const breadcrumbHref = parentPage === "results" ? "/results" : parentPage === "upcoming" ? "/upcoming" : "/browse";

  const currentUserId = getStoredUser()?.userId;
  const isSellerOfProduct =
    currentUserId != null &&
    product?.sellerId != null &&
    Number(currentUserId) === Number(product.sellerId);

  async function handlePlaceDeposit() {
    if (!auctionId) {
      return;
    }

    if (!hasToken) {
      router.push("/auth");
      return;
    }

    setDepositSubmitting(true);
    setPanelError("");
    setPanelMessage("");

    try {
      const response: AuctionDeposit = await createAuctionDeposit(auctionId);
      setPanelMessage(t("errors.depositSuccess"));
      setEligibility((current) =>
        current
          ? {
              ...current,
              alreadyDeposited: true,
              depositAllowed: false,
              message: response.message,
            }
          : current,
      );
      setWallet((current) =>
        current
          ? {
              ...current,
              balance: response.walletBalance,
              holdBalance: response.walletHoldBalance,
            }
          : current,
      );
      forceRefresh(auctionId);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        router.push("/auth");
        return;
      }
      setPanelError(err instanceof Error ? err.message : t("errors.depositFailed"));
    } finally {
      setDepositSubmitting(false);
    }
  }

  async function handlePayAuction() {
    if (!auctionId) {
      return;
    }
    if (!hasToken) {
      router.push("/auth");
      return;
    }

    setPaymentSubmitting(true);
    setPanelError("");
    setPanelMessage("");

    try {
      const response = await payAuction(auctionId);
      setPanelMessage(response.message || t("paymentSuccess"));
      setWallet((current) =>
        current
          ? {
              ...current,
              balance: response.walletBalance,
              holdBalance: response.walletHoldBalance,
            }
          : current,
      );
      setLiveState((current) =>
        current
          ? {
              ...current,
              status: "PAID",
              paymentStatus: response.paymentStatus,
            }
          : current,
      );
      forceRefresh(auctionId);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        router.push("/auth");
        return;
      }
      setPanelError(err instanceof Error ? err.message : t("paymentFailed"));
    } finally {
      setPaymentSubmitting(false);
    }
  }

  function renderEligibilityAction() {
    if (isAuctionEnded) {
      return null;
    }

    if (!auctionId) {
      return (
        <div className="rounded-md bg-white/[0.04] px-4 py-3 text-sm text-[#b7aea3]">
          {t("endsNotConfigured")}
        </div>
      );
    }

    if (!hasToken) {
      return (
        <Link
          href="/auth"
          className="rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-4 py-3 text-center font-label-md text-label-md text-[#100d08] transition hover:-translate-y-0.5 hover:brightness-110"
        >
          {t("endsLoginToDeposit")}
        </Link>
      );
    }

    if (eligibilityLoading && !eligibility) {
      return (
        <div className="rounded-md bg-white/[0.04] px-4 py-3 text-center text-sm text-[#b7aea3]">
          {t("endsCheckingEligibility")}
        </div>
      );
    }

    if (eligibility && eligibility.kycVerified === false) {
      return (
        <Link
          href="/kyc"
          className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-center font-label-md text-label-md text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <span className="material-symbols-outlined text-[20px]">verified_user</span>
          {t("endsKycRequired")}
        </Link>
      );
    }

    if (eligibility?.alreadyDeposited) {
      return (
        <Link
          href={`/auction-room/${productId}`}
          className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-center font-label-md text-label-md text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
        >
          <span className="material-symbols-outlined text-[20px]">gavel</span>
          {t("endsEnterRoom")}
        </Link>
      );
    }

    if (!eligibility?.depositAllowed) {
      return (
        <button
          type="button"
          disabled
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-center font-label-md text-label-md text-[#9d948a]"
        >
          {t("endsDepositTimeExpired")}
        </button>
      );
    }

    if (needsTopUp) {
      return (
        <Link
          href="/wallet"
          className="rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-4 py-3 text-center font-label-md text-label-md text-[#100d08] transition hover:-translate-y-0.5 hover:brightness-110"
        >
          {t("endsTopUp", { amount: formatVnd(shortfall) })}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={handlePlaceDeposit}
        disabled={depositSubmitting}
        className="rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-4 py-3 text-center font-label-md text-label-md text-[#100d08] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {depositSubmitting ? t("endsDepositing") : t("endsDeposit", { amount: formatVnd(depositAmount) })}
      </button>
    );
  }

  return (
    <main className="min-h-screen luxe-page text-[#f5ead9]">
      <TopNav />

      <div className="mx-auto max-w-screen-2xl px-margin-mobile py-lg md:px-margin-desktop">
        <nav className="mb-md flex items-center gap-xs text-label-sm text-[#9d948a]">
          <Link href="/browse" className="hover:text-[#d4aa61]">{t("breadcrumbHome")}</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href={breadcrumbHref} className="hover:text-[#d4aa61]">
            {parentPage === "results" ? t("breadcrumbResults") : parentPage === "upcoming" ? t("breadcrumbUpcoming") : t("breadcrumbStorefront")}
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#f5ead9]">{t("breadcrumbLot", { id: params.id })}</span>
        </nav>

        {loading && (
          <div className="luxe-card skeleton-shimmer rounded-[24px] p-xl text-center text-[#9d948a]">
            {t("loadingDetail")}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-md text-red-300">
            {error}
          </div>
        )}

        {!loading && product && (
          <>
            <section className="grid gap-lg lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0e0d0b] shadow-[0_18px_55px_rgba(0,0,0,.5)]">
                  <img
                    src={images[activeImage]}
                    alt={product.productName}
                    className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-[1.02]"
                  />
                  <WatchlistButton productId={product.productId} className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/45 text-[#d4aa61] backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/60" />
                </div>
                <div className="mt-sm grid grid-cols-4 gap-sm">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setActiveImage(index)}
                      className={`overflow-hidden rounded-2xl border bg-[#0e0d0b] p-1 transition ${activeImage === index ? "border-[#d4aa61] shadow-[0_0_0_4px_rgba(212,170,97,.14)]" : "border-white/10 opacity-70 hover:opacity-100"}`}
                    >
                      <img src={image} alt="" className="aspect-[4/3] w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <aside className="space-y-md">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-sm flex items-center gap-sm">
                      <span className="font-label-sm text-label-sm text-[#9d948a]">LOT #{product.productId}</span>
                      <StatusBadge status={isAuctionEnded ? "ENDED" : auctionStatus} label={isAuctionEnded ? "ENDED" : auctionStatus} />
                    </div>
                    <h1 className={`${displayFont} text-[38px] font-medium leading-tight text-white`}>{product.productName}</h1>
                    <p className="mt-sm font-body-md text-[#b7aea3]">
                      {product.categoryName ?? t("uncategorized")} · {isAuctionEnded ? t("priceLabelFinal") : t("priceLabelCurrent")} {formatVnd(product.startingPrice)}
                    </p>
                  </div>
                  <WatchlistButton productId={product.productId} className="relative !static flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#9d948a] transition-all hover:scale-105 hover:border-[#d4aa61]/40 hover:text-[#d4aa61]" />
                </div>

                <div className={`rounded-[24px] border p-md ${isAuctionEnded ? "border-white/10 bg-[#0e0d0b]" : "border-[#d4aa61]/30 bg-[#d4aa61]/[0.06]"}`}>
                  <p className="font-label-sm text-label-sm text-[#9d948a]">
                    {isAuctionEnded ? t("priceLabelFinal") : isTimedBlind ? t("priceLabelStartingTimed") : t("priceLabelCurrent")}
                  </p>
                  <p className="mt-xs text-[34px] font-extrabold tracking-[-.03em] text-[#efcf88]">{formatVnd(displayPrice)}</p>
                  {isTimedBlind && (
                    <p className="mt-1 text-xs text-[#9d948a]">{t("timedBlindPriceHint")}</p>
                  )}
                  {product.auction ? (
                    <p className="mt-xs text-sm text-[#b7aea3]">
                      {t("auctionTimeRange", {
                        start: formatDateTime(product.auction.startTime, t),
                        end: formatDateTime(product.auction.endTime, t),
                      })}
                    </p>
                  ) : null}
                  {!isAuctionEnded && countdownTarget && (
                    <AuctionCountdownPanel
                      key={countdownTarget}
                      endsAt={countdownTarget}
                      mode={
                        effectiveStartTime && new Date(effectiveStartTime).getTime() > Date.now()
                          ? "upcoming"
                          : "live"
                      }
                      label={
                        effectiveStartTime && new Date(effectiveStartTime).getTime() > Date.now()
                          ? tCountdown("startsIn")
                          : t("priceTimeLeft")
                      }
                      auctionMode={product.auctionMode}
                      className="!mt-4"
                    />
                  )}
                </div>

                {isAuctionEnded && (
                  <AuctionResultBanner
                    productName={product.productName}
                    productId={productId}
                    finalPrice={highestBid}
                    winnerUsername={liveState?.winnerUsername}
                    winnerUserId={liveState?.currentWinnerUserId}
                    paymentStatus={liveState?.paymentStatus}
                    paymentDeadline={liveState?.paymentDeadline}
                  />
                )}

                {!isAuctionEnded && !isSellerOfProduct && (
                  <div className="rounded-[24px] border border-white/10 bg-[#0e0d0b] p-md">
                    <h2 className={`${displayFont} mb-xs text-headline-sm text-white`}>{t("biddingRequired")}</h2>
                    <p className="text-sm leading-relaxed text-[#b7aea3]">
                      {t("eligibilityDepositInfo", {
                        amount: formatVnd(depositAmount),
                        deadline: formatDateTime(eligibility?.depositDeadline, t),
                      })}
                    </p>

                    {eligibility?.message && (
                      <div className="mt-sm rounded-md bg-white/[0.04] px-4 py-3 text-sm text-[#b7aea3]">
                        {eligibility.message}
                      </div>
                    )}

                    {wallet && (
                      <div className="mt-sm grid grid-cols-2 gap-sm rounded-md border border-white/10 bg-white/[0.03] p-sm text-sm">
                        <div>
                          <p className="text-[#9d948a]">{t("walletAvailable")}</p>
                          <p className="mt-1 font-bold text-[#f5ead9]">{formatVnd(wallet.balance)}</p>
                        </div>
                        <div>
                          <p className="text-[#9d948a]">{t("walletHeld")}</p>
                          <p className="mt-1 font-bold text-[#f5ead9]">{formatVnd(wallet.holdBalance)}</p>
                        </div>
                      </div>
                    )}

                    {panelMessage && (
                      <div className="mt-sm rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                        {panelMessage}
                      </div>
                    )}

                    {panelError && (
                      <div className="mt-sm rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {panelError}
                      </div>
                    )}

                    <div className="mt-md grid gap-xs">
                      {renderEligibilityAction()}
                      <Link
                        href="/wallet"
                        className="rounded-md border border-white/10 px-4 py-3 text-center font-label-md text-label-md text-[#cfc6ba] hover:bg-white/[0.05]"
                      >
                        {t("openWallet")}
                      </Link>
                    </div>
                  </div>
                )}

                {!isAuctionEnded && eligibility?.alreadyDeposited && auctionId && (
                  <div className="rounded-lg border border-white/10 bg-[#0e0d0b] p-md">
                    <h3 className={`${displayFont} text-title-md text-white`}>
                      {t("depositPaid")}
                    </h3>
                    <p className="mt-xs text-sm text-[#b7aea3]">
                      {t("depositPaidDesc")}
                    </p>
                  </div>
                )}

                {isAuctionEnded && (() => {
                  const me = getStoredUser();
                  const amWinner =
                    me?.userId != null &&
                    liveState?.currentWinnerUserId != null &&
                    Number(me.userId) === Number(liveState.currentWinnerUserId);
                  if (!amWinner) return null;
                  const alreadyPaid = liveState?.paymentStatus === "PAID" || liveState?.status === "PAID";
                  const paymentExpired = isForfeitedPayment(
                    liveState?.paymentStatus ?? liveState?.status,
                    liveState?.paymentDeadline,
                  );
                  const canPay = canPayForWonAuction(
                    liveState?.paymentStatus ?? liveState?.status,
                    liveState?.paymentDeadline,
                  );

                  if (paymentExpired) {
                    return (
                      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-md">
                        <p className="font-headline-sm text-headline-sm text-red-300">{t("paymentOverdueTitle")}</p>
                        <p className="mt-2 text-sm text-[#b7aea3]">{t("paymentOverdueMsg")}</p>
                      </div>
                    );
                  }

                  return (
                    <div className="rounded-lg border border-white/10 bg-[#0e0d0b] p-md">
                      <div className="rounded-md border border-[#d4aa61]/40 bg-[#d4aa61]/[0.08] px-4 py-3 text-[#f5ead9]">
                        <p className={`${displayFont} text-headline-sm text-white`}>{t("winnerTitle")}</p>
                        <p className="mt-1 text-sm">
                          {alreadyPaid
                            ? t("paymentAlreadyPaid")
                            : liveState?.paymentDeadline
                              ? t("winnerPaymentMsg", { deadline: formatDateTime(liveState.paymentDeadline, t) })
                              : t("winnerPaymentMsgNoDeadline")}
                        </p>
                        {canPay && !alreadyPaid && auctionId && (
                          <div className="mt-sm">
                            <PurchaseContractPanel
                              auctionId={auctionId}
                              compact
                              onSigned={() => setPurchaseContractSigned(true)}
                            />
                          </div>
                        )}
                        {canPay && (
                          <button
                            type="button"
                            onClick={handlePayAuction}
                            disabled={alreadyPaid || paymentSubmitting || (!alreadyPaid && !purchaseContractSigned)}
                            className="mt-sm inline-block rounded-md bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-4 py-2 text-[#100d08] font-bold hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {alreadyPaid
                              ? t("paymentPaid")
                              : paymentSubmitting
                                ? t("paymentProcessing")
                                : purchaseContractSigned
                                  ? t("winnerPayNow")
                                  : tContracts("signBeforePay")}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {isAuctionEnded && (
                  <div className="rounded-lg border border-white/10 bg-[#0e0d0b] p-md">
                    <div className="grid gap-xs">
                      <Link
                        href="/results"
                        className="rounded-md bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-4 py-3 text-center font-label-md text-label-md text-[#100d08] hover:brightness-110"
                      >
                        {t("btnViewOtherAuctions")}
                      </Link>
                      <Link
                        href="/upcoming"
                        className="rounded-md border border-white/10 px-4 py-3 text-center font-label-md text-label-md text-[#cfc6ba] hover:bg-white/[0.05]"
                      >
                        {t("btnViewUpcoming")}
                      </Link>
                    </div>
                  </div>
                )}

                {auctionStatus === "ACTIVE" && !isAuctionEnded && !isSellerOfProduct && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/[0.08] p-md">
                    <p className="font-label-sm text-label-sm uppercase tracking-widest text-red-300">{t("auctionLive")}</p>
                    <p className="mt-1 text-sm text-[#b7aea3]">
                      {t("auctionLiveDesc")}
                    </p>
                    <Link
                      href={`/auction-room/${params.id}`}
                      className="mt-sm inline-flex w-full items-center justify-center gap-sm rounded-md bg-red-600 px-4 py-3 font-label-md text-label-md text-white hover:bg-red-700"
                    >
                      <span className="material-symbols-outlined text-[18px]">videocam</span>
                      {eligibility?.alreadyDeposited ? t("endsEnterRoom") : t("watchLive")}
                    </Link>
                  </div>
                )}
              </aside>
            </section>

            <section className="mt-xl grid gap-lg border-t border-white/10 pt-lg md:grid-cols-3">
              <div>
                <h2 className="mb-sm font-label-md text-label-md uppercase tracking-widest text-[#d4aa61]">{t("sectionDescription")}</h2>
                <p className="font-body-md leading-relaxed text-[#b7aea3]">
                  {product.description || t("conditionDefault")}
                </p>
              </div>
              <div>
                <h2 className="mb-sm font-label-md text-label-md uppercase tracking-widest text-[#d4aa61]">{t("sectionCondition")}</h2>
                <div className="rounded-md border border-white/10 bg-[#0e0d0b] p-md text-sm text-[#b7aea3]">
                  <p className="font-bold text-[#f5ead9]">{t("conditionStatus", { status: product.status })}</p>
                  <p className="mt-xs">{t("conditionReviewed")}</p>
                </div>
              </div>
              <div>
                <h2 className="mb-sm font-label-md text-label-md uppercase tracking-widest text-[#d4aa61]">{t("sectionProvenance")}</h2>
                <p className="font-body-md leading-relaxed text-[#b7aea3]">
                  {t("provenanceDetail", { category: product.categoryName ?? t("uncategorized"), productId: product.productId })}
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
