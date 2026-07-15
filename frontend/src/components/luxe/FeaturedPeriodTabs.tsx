"use client";

import { useState } from "react";
import { LuxuryLot } from "@/components/home/types";
import { FeaturedProductsResponse } from "@/lib/services/featuredProductService";
import { useTranslations } from "@/i18n/I18nProvider";
import { FeaturedCard } from "./LotCards";

type PeriodKey = "daily" | "weekly" | "monthly";

const PERIODS: PeriodKey[] = ["daily", "weekly", "monthly"];

type Props = {
  data: FeaturedProductsResponse | null;
  loading: boolean;
  toLot: (product: FeaturedProductsResponse["daily"][number], status: LuxuryLot["status"]) => LuxuryLot;
};

export default function FeaturedPeriodTabs({ data, loading, toLot }: Props) {
  const t = useTranslations("luxe");
  const [active, setActive] = useState<PeriodKey>("daily");

  const lots = data?.[active] ?? [];

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {PERIODS.map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => setActive(period)}
            className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
              active === period
                ? "bg-[#d4aa61] text-[#100d08]"
                : "border border-white/15 text-[#b7aea3] hover:border-[#d4aa61]/50 hover:text-[#d4aa61]"
            }`}
          >
            {t(`featuredTab_${period}`)}
          </button>
        ))}
      </div>

      {loading && lots.length === 0 ? (
        <p className="text-sm text-[#9d948a]">{t("loadingItems")}</p>
      ) : lots.length === 0 ? (
        <div className="min-h-[72px] py-4">
          <p className="text-sm text-[#9d948a]">{t(`noFeatured_${active}`)}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {lots.slice(0, 4).map((product) => {
            const lot = toLot(product, product.auctionStatus === "ACTIVE" ? "live" : "upcoming");
            return <FeaturedCard key={product.productId} lot={lot} live={lot.status === "live"} />;
          })}
        </div>
      )}
    </div>
  );
}
