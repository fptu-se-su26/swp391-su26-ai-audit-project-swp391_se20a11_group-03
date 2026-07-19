"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FiArrowRight } from "react-icons/fi";
import {
  fetchStorefrontCategories,
  fetchStorefrontLots,
  type StorefrontCategory,
  type StorefrontLot,
} from "@/lib/api";

export default function CategoriesGrid() {
  const t = useTranslations("categoriesGrid");
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

  const hydratedCategories = useMemo(
    () =>
      categories.map((category) => {
        const categoryLots = lots.filter(
          (lot) => lot.categoryId === category.id,
        );
        return {
          ...category,
          count: String(categoryLots.length),
        };
      }),
    [categories, lots],
  );
  const maxCount = Math.max(
    1,
    ...hydratedCategories.map((category) => Number(category.count)),
  );

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-12">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.25em] text-[#f0c982]">
            {t("badge")}
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            {t("title")}
          </h2>
        </div>
        <Link
          href="/storefront"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d7aa63]/45 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          {t("viewAll")}
          <FiArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-8">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="min-h-[340px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] lg:col-span-2 xl:min-h-[390px]"
              />
            ))
          : hydratedCategories.map((category, index) => {
              const fillPct = Math.round(
                (Number(category.count) / maxCount) * 100,
              );
              const finalRowCount = hydratedCategories.length % 4;
              const firstFinalRowIndex =
                hydratedCategories.length - finalRowCount;
              const finalRowStartClass =
                index === firstFinalRowIndex
                  ? finalRowCount === 3
                    ? "lg:col-start-2"
                    : finalRowCount === 2
                      ? "lg:col-start-3"
                      : finalRowCount === 1
                        ? "lg:col-start-4"
                        : ""
                  : "";

              return (
                <Link
                  key={category.id}
                  href={`/storefront?category=${category.id}`}
                  className={`theme-dark-content theme-dark-surface group relative isolate min-h-[340px] overflow-hidden rounded-2xl border border-white/15 bg-[#080808] text-white transition-all duration-500 hover:-translate-y-1.5 hover:border-[#f0c982]/70 hover:shadow-[0_26px_55px_-28px_rgba(215,170,99,0.75)] lg:col-span-2 xl:min-h-[390px] ${finalRowStartClass}`}
                >
                  <Image
                    src={category.imageSrc}
                    alt={category.label}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                  />
                  <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/15 via-black/20 to-black/95" />
                  <div className="absolute inset-0 z-[1] bg-[linear-gradient(120deg,rgba(0,0,0,0.18),transparent_55%)]" />

                  <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-5 sm:p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f0c982]/50 bg-black/55 shadow-lg backdrop-blur-md">
                      <span className="material-symbols-outlined text-2xl text-[#f0c982]">
                        {category.icon}
                      </span>
                    </span>
                    <span className="rounded-full border border-white/20 bg-black/45 px-3 py-2 text-right backdrop-blur-md">
                      <span className="text-base font-bold text-[#f0c982]">
                        {category.count}
                      </span>
                      <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/60">
                        LOT
                      </span>
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#f0c982]">
                      {t("curated")}
                    </p>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold tracking-wide text-white">
                          {category.label}
                        </h3>
                        <p className="mt-2 line-clamp-2 max-w-[28ch] text-sm leading-relaxed text-white/68">
                          {category.description ||
                            t("fallbackDesc")}
                        </p>
                      </div>
                      <span className="flex h-11 w-11 shrink-0 translate-y-2 items-center justify-center rounded-full border border-white/25 bg-white/10 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <FiArrowRight className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>

                    <div className="mt-5 h-px w-full overflow-hidden bg-white/20">
                      <div
                        className="h-full bg-gradient-to-r from-[#f0c982] to-[#d7aa63] transition-[width] duration-700"
                        style={{ width: `${Math.max(fillPct, 12)}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
