"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CollectorShell from "@/components/layout/CollectorShell";
import { useTranslations } from "@/i18n/I18nProvider";
import { getWatchlist, WatchlistItem, removeFromWatchlist } from "@/lib/services/userBidService";
import { refreshWatchlistIds, subscribeWatchlist } from "@/lib/watchlist";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";

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
      <div className="mx-auto max-w-[1260px] space-y-7 px-4 py-10 sm:px-7 lg:px-10 lg:py-14">
        <DashboardHeader eyebrow="Your private collection" title={t("title")} subtitle={t("subtitle")} actionLabel={t("exploreLiveLots")} actionHref="/live" />
        <div className="flex flex-wrap items-center gap-2 border-y border-white/10 py-4"><button className="rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-4 py-2 text-xs font-semibold text-[#100d08]">Tất cả</button>{["Watches","Art","Jewelry","Cars"].map(x=><button key={x} className="rounded-full px-4 py-2 text-xs font-semibold text-[#9d948a] hover:bg-white/[.06] hover:text-[#f0d98b]">{x}</button>)}<button className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-xs font-semibold text-[#c8bda9]"><span className="material-symbols-outlined text-[17px]">sort</span>Ending soon</button></div>

        {error && (
          <div className="rounded-xl border border-error/30 bg-error-container px-4 py-3 text-error">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton cards={4} />
        ) : items.length === 0 ? (
          <EmptyState icon="favorite" title={t("emptyTitle")} description={t("emptyDesc")} actionLabel={t("exploreProducts")} actionHref="/live" />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0e0d0b] shadow-[0_8px_28px_rgba(0,0,0,.4)] transition hover:-translate-y-1 hover:border-[#c4a55a] hover:shadow-[0_18px_42px_rgba(0,0,0,.55)]"
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
                    <span className="rounded-full bg-[#071626]/90 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm">
                      {item.lotNumber}
                    </span>
                  </div>
                </div>

                <div className="p-5">
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
                      className="flex-1 rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] py-2.5 text-center text-xs font-bold text-[#100d08] transition hover:brightness-110"
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
