"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import WatchlistButton from "@/components/features/WatchlistButton";
import {
  computeEffectiveAuctionStatus,
  getProductImage,
} from "@/lib/productPresentation";
import {
  CategorySummary,
  ProductSummary,
  getCategories,
  searchProducts,
} from "@/lib/services/productService";
import { StoredUser, getStoredUser, subscribeStoredUser } from "@/lib/userSession";
import { useTranslations } from "@/i18n/I18nProvider";

const numberFormatter = new Intl.NumberFormat("en-US");

type SessionStatus = "ACTIVE" | "UPCOMING" | "ENDED";

function formatTimeRemaining(endTime: string | null | undefined, t: (key: string, values?: Record<string, string | number>) => string) {
  if (!endTime) {
    return t("tbd");
  }
  const diffMs = new Date(endTime).getTime() - Date.now();
  if (diffMs <= 0) {
    return t("endedShort");
  }
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return t("daysHours", { days, hours });
  }
  if (hours > 0) {
    return t("hoursMinutes", { hours, minutes });
  }
  return t("minutesShort", { minutes });
}

type SectionProps = {
  titleKey: string;
  subtitleKey: string;
  tone: "live" | "upcoming" | "ended";
  products: ProductSummary[];
  isLoading: boolean;
  errorMessage: string;
  emptyKey: string;
  viewAllHref?: string;
};

function statusBadge(sessionStatus: SessionStatus, t: (key: string) => string) {
  if (sessionStatus === "ACTIVE") {
    return {
      className: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
      label: t("live"),
    };
  }
  if (sessionStatus === "UPCOMING") {
    return {
      className: "bg-secondary-container text-on-secondary-container",
      label: t("upcomingBadge"),
    };
  }
  return {
    className: "bg-error-container text-on-error-container",
    label: t("ended"),
  };
}

