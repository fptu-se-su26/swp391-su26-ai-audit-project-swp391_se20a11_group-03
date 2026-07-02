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

const numberFormatter = new Intl.NumberFormat("vi-VN");
const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default function UpcomingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#eef3f8] text-slate-950">
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
  }, [categoryId, keyword, maxPrice, minPrice, t]);

  const clearFilters = () => {
    setKeyword("");
    setCategoryId("");
    setMinPrice("");
    setMaxPrice("");
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aStart = a.auctionStartTime ? new Date(a.auctionStartTime).getTime() : Number.MAX_SAFE_INTEGER;
      const bStart = b.auctionStartTime ? new Date(b.auctionStartTime).getTime() : Number.MAX_SAFE_INTEGER;
      return aStart - bStart;
    });
  }, [products]);

  const featuredProduct = sortedProducts[0] ?? null;
  const heroImage = getProductImage(featuredProduct?.imageUrl);
  const heroPrice = featuredProduct ? featuredProduct.startingPrice : 0;
  const heroStart = featuredProduct?.auctionStartTime
    ? dateFormatter.format(new Date(featuredProduct.auctionStartTime))
    : "TBD";

  return (
    <main className="min-h-screen overflow-x-clip bg-[#eef3f8] text-slate-950">
      <TopNav />

      <section className="relative isolate overflow-hidden bg-[#071626] text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroImage}
            alt={featuredProduct?.productName ?? "Upcoming auctions"}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20"
            unoptimized
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(184,134,11,.26),transparent_30%),radial-gradient(circle_at_8%_88%,rgba(14,116,144,.22),transparent_34%),linear-gradient(135deg,rgba(1,5,15,.94),rgba(8,18,36,.92)_58%,rgba(17,24,39,.94))]" />
          <div className="absolute inset-0 opacity-[.055] [background-image:linear-gradient(rgba(255,255,255,.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.28)_1px,transparent_1px)] [background-size:72px_72px]" />
        </div>

        <div className="relative mx-auto grid min-h-[500px] max-w-[1440px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-10 lg:py-20">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d6a84f]/30 bg-white/[.06] px-3 py-2 text-[10px] font-black uppercase tracking-[.22em] text-[#f2d786] backdrop-blur">
              <span className="material-symbols-outlined text-[16px]">event_upcoming</span>
              {t("heroLabel")}
            </p>
            <h1 className="font-display-lg text-[42px] font-black leading-[1.04] tracking-[-.055em] text-transparent bg-clip-text bg-gradient-to-r from-[#fff8df] via-[#d9b55b] to-[#a87918] sm:text-[58px] lg:text-[72px]">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              {t("heroDesc")}
            </p>
            {featuredProduct && (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/auctions/${featuredProduct.productId}`}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#b8860b] via-[#d7b55c] to-[#f0d98b] px-6 py-3.5 text-sm font-black text-[#06111f] shadow-[0_18px_40px_rgba(199,160,62,.24)] transition hover:-translate-y-0.5"
                >
                  {t("viewDetailAuction")}
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
            <div className="hidden rounded-[30px] border border-white/15 bg-white/[.08] p-3 shadow-[0_30px_80px_rgba(0,0,0,.36)] backdrop-blur-xl md:block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-slate-900">
                <Image
                  src={heroImage}
                  alt={featuredProduct.productName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                <div className="absolute left-4 top-4 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-[#8a640e]">
                  Upcoming
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4 px-2 pb-2 text-white">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d8bd75]">Lot #{featuredProduct.productId}</p>
                  <h2 className="mt-1 max-w-[420px] font-display-lg text-2xl font-black tracking-[-.04em]">{featuredProduct.productName}</h2>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] uppercase tracking-[.14em] text-white/50">{t("startingBid")}</p>
                  <p className="mt-1 text-xl font-black text-[#f0d98b]">{numberFormatter.format(heroPrice)} VND</p>
                  <p className="mt-3 text-[10px] uppercase tracking-[.14em] text-white/50">Starts</p>
                  <p className="mt-1 text-sm font-black text-cyan-100">{heroStart}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="catalogue" className="relative mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#9a6b13]">{t("searchCatalogue")}</p>
            <h2 className="mt-2 font-display-lg text-4xl font-black tracking-[-.05em] text-[#071626]">{t("upcomingCatalogues")}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/results" className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-[#d2ad55] hover:text-[#9a6b13]">
              {t("viewResults")}
            </Link>
            <Link href="/storefront" className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-[#d2ad55] hover:text-[#9a6b13]">
              {t("viewFullCatalogue")}
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 rounded-[28px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_55px_rgba(15,23,42,.08)] backdrop-blur lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <FilterInput label={t("search")} value={keyword} onChange={setKeyword} placeholder={t("searchPlaceholder")} />
          <label className="block">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[.12em] text-slate-500">{t("category")}</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm outline-none transition focus:border-[#d2ad55] focus:bg-white focus:shadow-[0_0_0_4px_rgba(210,173,85,.16)]"
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
            className="self-end rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition hover:border-[#d2ad55] hover:text-[#9a6b13]"
          >
            {t("clear")}
          </button>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm">
            {isLoading ? t("loadingProducts") : t("upcomingItemsCount", { count: numberFormatter.format(totalProducts) })}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && sortedProducts.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-[#d2ad55]/50 bg-white/80 p-12 text-center shadow-sm">
            <span className="material-symbols-outlined rounded-full bg-[#f4ead1] p-4 text-4xl text-[#9a6b13]">event_busy</span>
            <h3 className="mt-5 text-2xl font-black text-[#071626]">{t("noUpcomingItems")}</h3>
            <p className="mt-2 text-slate-600">{t("tryBroader")}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[430px] animate-pulse rounded-[24px] border border-slate-200/80 bg-white shadow-[0_14px_45px_rgba(15,23,42,.08)]" />
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
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[.12em] text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        min={type === "number" ? "0" : undefined}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm outline-none transition focus:border-[#d2ad55] focus:bg-white focus:shadow-[0_0_0_4px_rgba(210,173,85,.16)]"
      />
    </label>
  );
}
