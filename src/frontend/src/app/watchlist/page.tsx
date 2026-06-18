"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CollectorShell from "@/components/layout/CollectorShell";
import { useTranslations } from "@/i18n/I18nProvider";
import { getWatchlist, WatchlistItem, removeFromWatchlist } from "@/lib/services/userBidService";
import { refreshWatchlistIds, subscribeWatchlist } from "@/lib/watchlist";

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export default function WatchlistPage() {
  const t = useTranslations("watchlistPage");
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWatchlist = async () => {
    setLoading(true);
    setError("");

    try {
      const watchlistItems = await getWatchlist();
      setItems(watchlistItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
    refreshWatchlistIds();
    const unsubscribe = subscribeWatchlist(loadWatchlist);
    return () => unsubscribe();
  }, []);

  const handleRemove = async (productId: number) => {
    const success = await removeFromWatchlist(productId);
    if (success) {
      setItems(prev => prev.filter(item => item.productId !== productId));
      refreshWatchlistIds();
    }
  };

  return (
    <CollectorShell>
      <div className="mx-auto max-w-[1400px] space-y-lg p-margin-mobile md:p-margin-desktop">
        <div>
          <h1 className="font-display-lg-mobile text-primary md:font-display-lg">{t("title")}</h1>
          <p className="mt-xs font-body-lg text-on-surface-variant">{t("subtitle")}</p>
        </div>

        {error && (
          <div className="rounded-xl border border-error/30 bg-error-container px-4 py-3 text-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-surface-variant bg-surface p-xl text-center text-on-surface-variant">
            {t("loading")}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant bg-surface p-xl text-center">
            <h2 className="font-headline-sm text-headline-sm text-primary">{t("emptyTitle")}</h2>
            <p className="mt-xs text-on-surface-variant">{t("emptyDesc")}</p>
            <Link
              href="/"
              className="mt-md inline-flex rounded-lg bg-primary px-5 py-3 font-label-md text-on-primary transition-opacity hover:opacity-90"
            >
              {t("exploreProducts")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-xl border border-surface-variant bg-surface soft-shadow"
              >
                <div className="relative">
                  <div className="aspect-square overflow-hidden bg-surface-variant">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute right-2 top-2">
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 text-error shadow-sm backdrop-blur-sm transition-all hover:bg-error hover:text-on-error"
                    >
                      <span className="material-symbols-outlined text-xl">favorite</span>
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="rounded-full bg-surface/80 px-3 py-1 text-[10px] font-bold uppercase text-on-surface shadow-sm backdrop-blur-sm">
                      {item.lotNumber}
                    </span>
                  </div>
                </div>

                <div className="p-md">
                  <div className="mb-sm">
                    <h3 className="line-clamp-2 font-headline-sm text-headline-sm text-primary">
                      {item.productName}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">{t("currentBid")}</p>
                      <p className="font-headline-sm text-headline-sm font-bold text-primary">
                        {formatVnd(item.currentBid)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">{t("ends")}</p>
                      <p className="text-sm text-on-surface">
                        {item.endTime ? new Date(item.endTime).toLocaleString("vi-VN") : t("tbd")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-md flex gap-sm">
                    <Link
                      href={`/auctions/${item.productId}`}
                      className="flex-1 rounded-lg bg-secondary py-2 text-center font-label-md text-label-md text-on-secondary transition-colors hover:bg-secondary-fixed-dim"
                    >
                      {t("viewDetails")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CollectorShell>
  );
}
