"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import StorefrontCategoryFilter from "./StorefrontCategoryFilter";
import StorefrontLotBrowser from "./StorefrontLotBrowser";
import StorefrontDataFallback from "./StorefrontDataFallback";
import {
  fetchStorefrontCategories,
  fetchStorefrontLots,
  type StorefrontCategory,
  type StorefrontLot,
} from "@/lib/api";

export default function StorefrontData({
  basePath = "/storefront",
}: {
  basePath?: "/storefront" | "/auctions";
}) {
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get("category") ?? undefined;
  const [lots, setLots] = useState<StorefrontLot[]>([]);
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [nextLots, nextCategories] = await Promise.all([
        fetchStorefrontLots(),
        fetchStorefrontCategories([]),
      ]);

      if (cancelled) return;
      setLots(nextLots);
      setCategories(nextCategories);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryFilters = useMemo(
    () =>
      categories.map((category) => {
        const categoryLots = lots.filter(
          (lot) => lot.categoryId === category.id,
        );
        return {
          ...category,
          count: String(categoryLots.length),
          imageSrc: categoryLots[0]?.image ?? category.imageSrc,
          lotCount: categoryLots.length,
        };
      }),
    [categories, lots],
  );
  const activeCategory = categoryFilters.find(
    (category) => category.id === selectedCategoryId,
  );
  const visibleLots = activeCategory
    ? lots.filter((lot) => lot.categoryId === activeCategory.id)
    : lots;

  if (loading) {
    return <StorefrontDataFallback />;
  }

  return (
    <div className="mt-8 grid min-h-[700px] grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
      <StorefrontCategoryFilter
        categories={categoryFilters}
        activeCategoryId={activeCategory?.id}
        totalLotCount={lots.length}
        basePath={basePath}
      />
      <StorefrontLotBrowser
        lots={visibleLots}
        categoryLabel={activeCategory?.label ?? "Tất cả danh mục"}
      />
    </div>
  );
}
