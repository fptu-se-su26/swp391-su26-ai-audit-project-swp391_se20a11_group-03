"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TopNav from "@/components/layout/TopNav";
import WatchlistButton from "@/components/features/WatchlistButton";
import CountdownTimer from "@/components/features/CountdownTimer";
import { ApiError, getStoredToken } from "@/lib/apiClient";
import { useNavigationContext } from "@/lib/NavigationContext";
import { useTranslations } from "@/i18n/I18nProvider";
import { computeEffectiveAuctionStatus, getProductImage } from "@/lib/productPresentation";
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
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [eligibility, setEligibility] = useState<AuctionEligibility | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [liveState, setLiveState] = useState<AuctionState | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [depositSubmitting, setDepositSubmitting] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [panelError, setPanelError] = useState("");
  const [panelMessage, setPanelMessage] = useState("");

  const productId = Number(params.id);
  const auctionId = product?.auction?.auctionId ?? null;
  const hasToken = Boolean(getStoredToken());
  const auctionStatus = computeEffectiveAuctionStatus(
    product?.auction?.status,
    product?.auction?.startTime,
    product?.auction?.endTime,
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
    if (!auctionId || auctionStatus === "ENDED") {
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
  }, [auctionId, auctionStatus, hasToken, t]);

  useEffect(() => {
    if (!auctionId) return;
    return subscribeAuction(auctionId, (state) => setLiveState(state));
  }, [auctionId]);

  const images = useMemo(() => {
    if (product?.imageUrls?.length) {
      return product.imageUrls.map((imageUrl) => getProductImage(imageUrl));
    }

    return [getProductImage(product?.imageUrl)];
  }, [product?.imageUrl, product?.imageUrls]);

  const highestBid = product?.currentBid ?? product?.startingPrice ?? 0;
  const depositAmount = eligibility?.depositAmount ?? Math.round((product?.startingPrice ?? 0) * 0.1);
  const walletBalance = wallet?.balance ?? 0;
  const needsTopUp = hasToken && eligibility != null && !eligibility.alreadyDeposited && walletBalance < depositAmount;
  const shortfall = Math.max(0, depositAmount - walletBalance);
  const breadcrumbHref = parentPage === "results" ? "/results" : parentPage === "upcoming" ? "/upcoming" : "/";

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
    if (auctionStatus === "ENDED") {
      return (
        <div className="rounded-md bg-error-container px-4 py-3 text-center font-label-md text-label-md text-on-error-container">
          {t("endsEnded")}
        </div>
      );
    }

    if (!auctionId) {
      return (
        <div className="rounded-md bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          {t("endsNotConfigured")}
        </div>
      );
    }

    if (!hasToken) {
      return (
        <Link
          href="/auth"
          className="rounded-md bg-primary px-4 py-3 text-center font-label-md text-label-md text-on-primary hover:opacity-90"
        >
          {t("endsLoginToDeposit")}
        </Link>
      );
    }

    if (eligibilityLoading && !eligibility) {
      return (
        <div className="rounded-md bg-surface-container-low px-4 py-3 text-center text-sm text-on-surface-variant">
          {t("endsCheckingEligibility")}
        </div>
      );
    }

    if (eligibility && eligibility.kycVerified === false) {
      return (
        <Link
          href="/kyc"
          className="flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-3 text-center font-label-md text-label-md text-on-secondary transition-colors hover:bg-secondary-fixed-dim"
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
          className="flex items-center justify-center gap-2 rounded-md bg-tertiary-fixed px-4 py-3 text-center font-label-md text-label-md text-on-tertiary-fixed-variant transition-colors hover:opacity-90"
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
          className="rounded-md bg-surface-container-low px-4 py-3 text-center font-label-md text-label-md text-on-surface-variant"
        >
          {t("endsDepositTimeExpired")}
        </button>
      );
    }

    if (needsTopUp) {
      return (
        <Link
          href="/wallet"
          className="rounded-md bg-primary px-4 py-3 text-center font-label-md text-label-md text-on-primary hover:opacity-90"
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
        className="rounded-md bg-primary px-4 py-3 text-center font-label-md text-label-md text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {depositSubmitting ? t("endsDepositing") : t("endsDeposit", { amount: formatVnd(depositAmount) })}
      </button>
    );
  }

  return (
    <main className="min-h-screen bg-surface-container-lowest text-on-surface">
      <TopNav />

      <div className="mx-auto max-w-screen-2xl px-margin-mobile py-lg md:px-margin-desktop">
        <nav className="mb-md flex items-center gap-xs text-label-sm text-on-surface-variant">
          <Link href="/" className="hover:text-primary">{t("breadcrumbHome")}</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href={breadcrumbHref} className="hover:text-primary">
            {parentPage === "results" ? t("breadcrumbResults") : parentPage === "upcoming" ? t("breadcrumbUpcoming") : t("breadcrumbStorefront")}
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary">{t("breadcrumbLot", { id: params.id })}</span>
        </nav>

        {loading && (
          <div className="rounded-lg border border-outline-variant bg-surface p-xl text-center text-on-surface-variant">
            {t("loadingDetail")}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-error/30 bg-error-container p-md text-error">
            {error}
          </div>
        )}

        {!loading && product && (
          <>
            <section className="grid gap-lg lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="relative overflow-hidden rounded-lg border border-outline-variant bg-surface">
                  <img
                    src={images[activeImage]}
                    alt={product.productName}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <WatchlistButton productId={product.productId} className="absolute right-3 top-3 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-surface/90 text-on-surface shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:text-error" />
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

              <aside className="space-y-md">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-sm flex items-center gap-sm">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">LOT #{product.productId}</span>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                        auctionStatus === "ENDED"
                          ? "bg-error-container text-on-error-container"
                          : "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                      }`}>
                        {auctionStatus}
                      </span>
                    </div>
                    <h1 className="text-[36px] font-bold leading-tight text-primary">{product.productName}</h1>
                    <p className="mt-sm font-body-md text-on-surface-variant">
                      {product.categoryName ?? t("uncategorized")} · {auctionStatus === "ENDED" ? t("priceLabelFinal") : t("priceLabelCurrent")} {formatVnd(product.startingPrice)}
                    </p>
                  </div>
                  <WatchlistButton productId={product.productId} className="relative !static flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant shadow-sm hover:border-error hover:text-error hover:scale-105 transition-all" />
                </div>

                <div className={`rounded-lg border p-md ${auctionStatus === "ENDED" ? "border-outline-variant bg-surface" : "border-secondary/30 bg-secondary-container/30"}`}>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {auctionStatus === "ENDED" ? t("priceLabelFinal") : t("priceLabelCurrent")}
                  </p>
                  <p className="mt-xs text-[32px] font-bold text-primary">{formatVnd(highestBid)}</p>
                  {product.auction ? (
                    <p className="mt-xs text-sm text-on-surface-variant">
                      {t("auctionTimeRange", {
                        start: formatDateTime(product.auction.startTime, t),
                        end: formatDateTime(product.auction.endTime, t),
                      })}
                    </p>
                  ) : null}
                  {auctionStatus !== "ENDED" && product.auction?.endTime && (
                    <div className="mt-sm flex items-center gap-sm">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{t("priceTimeLeft")}</span>
                      <CountdownTimer
                        endsAt={product.auction.endTime}
                        variant={product.auctionMode === "TIMED" ? "timed" : "live"}
                      />
                      {product.auctionMode && (
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          product.auctionMode === "LIVE"
                            ? "bg-error-container text-on-error-container animate-pulse"
                            : "bg-secondary-container text-on-secondary-container"
                        }`}>
                          {product.auctionMode}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {auctionStatus !== "ENDED" && !isSellerOfProduct && (
                  <div className="rounded-lg border border-outline-variant bg-surface p-md shadow-sm">
                    <h2 className="mb-xs font-headline-sm text-headline-sm text-primary">{t("biddingRequired")}</h2>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      {t("eligibilityDepositInfo", {
                        amount: formatVnd(depositAmount),
                        deadline: formatDateTime(eligibility?.depositDeadline, t),
                      })}
                    </p>

                    {eligibility?.message && (
                      <div className="mt-sm rounded-md bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                        {eligibility.message}
                      </div>
                    )}

                    {wallet && (
                      <div className="mt-sm grid grid-cols-2 gap-sm rounded-md border border-outline-variant bg-surface-container-low p-sm text-sm">
                        <div>
                          <p className="text-on-surface-variant">{t("walletAvailable")}</p>
                          <p className="mt-1 font-bold text-on-surface">{formatVnd(wallet.balance)}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant">{t("walletHeld")}</p>
                          <p className="mt-1 font-bold text-on-surface">{formatVnd(wallet.holdBalance)}</p>
                        </div>
                      </div>
                    )}

                    {panelMessage && (
                      <div className="mt-sm rounded-md border border-tertiary-fixed/40 bg-tertiary-fixed/15 px-4 py-3 text-sm text-on-tertiary-fixed-variant">
                        {panelMessage}
                      </div>
                    )}

                    {panelError && (
                      <div className="mt-sm rounded-md border border-error/30 bg-error-container/25 px-4 py-3 text-sm text-error">
                        {panelError}
                      </div>
                    )}

                    <div className="mt-md grid gap-xs">
                      {renderEligibilityAction()}
                      <Link
                        href="/wallet"
                        className="rounded-md border border-outline-variant px-4 py-3 text-center font-label-md text-label-md text-on-surface hover:bg-surface-container-low"
                      >
                        {t("openWallet")}
                      </Link>
                    </div>
                  </div>
                )}

                {auctionStatus !== "ENDED" && eligibility?.alreadyDeposited && auctionId && (
                  <div className="rounded-lg border border-outline-variant bg-surface p-md">
                    <h3 className="font-title-md text-title-md text-on-surface">
                      {t("depositPaid")}
                    </h3>
                    <p className="mt-xs text-sm text-on-surface-variant">
                      {t("depositPaidDesc")}
                    </p>
                  </div>
                )}

                {auctionStatus === "ENDED" && (
                  <div className="rounded-lg border border-outline-variant bg-surface p-md">
                    <h2 className="mb-xs font-headline-sm text-headline-sm text-primary">{t("auctionClosed")}</h2>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      {t("auctionEndedMsg")}
                    </p>
                    {(liveState?.paymentDeadline || liveState?.currentWinnerUserId) && (() => {
                      const me = getStoredUser();
                      const amWinner = me?.userId != null && liveState.currentWinnerUserId === me.userId;
                      if (!amWinner) return null;
                      const alreadyPaid = liveState.paymentStatus === "PAID" || liveState.status === "PAID";
                      return (
                        <div className="mt-md rounded-md border border-tertiary-fixed/40 bg-tertiary-container px-4 py-3 text-on-tertiary-container">
                          <p className="font-headline-sm text-headline-sm">{t("winnerTitle")}</p>
                          <p className="mt-1 text-sm">
                            {alreadyPaid
                              ? t("paymentAlreadyPaid")
                              : liveState.paymentDeadline
                              ? t("winnerPaymentMsg", { deadline: formatDateTime(liveState.paymentDeadline, t) })
                              : t("winnerPaymentMsgNoDeadline")}
                          </p>
                          <button
                            type="button"
                            onClick={handlePayAuction}
                            disabled={alreadyPaid || paymentSubmitting}
                            className="mt-sm inline-block rounded-md bg-tertiary-fixed px-4 py-2 text-on-tertiary-fixed-variant hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {alreadyPaid ? t("paymentPaid") : paymentSubmitting ? t("paymentProcessing") : t("winnerPayNow")}
                          </button>
                        </div>
                      );
                    })()}
                    <div className="mt-md grid gap-xs">
                      <Link
                        href="/results"
                        className="rounded-md bg-primary px-4 py-3 text-center font-label-md text-label-md text-on-primary hover:opacity-90"
                      >
                        {t("btnViewOtherAuctions")}
                      </Link>
                      <Link
                        href="/upcoming"
                        className="rounded-md border border-outline-variant px-4 py-3 text-center font-label-md text-label-md text-on-surface hover:bg-surface-container-low"
                      >
                        {t("btnViewUpcoming")}
                      </Link>
                    </div>
                  </div>
                )}

                {auctionStatus === "ACTIVE" && !isSellerOfProduct && (
                  <div className="rounded-lg border border-error/30 bg-error-container/10 p-md">
                    <p className="font-label-sm text-label-sm uppercase tracking-widest text-error">{t("auctionLive")}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {t("auctionLiveDesc")}
                    </p>
                    {eligibility?.alreadyDeposited ? (
                      <Link
                        href={`/auction-room/${params.id}`}
                        className="mt-sm inline-flex w-full items-center justify-center gap-sm rounded-md bg-error px-4 py-3 font-label-md text-label-md text-on-error hover:opacity-90"
                      >
                        <span className="material-symbols-outlined text-[18px]">videocam</span>
                        {t("endsEnterRoom")}
                      </Link>
                    ) : null}
                  </div>
                )}
              </aside>
            </section>

            <section className="mt-xl grid gap-lg border-t border-outline-variant pt-lg md:grid-cols-3">
              <div>
                <h2 className="mb-sm font-label-md text-label-md uppercase tracking-widest text-secondary">{t("sectionDescription")}</h2>
                <p className="font-body-md leading-relaxed text-on-surface-variant">
                  {product.description || t("conditionDefault")}
                </p>
              </div>
              <div>
                <h2 className="mb-sm font-label-md text-label-md uppercase tracking-widest text-secondary">{t("sectionCondition")}</h2>
                <div className="rounded-md bg-surface p-md text-sm text-on-surface-variant">
                  <p className="font-bold text-on-surface">{t("conditionStatus", { status: product.status })}</p>
                  <p className="mt-xs">{t("conditionReviewed")}</p>
                </div>
              </div>
              <div>
                <h2 className="mb-sm font-label-md text-label-md uppercase tracking-widest text-secondary">{t("sectionProvenance")}</h2>
                <p className="font-body-md leading-relaxed text-on-surface-variant">
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
