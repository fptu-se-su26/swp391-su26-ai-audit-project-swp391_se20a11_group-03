"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { StorefrontCategory } from "@/lib/api";

type CategoryFilterItem = StorefrontCategory & { lotCount: number };

type StorefrontCategoryFilterProps = {
  categories: CategoryFilterItem[];
  activeCategoryId?: string;
  totalLotCount: number;
  basePath?: "/auctions" | "/storefront";
};

function toSentenceCase(label: string) {
  const lower = label.toLocaleLowerCase("vi-VN");
  return lower.charAt(0).toLocaleUpperCase("vi-VN") + lower.slice(1);
}

export default function StorefrontCategoryFilter({
  categories,
  activeCategoryId,
  totalLotCount,
  basePath = "/storefront",
}: StorefrontCategoryFilterProps) {
  const t = useTranslations("storefront");
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
    if (!normalizedQuery) return categories;
    return categories.filter((c) =>
      c.label.toLocaleLowerCase("vi-VN").includes(normalizedQuery),
    );
  }, [categories, query]);

  return (
    <aside className="storefront-category-panel glass-panel h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            {t("filterLabel")}
          </p>
          <h2 className="mt-1 text-base font-semibold text-white">{t("categoryLabel")}</h2>
        </div>
        {activeCategoryId && (
          <Link
            href={basePath}
            className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium text-white/55 transition-colors hover:border-[var(--luxora-gold)] hover:text-[var(--luxora-gold-light)]"
          >
            {t("clearFilter")}
          </Link>
        )}
      </div>

      <label className="storefront-control mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-[var(--luxora-bg-elevated)] px-3 py-2 focus-within:border-[var(--luxora-gold)]">
        <span className="material-symbols-outlined text-base text-white/35">
          search
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchCategory")}
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
        />
      </label>

      <div className="mt-4 flex flex-col gap-1.5">
        <Link
          href={basePath}
          className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
            activeCategoryId
              ? "text-white/60 hover:bg-white/5 hover:text-white"
              : "bg-white/10 font-semibold text-white"
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="material-symbols-outlined text-base text-[var(--luxora-gold-light)]">
              grid_view
            </span>
            {t("allProducts")}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/55">
            {totalLotCount}
          </span>
        </Link>

        {filteredCategories.map((category) => {
          const isActive = activeCategoryId === category.id;
          return (
            <Link
              key={category.id}
              href={`${basePath}?category=${category.id}`}
              className={`group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-[var(--luxora-gold)]/15 font-semibold text-[var(--luxora-gold-light)]"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className={`material-symbols-outlined text-base ${
                  isActive ? "text-[var(--luxora-gold-light)]" : "text-white/35 group-hover:text-white/60"
                }`}>
                  {category.icon}
                </span>
                <span className="truncate">{toSentenceCase(category.label)}</span>
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${
                isActive ? "bg-black/20 text-white/75" : "bg-white/10 text-white/45"
              }`}>
                {category.lotCount}
              </span>
            </Link>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-4 text-center text-xs text-white/45">
          {t("filterNotFound")}
        </p>
      )}
    </aside>
  );
}
