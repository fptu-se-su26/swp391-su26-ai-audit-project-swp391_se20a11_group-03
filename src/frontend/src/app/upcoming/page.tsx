"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import WatchlistButton from "@/components/features/WatchlistButton";
import { useNavigationContext } from "@/lib/NavigationContext";
import { getProductImage } from "@/lib/productPresentation";
import { useTranslations } from "@/i18n/I18nProvider";
import {
  CategorySummary,
  ProductSummary,
  getCategories,
  searchProducts,
} from "@/lib/services/productService";
import { StoredUser, getStoredUser, subscribeStoredUser } from "@/lib/userSession";

const numberFormatter = new Intl.NumberFormat("vi-VN");

export default function UpcomingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-surface-container-lowest text-on-surface">
          <TopNav />
        </main>
      }
    >
      <UpcomingPageContent />
    </Suspense>
  );
}

function UpcomingPageContent() {
  const t = useTranslations("upcoming");
  const searchParams = useSearchParams();
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
  const { setParentPage } = useNavigationContext();

  const featuredProduct = products[0] ?? null;

  useEffect(() => {
    setParentPage("upcoming");
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
        // Backend defaults `status` to "ACTIVE" when omitted, which hides
        // APPROVED lots that haven't gone through the legacy ACTIVE path
        // (e.g. newly seeded UPCOMING auctions). Pass APPROVED explicitly.
        status: "APPROVED",
        auctionStatus: "UPCOMING",
        size: 12,
      })
        .then((response) => {
          setProducts(response.content);
          setTotalProducts(response.totalElements);
        })
        .catch((error) => {
          setProducts([]);
          setTotalProducts(0);
          setErrorMessage(error instanceof Error ? error.message : t("noUpcomingItems"));
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

  return (
    <main className="min-h-screen bg-surface-container-lowest text-on-surface">
      <TopNav />

      <section className="relative overflow-hidden bg-primary-container text-on-primary-container">
        <div className="absolute inset-0">
          <img
            src={getProductImage(featuredProduct?.imageUrl)}
            alt={featuredProduct?.productName ?? "Upcoming auction"}
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-primary-container/80" />
        </div>

        <div className="relative mx-auto grid min-h-[520px] max-w-screen-2xl items-center gap-xl px-margin-mobile py-2xl md:grid-cols-[1.1fr_0.9fr] md:px-margin-desktop">
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
            )}
          </div>

          {featuredProduct && (
            <div className="hidden rounded-lg border border-white/20 bg-white/10 p-sm shadow-xl backdrop-blur md:block">
              <img
                src={getProductImage(featuredProduct.imageUrl)}
                alt={featuredProduct.productName}
                className="aspect-[4/3] w-full rounded-md object-cover"
              />
              <div className="mt-sm flex items-center justify-between text-white">
                <div>
                  <p className="font-label-sm text-label-sm text-white/60">Lot #{featuredProduct.productId}</p>
                  <h2 className="font-headline-sm text-headline-sm">{featuredProduct.productName}</h2>
                </div>
                <div className="text-right">
                  <p className="font-label-sm text-label-sm text-white/60">{t("startingBid")}</p>
                  <p className="font-headline-sm text-headline-sm">{numberFormatter.format(featuredProduct.startingPrice)} VND</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="catalogue" className="mx-auto max-w-screen-2xl px-margin-mobile py-xl md:px-margin-desktop">
        <div className="mb-lg flex flex-col gap-xs md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-label-md text-label-md uppercase tracking-widest text-secondary">{t("searchCatalogue")}</p>
            <h2 className="font-headline-lg text-headline-lg text-primary">{t("upcomingCatalogues")}</h2>
          </div>
          <div className="flex gap-sm">
            <Link href="/results" className="font-label-md text-label-md text-secondary hover:underline">
              {t("viewResults")}
            </Link>
            <span className="text-outline">|</span>
            <Link href="/storefront" className="font-label-md text-label-md text-secondary hover:underline">
              {t("viewFullCatalogue")}
            </Link>
          </div>
        </div>

        <div className="mb-lg grid gap-sm rounded-lg border border-outline-variant bg-surface p-md shadow-sm lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <label className="block">
            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">{t("search")}</span>
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder={t("searchPlaceholder")} className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md outline-none transition-colors focus:border-secondary" />
          </label>
          <label className="block">
            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">{t("category")}</span>
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md outline-none transition-colors focus:border-secondary">
              <option value="">{t("allCategories")}</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">{t("minPrice")}</span>
            <input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} type="number" min="0" placeholder="0" className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md outline-none transition-colors focus:border-secondary" />
          </label>
          <label className="block">
            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">{t("maxPrice")}</span>
            <input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} type="number" min="0" placeholder={t("any")} className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md outline-none transition-colors focus:border-secondary" />
          </label>
          <button type="button" onClick={clearFilters} className="self-end rounded-md border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:border-secondary hover:text-secondary">
            {t("clear")}
          </button>
        </div>

        <div className="mb-md flex items-center justify-between">
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isLoading ? t("loadingProducts") : t("upcomingItemsCount", { count: numberFormatter.format(totalProducts) })}
          </p>
        </div>

        {!isLoading && !errorMessage && products.length === 0 && (
          <div className="rounded-lg border border-dashed border-outline-variant bg-surface p-xl text-center">
            <h3 className="font-headline-sm text-headline-sm text-primary">{t("noUpcomingItems")}</h3>
            <p className="mt-xs font-body-md text-body-md text-on-surface-variant">{t("tryBroader")}</p>
          </div>
        )}

        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link key={product.productId} href={`/auctions/${product.productId}`} className="group relative overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <WatchlistButton productId={product.productId} />
              <img src={getProductImage(product.imageUrl)} alt={product.productName} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="p-md">
                <div className="mb-xs flex items-center justify-between gap-sm">
                  <span className="truncate font-label-sm text-label-sm text-outline">{product.categoryName ?? t("uncategorized")}</span>
                  <span className="rounded-full bg-tertiary-container px-2 py-1 font-label-sm text-[10px] uppercase tracking-wide text-on-tertiary-container">{product.auctionStatus ?? "UPCOMING"}</span>
                </div>
                <h3 className="min-h-12 font-headline-sm text-headline-sm text-primary">{product.productName}</h3>
                <div className="mt-sm flex items-center justify-between">
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{t("startingPrice")}</p>
                    <p className="font-label-lg text-label-lg text-on-surface">{numberFormatter.format(product.startingPrice)} VND</p>
                  </div>
                  <span className="font-label-md text-label-md text-secondary group-hover:underline">{t("details")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
