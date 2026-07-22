"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import LiveAuctionGrid from "@/components/home/LiveAuctionGrid";
import PublicProductSection from "@/components/home/PublicProductSection";
import {
  fetchLiveAuctions,
  fetchStorefrontCategories,
  fetchStorefrontLots,
  type StorefrontCategory,
  type StorefrontLot,
} from "@/lib/api";
import type { LiveAuctionItem } from "@/lib/home-data";

export default function HomeDynamicSections() {
  const t = useTranslations("home");
  const [liveItems, setLiveItems] = useState<LiveAuctionItem[]>([]);
  const [lots, setLots] = useState<StorefrontLot[]>([]);
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      const [nextLiveItems, nextLots] = await Promise.all([
        fetchLiveAuctions(5),
        fetchStorefrontLots(),
      ]);
      const nextCategories = await fetchStorefrontCategories(nextLots);

      if (!active) return;
      setLiveItems(nextLiveItems);
      setLots(nextLots);
      setCategories(nextCategories);
      setLoaded(true);
    }

    async function refreshLiveAuctions() {
      const nextLiveItems = await fetchLiveAuctions(5);
      if (active) setLiveItems(nextLiveItems);
    }

    void loadInitialData().catch(() => {
      if (active) setLoaded(true);
    });

    // A scheduled LIVE room can become active while the visitor is already on
    // the homepage, so keep this section synchronized without a manual reload.
    const liveRefreshInterval = window.setInterval(
      () => void refreshLiveAuctions(),
      10_000,
    );

    return () => {
      active = false;
      window.clearInterval(liveRefreshInterval);
    };
  }, []);

  if (!loaded) return null;

  return (
    <>
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-14 lg:px-12">
          <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
            <h2 className="flex min-w-0 items-center gap-3 text-xs font-semibold tracking-[0.18em] text-white sm:text-sm sm:tracking-[0.25em]">
              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <span className="truncate">{t("liveSection")}</span>
            </h2>
            <Link
              href="/auctions"
              className="flex shrink-0 items-center gap-2 text-[11px] font-medium tracking-wider text-white/60 transition-colors hover:text-white sm:text-xs"
            >
              {t("seeAll")}
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </Link>
          </div>

          {liveItems.length > 0 ? (
            <LiveAuctionGrid items={liveItems} />
          ) : (
            <p className="rounded-lg border border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-white/50">
              {t("noLiveAuctions")}
            </p>
          )}
        </div>
      </section>
      <PublicProductSection lots={lots} categories={categories} />
    </>
  );
}
