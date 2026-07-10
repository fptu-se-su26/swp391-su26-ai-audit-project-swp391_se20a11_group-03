"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eyebrow, LuxeHeading } from "./primitives";
import FeaturedPeriodTabs from "./FeaturedPeriodTabs";
import { UpcomingCard } from "./LotCards";
import { LuxuryLot } from "@/components/home/types";
import { toLuxuryLot } from "@/lib/luxuryLotMapper";
import { getFeaturedProducts, FeaturedProductsResponse } from "@/lib/services/featuredProductService";
import { searchProducts } from "@/lib/services/productService";
import { useTranslations } from "@/i18n/I18nProvider";

export default function LuxeProductFeed() {
  const t = useTranslations("luxe");
  const [upcoming, setUpcoming] = useState<LuxuryLot[]>([]);
  const [featured, setFeatured] = useState<FeaturedProductsResponse | null>(null);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoadingUpcoming(true);
    searchProducts({ status: "APPROVED", auctionStatus: "UPCOMING", size: 12 })
      .then((result) => {
        if (!alive) return;
        const sorted = [...result.content].sort((a, b) => {
          const ta = a.auctionStartTime ? new Date(a.auctionStartTime).getTime() : 0;
          const tb = b.auctionStartTime ? new Date(b.auctionStartTime).getTime() : 0;
          return ta - tb;
        });
        setUpcoming(sorted.map((p, i) => toLuxuryLot(p, i, "upcoming")));
      })
      .catch(() => {
        if (alive) setUpcoming([]);
      })
      .finally(() => {
        if (alive) setLoadingUpcoming(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoadingFeatured(true);
    getFeaturedProducts()
      .then((data) => {
        if (alive) setFeatured(data);
      })
      .catch(() => {
        if (alive) setFeatured({ daily: [], weekly: [], monthly: [] });
      })
      .finally(() => {
        if (alive) setLoadingFeatured(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <section className="bg-[radial-gradient(circle_at_12%_10%,rgba(212,170,97,0.14),transparent_28%),#11100d] px-5 py-16 md:px-12">
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[360px_1fr]">
          <div>
            <Eyebrow>{t("upcomingEyebrow")}</Eyebrow>
            <LuxeHeading as="h2" className="text-4xl md:text-5xl">
              {t("upcomingTitle")}
            </LuxeHeading>
            <p className="mt-4 text-sm leading-7 text-[#b7aea3]">
              {t("upcomingDesc")}
            </p>
          </div>
          <div>
            <div className="mb-5 flex justify-end">
              <Link href="/upcoming" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#d4aa61]">
                {t("viewAll")} <span className="material-symbols-outlined text-base">arrow_forward_ios</span>
              </Link>
            </div>
            {loadingUpcoming && upcoming.length === 0 ? (
              <p className="text-sm text-[#9d948a]">{t("loadingSessions")}</p>
            ) : upcoming.length === 0 ? (
              <div className="rounded-md border border-white/10 bg-[#090908] p-8 text-center">
                <p className="text-[#b7aea3]">{t("noUpcoming")}</p>
                <Link href="/browse" className="mt-4 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-[#d4aa61]">
                  {t("browseMarketplace")}
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {upcoming.slice(0, 3).map((lot) => (
                  <UpcomingCard key={lot.id} lot={lot} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#080807] px-5 py-20 md:px-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>{t("liveEyebrow")}</Eyebrow>
              <LuxeHeading as="h2" className="max-w-2xl text-4xl md:text-6xl">
                {t("featuredTitle")}
              </LuxeHeading>
            </div>
            <Link href="/browse" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#d4aa61]">
              {t("exploreCollection")} <span className="material-symbols-outlined text-base">arrow_forward_ios</span>
            </Link>
          </div>

          <FeaturedPeriodTabs
            data={featured}
            loading={loadingFeatured}
            toLot={(product, status) => toLuxuryLot(product, product.productId, status)}
          />
        </div>
      </section>
    </>
  );
}
