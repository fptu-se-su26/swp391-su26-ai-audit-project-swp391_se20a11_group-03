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
          imageSrc: categoryLots[0]?.image ?? category.imageSrc,
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="aspect-[3/4] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
              />
            ))
          : hydratedCategories.map((category) => {
              const fillPct = Math.round(
                (Number(category.count) / maxCount) * 100,
              );

              return (
                <Link
                  key={category.id}
                  href={`/storefront?category=${category.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#070707] transition-all hover:-translate-y-1 hover:border-[#f0c982]/60 hover:shadow-[0_20px_45px_-25px_rgba(240,201,130,0.5)]"
                >
                  <div className="relative aspect-[4/3] bg-black">
                    <Image
                      src={category.imageSrc}
                      alt={category.label}
                      fill
                      sizes="(min-width: 1024px) 25vw, 100vw"
                      className="object-contain p-4 transition-transform group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#d7aa63]/40 bg-black/60">
                      <span className="material-symbols-outlined text-2xl text-[#f0c982]">
                        {category.icon}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold tracking-wider">
                        {category.label}
                      </h3>
                      <span className="text-right">
                        <span className="block text-2xl font-bold text-[#f0c982]">
                          {category.count}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-white/35">
                          {t("lotUnit")}
                        </span>
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/55">
                      {category.description}
                    </p>
                    <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#f0c982] to-[#d7aa63]"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <span className="mt-auto flex items-center gap-1 pt-5 text-xs font-semibold uppercase tracking-wider text-[#f0c982] opacity-0 transition-opacity group-hover:opacity-100">
                      {t("explore")}
                      <FiArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
