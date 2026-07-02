"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import TopNav from "@/components/layout/TopNav";
import { formatTimeRemaining } from "@/components/features/LiveLotCard";
import ProductAuctionCard from "@/components/ui/ProductAuctionCard";
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
  const tCard = useTranslations("storefront");
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
    <main className="min-h-screen overflow-x-clip bg-[#eef3f8] text-slate-950">
      <TopNav />

      <section className="relative isolate overflow-hidden bg-[#071626] text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroImage}
            alt={featuredProduct?.productName ?? "Live auctions"}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
            unoptimized
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(29,78,216,.34),transparent_30%),radial-gradient(circle_at_12%_85%,rgba(184,134,11,.22),transparent_34%),linear-gradient(135deg,rgba(1,5,15,.92),rgba(8,18,36,.9)_56%,rgba(17,24,39,.92))]" />
          <div className="absolute inset-0 opacity-[.055] [background-image:linear-gradient(rgba(255,255,255,.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.28)_1px,transparent_1px)] [background-size:72px_72px]" />
        </div>

        <div className="relative mx-auto grid min-h-[520px] max-w-[1440px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-10 lg:py-20">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d6a84f]/30 bg-white/[.06] px-3 py-2 text-[10px] font-black uppercase tracking-[.22em] text-[#f2d786] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_18px_rgba(239,68,68,.8)]" />
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
                  {t("viewFeaturedLot")}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                {currentUser ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/[.08]"
                  >
                    {t("goToDashboard")}
                  </Link>
                ) : (
                  <Link
                    href="/auth"
                    className="inline-flex items-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/[.08]"
                  >
                    {t("signInToBid")}
                  </Link>
                )}
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
                <div className="absolute left-4 top-4 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-red-700">
                  Live auction
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4 px-2 pb-2 text-white">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d8bd75]">Lot #{featuredProduct.productId}</p>
                  <h2 className="mt-1 max-w-[420px] font-display-lg text-2xl font-black tracking-[-.04em]">{featuredProduct.productName}</h2>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] uppercase tracking-[.14em] text-white/50">{t("currentBid")}</p>
                  <p className="mt-1 text-xl font-black text-[#f0d98b]">{numberFormatter.format(heroBid)} VND</p>
                  <p className="mt-3 text-[10px] uppercase tracking-[.14em] text-white/50">{t("endsIn")}</p>
                  <p className="mt-1 text-sm font-black text-red-200">{heroTime}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="catalogue" className="relative mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#9a6b13]">{t("biddingInProgress")}</p>
            <h2 className="mt-2 font-display-lg text-4xl font-black tracking-[-.05em] text-[#071626]">{t("allLiveSessions")}</h2>
          </div>
          <p className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm">
            {isLoading ? t("loadingLiveLots") : t("liveItemsCount", { count: numberFormatter.format(totalProducts) })}
          </p>
        </div>

        <div className="mb-8 grid gap-4 rounded-[28px] border border-white/70 bg-white/82 p-4 shadow-[0_18px_55px_rgba(15,23,42,.08)] backdrop-blur lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <label className="block">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[.12em] text-slate-500">{t("search")}</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm outline-none transition focus:border-[#d2ad55] focus:bg-white focus:shadow-[0_0_0_4px_rgba(210,173,85,.16)]"
            />
          </label>
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
          <label className="block">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[.12em] text-slate-500">{t("minPrice")}</span>
            <input
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              type="number"
              min="0"
              placeholder="0"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm outline-none transition focus:border-[#d2ad55] focus:bg-white focus:shadow-[0_0_0_4px_rgba(210,173,85,.16)]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[.12em] text-slate-500">{t("maxPrice")}</span>
            <input
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              type="number"
              min="0"
              placeholder={t("any")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm outline-none transition focus:border-[#d2ad55] focus:bg-white focus:shadow-[0_0_0_4px_rgba(210,173,85,.16)]"
            />
          </label>
          <button
            type="button"
            onClick={clearFilters}
            className="self-end rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 transition hover:-translate-y-0.5 hover:border-[#d2ad55] hover:text-[#9a6b13]"
          >
            {t("clear")}
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && sortedProducts.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-[#d2ad55]/45 bg-white/75 px-6 py-16 text-center shadow-[0_18px_55px_rgba(15,23,42,.06)]">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#071626] text-[#f0d98b]">
              <span className="material-symbols-outlined text-[30px]">gavel</span>
            </span>
            <h3 className="mt-5 font-display-lg text-2xl font-black tracking-[-.04em] text-[#071626]">{t("noLiveAuctions")}</h3>
            <p className="mt-2 text-sm text-slate-600">
              {t("checkUpcoming")} <Link href="/upcoming" className="text-secondary hover:underline">{t("upcomingCatalogue")}</Link> {t("sessionsOpeningSoon")}
            </p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading && sortedProducts.length === 0 && Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer h-[430px] rounded-[24px]" />
          ))}
          {sortedProducts.map((product, index) => (
            <ProductAuctionCard key={product.productId} product={product} t={tCard} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
