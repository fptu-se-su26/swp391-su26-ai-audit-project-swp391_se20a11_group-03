"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CollectorShell from "@/components/layout/CollectorShell";
import ProductAuctionCard from "@/components/ui/ProductAuctionCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { getCategories, ProductSummary, searchProducts } from "@/lib/services/productService";
import { useTranslations } from "@/i18n/I18nProvider";

export default function StorefrontPage() {
  const t = useTranslations("storefront");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [liveLots, setLiveLots] = useState<ProductSummary[]>([]);
  const [upcomingLots, setUpcomingLots] = useState<ProductSummary[]>([]);

  useEffect(() => {
    getCategories()
      .then((items) => setCategories(["All", ...items.map((item) => item.categoryName)]))
      .catch(() => setCategories(["All"]));

    searchProducts({ size: 12, status: "APPROVED", auctionStatus: "ACTIVE" })
      .then((response) => setLiveLots(response.content))
      .catch(() => setLiveLots([]));

    searchProducts({ size: 8, status: "APPROVED", auctionStatus: "UPCOMING" })
      .then((response) => setUpcomingLots(response.content))
      .catch(() => setUpcomingLots([]));
  }, []);

  const featuredProduct = liveLots[0] ?? upcomingLots[0] ?? null;
  const heroHref = featuredProduct ? `/auctions/${featuredProduct.productId}` : "/";

  return (
    <CollectorShell>
      <div className="mx-auto max-w-[1400px] space-y-10 p-margin-mobile md:p-margin-desktop">
        <ScrollReveal as="section" className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,.08)] sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-cyan-100/70 blur-3xl" />
          <div className="relative z-10 max-w-xl">
            <p className="mb-sm font-label-md text-label-md uppercase tracking-widest text-blue-700">{t("heroBadge")}</p>
            <h1 className="mb-md font-display-lg-mobile leading-tight tracking-[-.04em] text-slate-950 md:font-display-lg">
              {t("heroTitle1")}
              <br />
              {t("heroTitle2")}
            </h1>
            <p className="mb-lg font-body-lg text-slate-600">
              {t("heroDesc")}
            </p>
            <div className="flex flex-wrap gap-sm">
              <Link
                href={heroHref}
                className="glow-accent flex items-center gap-sm rounded-full bg-slate-950 px-lg py-md font-headline-sm text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <span className="material-symbols-outlined">gavel</span>
                {t("viewFeaturedLot")}
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal className="no-scrollbar flex gap-sm overflow-x-auto pb-xs">
          {categories.map((category, index) => (
            <button
              key={category}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-md py-sm font-label-md text-label-md transition-colors ${
              index === 0
                  ? "glow-accent bg-slate-950 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              }`}
              type="button"
            >
              {category}
            </button>
          ))}
        </ScrollReveal>

        <ScrollReveal as="section">
          <div className="mb-md">
            <SectionHeader
              title={t("liveAuctions")}
              action={<span className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase text-red-700">
                <span className="pulse-live h-1.5 w-1.5 rounded-full bg-red-500" />
                {t("liveCount", { count: liveLots.length })}
              </span>}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {liveLots.map((product, index) => (
              <ProductAuctionCard key={product.productId} product={product} t={t} index={index} />
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal as="section">
          <div className="mb-md flex items-center justify-between">
            <SectionHeader title={t("upcomingLots")} />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {upcomingLots.map((product, index) => (
              <ProductAuctionCard key={`upcoming-${product.productId}`} product={product} t={t} index={index} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </CollectorShell>
  );
}
