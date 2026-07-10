"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import ProductAuctionCard from "@/components/ui/ProductAuctionCard";
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
import { displayFont } from "@/components/luxe/theme";

const numberFormatter = new Intl.NumberFormat("vi-VN");
const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen luxe-page text-[#f5ead9]">
          <TopNav />
        </main>
      }
    >
      <ResultsPageContent />
    </Suspense>
  );
}

function ResultsPageContent() {
  const t = useTranslations("results");
  const tCard = useTranslations("storefront");
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

  useEffect(() => {
    setParentPage("results");
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
        auctionStatus: "ENDED",
        size: 12,
      })
        .then((response) => {
          setProducts(response.content);
          setTotalProducts(response.totalElements);
        })
        .catch((error) => {
          setProducts([]);
          setTotalProducts(0);
          setErrorMessage(error instanceof Error ? error.message : "Unable to load auction results.");
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

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aEnd = a.auctionEndTime ? new Date(a.auctionEndTime).getTime() : 0;
      const bEnd = b.auctionEndTime ? new Date(b.auctionEndTime).getTime() : 0;
      return bEnd - aEnd;
    });
  }, [products]);

  const featuredProduct = sortedProducts[0] ?? null;
  const heroImage = getProductImage(featuredProduct?.imageUrl);
  const heroPrice = featuredProduct ? featuredProduct.currentBid || featuredProduct.startingPrice : 0;
  const heroEnd = featuredProduct?.auctionEndTime
    ? dateFormatter.format(new Date(featuredProduct.auctionEndTime))
    : "TBD";

  return (
    <main className="min-h-screen overflow-x-clip luxe-page text-[#f5ead9]">
      <TopNav />

      <section className="relative isolate overflow-hidden bg-[#070706] text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroImage}
            alt={featuredProduct?.productName ?? "Auction results"}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20"
            unoptimized
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,170,97,.28),transparent_32%),radial-gradient(circle_at_12%_84%,rgba(201,154,75,.2),transparent_34%),linear-gradient(135deg,rgba(7,7,6,.95),rgba(16,13,8,.92)_56%,rgba(23,19,13,.94))]" />
          <div className="absolute inset-0 opacity-[.055] [background-image:linear-gradient(rgba(255,255,255,.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.28)_1px,transparent_1px)] [background-size:72px_72px]" />
        </div>

        <div className="relative mx-auto grid min-h-[500px] max-w-[1440px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-10 lg:py-20">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d4aa61]/30 bg-white/[.06] px-3 py-2 text-[10px] font-black uppercase tracking-[.22em] text-[#efcf88] backdrop-blur">
              <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
              {t("heroLabel")}
            </p>
            <h1 className={`${displayFont} text-[42px] font-semibold leading-[1.08] tracking-[-.02em] text-transparent bg-clip-text bg-gradient-to-r from-[#fff8df] via-[#e7c57c] to-[#9f722d] sm:text-[58px] lg:text-[72px]`}>
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#b7aea3] sm:text-lg">
              {t("heroDesc")}
            </p>
            {featuredProduct && (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/auctions/${featuredProduct.productId}`}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-6 py-3.5 text-sm font-black text-[#100d08] shadow-[0_18px_40px_rgba(201,154,75,.24)] transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  {t("viewResultDetails")}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <Link
                  href={currentUser ? "/dashboard" : "/auth"}
                  className="inline-flex items-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/[.08]"
                >
                  {currentUser ? t("goToDashboard") : t("signInToBid")}
                </Link>
              </div>
            )}
          </div>

          {featuredProduct && (
            <div className="hidden rounded-[30px] border border-white/15 bg-white/[.05] p-3 shadow-[0_30px_80px_rgba(0,0,0,.5)] backdrop-blur-xl md:block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-[#11100d]">
                <Image
                  src={heroImage}
                  alt={featuredProduct.productName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                <div className="absolute left-4 top-4 rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-slate-800">
                  {t("featuredLot")} #{featuredProduct.productId}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4 px-2 pb-2 text-white">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d4aa61]">Market result</p>
                  <h2 className={`${displayFont} mt-1 max-w-[420px] text-2xl font-medium`}>{featuredProduct.productName}</h2>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] uppercase tracking-[.14em] text-white/50">{t("finalPrice")}</p>
                  <p className="mt-1 text-xl font-black text-[#efcf88]">{numberFormatter.format(heroPrice)} VND</p>
                  <p className="mt-3 text-[10px] uppercase tracking-[.14em] text-white/50">Closed</p>
                  <p className="mt-1 text-sm font-black text-cyan-100">{heroEnd}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="catalogue" className="relative mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#d4aa61]">{t("searchCatalogue")}</p>
            <h2 className={`${displayFont} mt-2 text-4xl font-medium leading-tight text-white`}>{t("completedAuctions")}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/upcoming" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-[#cfc6ba] transition hover:border-[#d4aa61]/60 hover:text-[#d4aa61]">
              {t("viewUpcoming")}
            </Link>
            <Link href="/storefront" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-[#cfc6ba] transition hover:border-[#d4aa61]/60 hover:text-[#d4aa61]">
              {t("viewFullCatalogue")}
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <FilterInput label={t("search")} value={keyword} onChange={setKeyword} placeholder={t("searchPlaceholder")} />
          <label className="block">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[.12em] text-[#9d948a]">{t("category")}</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#0c0b0a] px-4 py-3 text-sm text-[#f5ead9] outline-none transition focus:border-[#d4aa61]/70 focus:shadow-[0_0_0_4px_rgba(212,170,97,.14)] [&>option]:bg-[#11100d] [&>option]:text-[#f5ead9]"
            >
              <option value="">{t("allCategories")}</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </label>
          <FilterInput label={t("minPrice")} value={minPrice} onChange={setMinPrice} placeholder="0" type="number" />
          <FilterInput label={t("maxPrice")} value={maxPrice} onChange={setMaxPrice} placeholder={t("any")} type="number" />
          <button
            type="button"
            onClick={clearFilters}
            className="self-end rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-[#cfc6ba] transition hover:border-[#d4aa61]/60 hover:text-[#d4aa61]"
          >
            {t("clear")}
          </button>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-[#cfc6ba]">
            {isLoading ? t("loadingResults") : t("completedAuctionsCount", { count: numberFormatter.format(totalProducts) })}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-[20px] border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-300">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && sortedProducts.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-[#d4aa61]/40 bg-white/[0.03] p-12 text-center">
            <span className="material-symbols-outlined rounded-full bg-[#0e0d0b] p-4 text-4xl text-[#d4aa61]">emoji_events</span>
            <h3 className={`${displayFont} mt-5 text-2xl font-medium text-white`}>{t("noCompletedAuctions")}</h3>
            <p className="mt-2 text-[#b7aea3]">{t("tryBroader")}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="skeleton-shimmer h-[430px] rounded-[24px]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {sortedProducts.map((product, index) => (
              <ProductAuctionCard key={product.productId} product={product} t={tCard} index={index} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[.12em] text-[#9d948a]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        min={type === "number" ? "0" : undefined}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-[#0c0b0a] px-4 py-3 text-sm text-[#f5ead9] outline-none transition placeholder:text-[#6f675e] focus:border-[#d4aa61]/70 focus:shadow-[0_0_0_4px_rgba(212,170,97,.14)]"
      />
    </label>
  );
}
