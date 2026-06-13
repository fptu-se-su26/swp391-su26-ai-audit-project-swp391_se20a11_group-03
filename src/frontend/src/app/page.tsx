"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import { mockStorefrontLots } from "@/lib/mock-data";
import {
  CategorySummary,
  ProductSummary,
  getCategories,
  searchProducts,
} from "@/lib/services/productService";

const numberFormatter = new Intl.NumberFormat("en-US");

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
  const featuredLots = mockStorefrontLots.slice(0, 4);
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const productImages = useMemo(
    () => featuredLots.map((lot) => lot.image),
    [featuredLots]
  );

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setKeyword(searchParams.get("keyword") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsLoading(true);
      setErrorMessage("");

      searchProducts({
        keyword,
        categoryId: categoryId ? Number(categoryId) : "",
        minPrice: minPrice ? Number(minPrice) : "",
        maxPrice: maxPrice ? Number(maxPrice) : "",
        size: 12,
      })
        .then((response) => {
          if (!controller.signal.aborted) {
            setProducts(response.content);
            setTotalProducts(response.totalElements);
          }
        })
        .catch((error) => {
          if (!controller.signal.aborted) {
            setProducts([]);
            setTotalProducts(0);
            setErrorMessage(error instanceof Error ? error.message : "Unable to load products.");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });
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

  return (
    <main className="min-h-screen bg-surface-container-lowest text-on-surface">
      <TopNav />

      <section className="relative overflow-hidden bg-primary-container text-on-primary-container">
        <div className="absolute inset-0">
          <img
            src={featuredLots[0].image}
            alt={featuredLots[0].title}
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-primary-container/80" />
        </div>

        <div className="relative mx-auto grid min-h-[520px] max-w-screen-2xl items-center gap-xl px-margin-mobile py-2xl md:grid-cols-[1.1fr_0.9fr] md:px-margin-desktop">
          <div className="max-w-3xl">
            <p className="mb-sm font-label-md text-label-md uppercase tracking-widest text-secondary-fixed-dim">
              Curated luxury auctions
            </p>
            <h1 className="mb-md font-display-lg text-display-lg text-white">
              LuxeAuction
            </h1>
            <p className="mb-lg max-w-2xl font-body-lg text-body-lg text-white/80">
              Discover authenticated watches, art, design objects, and rare collectibles from a marketplace built for serious collectors.
            </p>
            <div className="flex flex-wrap gap-sm">
              <Link
                href="/storefront"
                className="rounded-lg bg-secondary px-6 py-3 font-label-md text-label-md text-on-secondary shadow-sm transition-opacity hover:opacity-90"
              >
                Browse Live Lots
              </Link>
              <Link
                href="/auth"
                className="rounded-lg border border-white/40 px-6 py-3 font-label-md text-label-md text-white transition-colors hover:bg-white/10"
              >
                Sign In to Bid
              </Link>
            </div>
          </div>

          <div className="hidden rounded-lg border border-white/20 bg-white/10 p-sm shadow-xl backdrop-blur md:block">
            <img
              src={featuredLots[0].image}
              alt={featuredLots[0].title}
              className="aspect-[4/3] w-full rounded-md object-cover"
            />
            <div className="mt-sm flex items-center justify-between text-white">
              <div>
                <p className="font-label-sm text-label-sm text-white/60">Featured Lot #{featuredLots[0].lotNumber}</p>
                <h2 className="font-headline-sm text-headline-sm">{featuredLots[0].title}</h2>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-label-sm text-white/60">Current Bid</p>
                <p className="font-headline-sm text-headline-sm">${numberFormatter.format(featuredLots[0].currentBid)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-margin-mobile py-xl md:px-margin-desktop">
        <div className="mb-lg flex flex-col gap-xs md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-label-md text-label-md uppercase tracking-widest text-secondary">Search catalogue</p>
            <h2 className="font-headline-lg text-headline-lg text-primary">Public Storefront</h2>
          </div>
          <Link href="/storefront" className="font-label-md text-label-md text-secondary hover:underline">
            View full catalogue
          </Link>
        </div>

        <div className="mb-lg grid gap-sm rounded-lg border border-outline-variant bg-surface p-md shadow-sm lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <label className="block">
            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Search</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Product name or keyword"
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md outline-none transition-colors focus:border-secondary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Category</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md outline-none transition-colors focus:border-secondary"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Min price</span>
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
            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Max price</span>
            <input
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              type="number"
              min="0"
              placeholder="Any"
              className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md outline-none transition-colors focus:border-secondary"
            />
          </label>
          <button
            type="button"
            onClick={clearFilters}
            className="self-end rounded-md border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:border-secondary hover:text-secondary"
          >
            Clear
          </button>
        </div>

        <div className="mb-md flex items-center justify-between">
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isLoading ? "Loading products..." : `${numberFormatter.format(totalProducts)} products found`}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-md rounded-lg border border-error/30 bg-error-container px-4 py-3 font-body-md text-body-md text-error">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && products.length === 0 && (
          <div className="rounded-lg border border-dashed border-outline-variant bg-surface p-xl text-center">
            <h3 className="font-headline-sm text-headline-sm text-primary">No products matched your filters</h3>
            <p className="mt-xs font-body-md text-body-md text-on-surface-variant">Try a broader keyword or price range.</p>
          </div>
        )}

        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <article key={product.productId} className="overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-sm">
              <img
                src={productImages[index % productImages.length]}
                alt={product.productName}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-md">
                <div className="mb-xs flex items-center justify-between gap-sm">
                  <span className="truncate font-label-sm text-label-sm text-outline">
                    {product.categoryName ?? "Uncategorized"}
                  </span>
                  <span className="rounded-full bg-secondary-container px-2 py-1 font-label-sm text-[10px] uppercase tracking-wide text-on-secondary-container">
                    {product.status}
                  </span>
                </div>
                <h3 className="min-h-12 font-headline-sm text-headline-sm text-primary">{product.productName}</h3>
                <div className="mt-sm flex items-center justify-between">
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Starting price</p>
                    <p className="font-label-lg text-label-lg text-on-surface">
                      {numberFormatter.format(product.startingPrice)} VND
                    </p>
                  </div>
                  <Link
                    href={`/auctions/${product.productId}`}
                    className="font-label-md text-label-md text-secondary hover:underline"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
