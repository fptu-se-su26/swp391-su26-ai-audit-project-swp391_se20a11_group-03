"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import { LiveLotCard, formatTimeRemaining } from "@/components/features/LiveLotCard";
import { useTranslations } from "@/i18n/I18nProvider";
import {
  CategorySummary,
  ProductSummary,
  getCategories,
  searchProducts,
} from "@/lib/services/productService";
import { getProductImage } from "@/lib/productPresentation";
import { useNavigationContext } from "@/lib/NavigationContext";
import { StoredUser, getStoredUser, subscribeStoredUser } from "@/lib/userSession";
import Link from "next/link";

const numberFormatter = new Intl.NumberFormat("vi-VN");

export default function LivePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-surface-container-lowest text-on-surface">
          <TopNav />
        </main>
      }
    >
      <LivePageContent />
    </Suspense>
  );
}

function LivePageContent() {
  const t = useTranslations("livePage");
  const searchParams = useSearchParams();
  const { setParentPage } = useNavigationContext();
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setParentPage("live");
  }, [setParentPage]);

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

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsLoading(true);
      setErrorMessage("");

      searchProducts({
        keyword,
        categoryId: categoryId ? Number(categoryId) : "",
        minPrice: minPrice ? Number(minPrice) : "",
        maxPrice: maxPrice ? Number(maxPrice) : "",
        status: "APPROVED",
        auctionStatus: "ACTIVE",
        size: 50,
      })
        .then((response) => {
          setProducts(response.content);
          setTotalProducts(response.totalElements);
        })
        .catch((error) => {
          setProducts([]);
          setTotalProducts(0);
          setErrorMessage(error instanceof Error ? error.message : t("noLiveAuctions"));
        })
        .finally(() => setIsLoading(false));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [categoryId, keyword, maxPrice, minPrice]);

  const clearFilters = () => {
    setKeyword("");
    setCategoryId("");
    setMinPrice("");
    setMaxPrice("");
  };

  const featuredProduct = products[0] ?? null;
  const heroImage = getProductImage(featuredProduct?.imageUrl);
  const heroTime = featuredProduct ? formatTimeRemaining(featuredProduct.auctionEndTime) : "TBD";
  const heroBid = featuredProduct
    ? (featuredProduct.currentBid || featuredProduct.startingPrice)
    : 0;

  const sortedProducts = useMemo(() => {
    // Live lots sorted: those ending soonest first, then by most recent start.
    return [...products].sort((a, b) => {
      const aEnd = a.auctionEndTime ? new Date(a.auctionEndTime).getTime() : Number.MAX_SAFE_INTEGER;
      const bEnd = b.auctionEndTime ? new Date(b.auctionEndTime).getTime() : Number.MAX_SAFE_INTEGER;
      return aEnd - bEnd;
    });
  }, [products]);

  return (
    <main className="min-h-screen bg-surface-container-lowest text-on-surface">
      <TopNav />

      <section className="relative overflow-hidden bg-primary-container text-on-primary-container">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={featuredProduct?.productName ?? "Live auctions"}
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-primary-container/80" />
        </div>

        <div className="relative mx-auto grid min-h-[440px] max-w-screen-2xl items-center gap-xl px-margin-mobile py-2xl md:grid-cols-[1.1fr_0.9fr] md:px-margin-desktop">
          <div className="max-w-3xl">
            <p className="mb-sm font-label-md text-label-md uppercase tracking-widest text-secondary-fixed-dim">
              {t("heroLabel")}
            </p>
            <h1 className="mb-md font-display-lg text-display-lg text-white">
              {t("heroTitle")}
            </h1>
            <p className="mb-lg max-w-2xl font-body-lg text-body-lg text-white/80">
              {t("heroDesc")}
            </p>
            {featuredProduct && (
              <div className="flex flex-wrap gap-sm">
                <Link
                  href={`/auctions/${featuredProduct.productId}`}
                  className="rounded-lg bg-secondary px-6 py-3 font-label-md text-label-md text-on-secondary shadow-sm transition-opacity hover:opacity-90"
                >
                  {t("viewFeaturedLot")}
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
            )}
          </div>

          {featuredProduct && (
            <div className="hidden rounded-lg border border-white/20 bg-white/10 p-sm shadow-xl backdrop-blur md:block">
              <img
                src={heroImage}
                alt={featuredProduct.productName}
                className="aspect-[4/3] w-full rounded-md object-cover"
              />
              <div className="mt-sm flex items-center justify-between text-white">
                <div>
                  <p className="font-label-sm text-label-sm text-white/60">Lot #{featuredProduct.productId}</p>
                  <h2 className="font-headline-sm text-headline-sm">{featuredProduct.productName}</h2>
                </div>
                <div className="text-right">
                  <p className="font-label-sm text-label-sm text-white/60">{t("currentBid")}</p>
                  <p className="font-headline-sm text-headline-sm">{numberFormatter.format(heroBid)} VND</p>
                  <p className="font-label-sm text-label-sm text-white/60">{t("endsIn")}</p>
                  <p className="font-headline-sm text-headline-sm text-error">{featuredProduct ? formatTimeRemaining(featuredProduct.auctionEndTime) : t("tbd")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="catalogue" className="mx-auto max-w-screen-2xl px-margin-mobile py-xl md:px-margin-desktop">
        <div className="mb-lg flex flex-col gap-xs md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-label-md text-label-md uppercase tracking-widest text-tertiary-fixed">{t("biddingInProgress")}</p>
            <h2 className="font-headline-lg text-headline-lg text-primary">{t("allLiveSessions")}</h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isLoading ? t("loadingLiveLots") : t("liveItemsCount", { count: numberFormatter.format(totalProducts) })}
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

        {errorMessage && (
          <div className="mb-md rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-md text-body-md text-error">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && sortedProducts.length === 0 && (
          <div className="rounded-lg border border-dashed border-outline-variant bg-surface p-xl text-center">
            <h3 className="font-headline-sm text-headline-sm text-primary">{t("noLiveAuctions")}</h3>
            <p className="mt-xs font-body-md text-body-md text-on-surface-variant">
              {t("checkUpcoming")} <Link href="/upcoming" className="text-secondary hover:underline">{t("upcomingCatalogue")}</Link> {t("sessionsOpeningSoon")}
            </p>
          </div>
        )}

        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {sortedProducts.map((product) => (
            <LiveLotCard key={product.productId} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