function ProductCard({ product }: { product: ProductSummary }) {
  const t = useTranslations("home");
  const sessionStatus = computeEffectiveAuctionStatus(
    product.auctionStatus,
    product.auctionStartTime,
    product.auctionEndTime,
  );
  const badge = statusBadge(sessionStatus, t);
  const highestBid = product.currentBid || product.startingPrice;
  const isLive = sessionStatus === "ACTIVE";
  const isEnded = sessionStatus === "ENDED";

  return (
    <Link
      href={`/auctions/${product.productId}`}
      className="group relative overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <WatchlistButton productId={product.productId} />
      <img
        src={getProductImage(product.imageUrl)}
        alt={product.productName}
        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="p-md">
        <div className="mb-xs flex items-center justify-between gap-sm">
          <span className="truncate font-label-sm text-label-sm text-outline">
            {product.categoryName ?? t("uncategorized")}
          </span>
          <span
            className={`rounded-full px-2 py-1 font-label-sm text-[10px] uppercase tracking-wide ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
        <h3 className="min-h-12 font-headline-sm text-headline-sm text-primary">{product.productName}</h3>
        <div className="mt-sm flex items-end justify-between gap-sm">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {isLive ? t("highestBid") : isEnded ? t("finalPrice") : t("startingPrice")}
            </p>
            <p className="font-label-lg text-label-lg text-on-surface">
              {numberFormatter.format(highestBid)} VND
            </p>
          </div>
          {isLive ? (
            <div className="text-right">
              <p className="font-label-sm text-label-sm text-on-surface-variant">{t("endsIn")}</p>
              <p className="font-label-md text-label-md font-bold text-error">
                {formatTimeRemaining(product.auctionEndTime, t)}
              </p>
            </div>
          ) : (
            <span className="font-label-md text-label-md text-secondary group-hover:underline">
              {t("details")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ProductSection({
  titleKey,
  subtitleKey,
  tone,
  products,
  isLoading,
  errorMessage,
  emptyKey,
  viewAllHref,
}: SectionProps) {
  const t = useTranslations("home");
  const headingTone =
    tone === "live"
      ? "text-tertiary-fixed"
      : tone === "upcoming"
        ? "text-secondary"
        : "text-on-surface-variant";

  return (
    <section className="mx-auto max-w-screen-2xl px-margin-mobile py-lg md:px-margin-desktop">
      <div className="mb-md flex items-end justify-between gap-sm">
        <div>
          <p
            className={`font-label-md text-label-md uppercase tracking-widest ${headingTone}`}
          >
            {t(subtitleKey)}
          </p>
          <h2 className="font-headline-lg text-headline-lg text-primary">{t(titleKey)}</h2>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="font-label-md text-label-md text-secondary hover:underline"
          >
            {t("viewAll")}
          </Link>
        )}
      </div>

      {errorMessage && (
        <div className="mb-md rounded-lg border border-error/30 bg-error-container px-4 py-3 text-error">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-lg border border-outline-variant bg-surface-container-low"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface p-xl text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">{t(emptyKey)}</p>
        </div>
      ) : (
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-surface-container-lowest text-on-surface">
          <TopNav />
        </main>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const t = useTranslations("home");
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [liveProducts, setLiveProducts] = useState<ProductSummary[]>([]);
  const [upcomingProducts, setUpcomingProducts] = useState<ProductSummary[]>([]);
  const [endedProducts, setEndedProducts] = useState<ProductSummary[]>([]);

  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
  const [isLoadingEnded, setIsLoadingEnded] = useState(true);

  const [errorLive, setErrorLive] = useState("");
  const [errorUpcoming, setErrorUpcoming] = useState("");
  const [errorEnded, setErrorEnded] = useState("");

  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  const featuredProduct = liveProducts[0] ?? upcomingProducts[0] ?? null;
  const featuredProductId = featuredProduct?.productId ?? 1;
  const featuredTitle = featuredProduct?.productName ?? t("viewDetailAuction");
  const featuredBid = featuredProduct?.currentBid ?? featuredProduct?.startingPrice ?? 0;
  const featuredLotLabel = featuredProduct?.productId ?? 1;
  const featuredImage = getProductImage(featuredProduct?.imageUrl);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    syncUser();
    return subscribeStoredUser(syncUser);
  }, []);

  useEffect(() => {
    setKeyword(searchParams.get("keyword") ?? "");
  }, [searchParams]);

  // Filter keyword / category / price are applied to all 3 sections so users
  // can search across the full catalogue in one place.
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsLoadingLive(true);
      setIsLoadingUpcoming(true);
      setIsLoadingEnded(true);
      setErrorLive("");
      setErrorUpcoming("");
      setErrorEnded("");

      const baseFilters = {
        keyword,
        categoryId: categoryId ? Number(categoryId) : ("" as const),
        minPrice: minPrice ? Number(minPrice) : ("" as const),
        maxPrice: maxPrice ? Number(maxPrice) : ("" as const),
        status: "APPROVED",
      };

      const safeSet =
        <T,>(setter: (value: T) => void) =>
        (value: T) => {
          if (!controller.signal.aborted) setter(value);
        };

      const safeCall = (fn: () => void) => () => {
        if (!controller.signal.aborted) fn();
      };

      const run = <T,>(
        promise: Promise<{ content: ProductSummary[] }>,
        onSuccess: (items: ProductSummary[]) => void,
        onError: (message: string) => void,
        onFinally: () => void,
      ) => {
        promise
          .then((response) => safeSet(onSuccess)(response.content))
          .catch((error) =>
            safeSet(onError)(error instanceof Error ? error.message : t("loadError")),
          )
          .finally(() => safeCall(onFinally)());
      };

      run(
        searchProducts({ ...baseFilters, auctionStatus: "ACTIVE", size: 8 }),
        setLiveProducts,
        setErrorLive,
        () => setIsLoadingLive(false),
      );
      run(
        searchProducts({ ...baseFilters, auctionStatus: "UPCOMING", size: 8 }),
        setUpcomingProducts,
        setErrorUpcoming,
        () => setIsLoadingUpcoming(false),
      );
      run(
        searchProducts({ ...baseFilters, auctionStatus: "ENDED", size: 8 }),
        setEndedProducts,
        setErrorEnded,
        () => setIsLoadingEnded(false),
      );
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [categoryId, keyword, maxPrice, minPrice]);

  const clearFilters = () => {
    setKeyword("");
    setCategoryId("");
    setMinPrice("");
    setMaxPrice("");
  };

  const totalAcrossSections =
    liveProducts.length + upcomingProducts.length + endedProducts.length;

  return (
    <main className="min-h-screen bg-surface-container-lowest text-on-surface">
      <TopNav />

      <section className="relative overflow-hidden bg-primary-container text-on-primary-container">
        <div className="absolute inset-0">
          <img
            src={featuredImage}
            alt={featuredTitle}
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-primary-container/80" />
        </div>

        <div className="relative mx-auto grid min-h-[520px] max-w-screen-2xl items-center gap-xl px-margin-mobile py-2xl md:grid-cols-[1.1fr_0.9fr] md:px-margin-desktop">
          <div className="max-w-3xl">
            <p className="mb-sm font-label-md text-label-md uppercase tracking-widest text-secondary-fixed-dim">
              {t("heroSubtitle")}
            </p>
            <h1 className="mb-md font-display-lg text-display-lg text-white">
              {t("heroTitle")}
            </h1>
            <p className="mb-lg max-w-2xl font-body-lg text-body-lg text-white/80">
              {t("heroDescription")}
            </p>
            <div className="flex flex-wrap gap-sm">
              <Link
                href={`/auctions/${featuredProductId}`}
                className="rounded-lg bg-secondary px-6 py-3 font-label-md text-label-md text-on-secondary shadow-sm transition-opacity hover:opacity-90"
              >
                {t("viewDetailAuction")}
              </Link>
              {currentUser ? (
                <Link
                  href="/dashboard"
                  className="rounded-lg border border-white/40 px-6 py-3 font-label-md text-label-md text-white transition-colors hover:bg-white/10"
                >
                  {t("goToDashboard")}
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="rounded-lg border border-white/40 px-6 py-3 font-label-md text-label-md text-white transition-colors hover:bg-white/10"
                >
                  {t("signInToBid")}
                </Link>
              )}
            </div>
          </div>

          <div className="hidden rounded-lg border border-white/20 bg-white/10 p-sm shadow-xl backdrop-blur md:block">
            <img
              src={featuredImage}
              alt={featuredTitle}
              className="aspect-[4/3] w-full rounded-md object-cover"
            />
            <div className="mt-sm flex items-center justify-between text-white">
              <div>
                <p className="font-label-sm text-label-sm text-white/60">{t("featuredLot", { id: featuredLotLabel })}</p>
                <h2 className="font-headline-sm text-headline-sm">{featuredTitle}</h2>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-label-sm text-white/60">{t("currentBid")}</p>
                <p className="font-headline-sm text-headline-sm">{numberFormatter.format(featuredBid)} VND</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="catalogue" className="mx-auto max-w-screen-2xl px-margin-mobile py-xl md:px-margin-desktop">
        <div className="mb-lg flex flex-col gap-xs md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-label-md text-label-md uppercase tracking-widest text-secondary">{t("searchCatalogue")}</p>
            <h2 className="font-headline-lg text-headline-lg text-primary">{t("browseAll")}</h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t("lotsAcross", { count: numberFormatter.format(totalAcrossSections) })}
          </p>
        </div>

        <div className="mb-lg grid gap-sm rounded-lg border border-outline-variant bg-surface p-md shadow-sm lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <label className="block">
            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">{t("search")}</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md outline-none transition-colors focus:border-secondary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">{t("category")}</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md outline-none transition-colors focus:border-secondary"
            >
              <option value="">{t("allCategories")}</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">{t("minPrice")}</span>
            <input
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              type="number"
              min="0"
              placeholder="0"
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md outline-none transition-colors focus:border-secondary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">{t("maxPrice")}</span>
            <input
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              type="number"
              min="0"
              placeholder={t("any")}
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md outline-none transition-colors focus:border-secondary"
            />
          </label>
          <button
            type="button"
            onClick={clearFilters}
            className="self-end rounded-md border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:border-secondary hover:text-secondary"
          >
            {t("clear")}
          </button>
        </div>
      </section>

      <ProductSection
        titleKey="liveNow"
        subtitleKey="liveNowSubtitle"
        tone="live"
        products={liveProducts}
        isLoading={isLoadingLive}
        errorMessage={errorLive}
        emptyKey="noLive"
        viewAllHref="/live"
      />

      <ProductSection
        titleKey="upcomingAuctions"
        subtitleKey="upcomingSubtitle"
        tone="upcoming"
        products={upcomingProducts}
        isLoading={isLoadingUpcoming}
        errorMessage={errorUpcoming}
        emptyKey="noUpcoming"
        viewAllHref="/upcoming"
      />

      <ProductSection
        titleKey="recentlyClosed"
        subtitleKey="closedSubtitle"
        tone="ended"
        products={endedProducts}
        isLoading={isLoadingEnded}
        errorMessage={errorEnded}
        emptyKey="noClosed"
        viewAllHref="/results"
      />
    </main>
  );
}
