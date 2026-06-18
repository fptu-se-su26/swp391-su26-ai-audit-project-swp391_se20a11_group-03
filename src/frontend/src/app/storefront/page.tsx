"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WatchlistButton from "@/components/features/WatchlistButton";
import CollectorShell from "@/components/layout/CollectorShell";
import { getProductImage } from "@/lib/productPresentation";
import { getCategories, ProductSummary, searchProducts } from "@/lib/services/productService";
import { useTranslations } from "@/i18n/I18nProvider";

const numberFormatter = new Intl.NumberFormat("vi-VN");

function formatTime(t: (key: string, values?: Record<string, string | number>) => string, endTime?: string | null) {
  if (!endTime) {
    return t("lotCard.tbd");
  }

  const diffMs = new Date(endTime).getTime() - Date.now();
  if (diffMs <= 0) {
    return t("lotCard.ended");
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return t("timeFormat.daysHours", { days, hours });
  }
  if (hours > 0) {
    return t("timeFormat.hoursMinutes", { hours, minutes });
  }
  return t("timeFormat.minutesShort", { minutes });
}

function LotCard({ product, t }: { product: ProductSummary; t: (key: string, values?: Record<string, string | number>) => string }) {
  const isLive = product.auctionStatus === "ACTIVE";

  return (
    <Link
      href={`/auctions/${product.productId}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-surface-variant bg-surface soft-shadow transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-52 overflow-hidden bg-surface-variant">
        <img
          src={getProductImage(product.imageUrl)}
          alt={product.productName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <WatchlistButton productId={product.productId} />
        {isLive && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-surface/90 px-3 py-1 backdrop-blur-sm">
            <span className="pulse-live h-2 w-2 rounded-full bg-error" />
            <span className="font-label-sm text-[10px] font-bold uppercase tracking-wide text-on-surface">{t("lotCard.live")}</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 rounded bg-surface/90 px-2 py-1 backdrop-blur-sm">
          <span className="font-label-sm text-label-sm text-on-surface">Lot #{product.productId}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-md">
        <p className="mb-xs text-sm text-on-surface-variant">{product.categoryName ?? t("lotCard.uncategorized")}</p>
        <h3 className="mb-auto font-headline-sm text-headline-sm text-primary">{product.productName}</h3>
        <div className="mt-md flex items-end justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {isLive ? t("lotCard.currentBid") : t("lotCard.startingBid")}
            </p>
            <p className="font-headline-sm text-headline-sm font-bold text-primary">
              {numberFormatter.format(product.currentBid || product.startingPrice)} VND
            </p>
          </div>
          <div className="text-right">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {isLive ? t("lotCard.endsIn") : t("lotCard.starts")}
            </p>
            <p className={`font-label-md text-label-md font-bold ${isLive ? "text-error" : "text-on-surface"}`}>
              {isLive ? formatTime(t, product.auctionEndTime) : (product.auctionStartTime ? new Date(product.auctionStartTime).toLocaleDateString("vi-VN") : t("lotCard.tbd"))}
            </p>
          </div>
        </div>
        <span className="glow-accent mt-md flex w-full items-center justify-center gap-xs rounded-lg bg-secondary py-2.5 font-label-md text-label-md text-on-secondary transition-colors hover:bg-secondary-fixed-dim">
          <span className="material-symbols-outlined text-[18px]">gavel</span>
          {isLive ? t("lotCard.bidNow") : t("lotCard.viewLot")}
        </span>
      </div>
    </Link>
  );
}

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
      <div className="mx-auto max-w-[1400px] space-y-lg p-margin-mobile md:p-margin-desktop">
        <section className="relative overflow-hidden rounded-2xl bg-primary-container p-lg">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary-container opacity-20 blur-3xl" />
          <div className="relative z-10 max-w-xl">
            <p className="mb-sm font-label-md text-label-md uppercase tracking-widest text-on-primary/70">{t("heroBadge")}</p>
            <h1 className="mb-md font-display-lg-mobile leading-tight text-primary md:font-display-lg">
              {t("heroTitle1")}
              <br />
              {t("heroTitle2")}
            </h1>
            <p className="mb-lg font-body-lg text-on-primary/80">
              {t("heroDesc")}
            </p>
            <div className="flex flex-wrap gap-sm">
              <Link
                href={heroHref}
                className="glow-accent flex items-center gap-sm rounded-xl bg-secondary px-lg py-md font-headline-sm text-on-secondary transition-colors hover:bg-secondary-fixed-dim"
              >
                <span className="material-symbols-outlined">gavel</span>
                {t("viewFeaturedLot")}
              </Link>
            </div>
          </div>
        </section>

        <div className="no-scrollbar flex gap-sm overflow-x-auto pb-xs">
          {categories.map((category, index) => (
            <button
              key={category}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-md py-sm font-label-md text-label-md transition-colors ${
                index === 0
                  ? "glow-accent bg-secondary text-on-secondary"
                  : "border border-outline-variant text-on-surface hover:bg-surface-container-low"
              }`}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>

        <section>
          <div className="mb-md flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <h2 className="font-headline-sm text-headline-sm text-primary">{t("liveAuctions")}</h2>
              <span className="flex items-center gap-1 rounded-full bg-error-container px-2 py-1 text-[10px] font-bold uppercase text-on-error-container">
                <span className="pulse-live h-1.5 w-1.5 rounded-full bg-error" />
                {t("liveCount", { count: liveLots.length })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-4">
            {liveLots.map((product) => (
              <LotCard key={product.productId} product={product} t={t} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-md flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-primary">{t("upcomingLots")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-4">
            {upcomingLots.map((product) => (
              <LotCard key={`upcoming-${product.productId}`} product={product} t={t} />
            ))}
          </div>
        </section>
      </div>
    </CollectorShell>
  );
}
