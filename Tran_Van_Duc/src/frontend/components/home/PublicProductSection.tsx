"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORY_ITEMS } from "@/lib/home-data";
import { mockStorefrontLots } from "@/lib/mock-data";

const featuredLots = mockStorefrontLots.slice(0, 4);

export default function PublicProductSection() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const visibleLots = useMemo(() => {
    if (!selectedCategoryId) {
      return featuredLots;
    }

    return mockStorefrontLots.filter(
      (lot) => lot.categoryId === selectedCategoryId,
    );
  }, [selectedCategoryId]);

  return (
    <section className="border-b border-white/10 bg-[#050505]">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-14 lg:px-12">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f0c982]">
              Sản phẩm đang bán
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Xem nhanh sản phẩm và danh mục nổi bật
            </h2>
          </div>
          <Link
            href="/"
            onClick={(event) => {
              event.preventDefault();
              setSelectedCategoryId(null);
            }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d7aa63]/50 px-5 py-3 text-xs font-semibold tracking-wider text-white transition-colors hover:bg-[#f0c982] hover:text-black"
          >
            Xem tất cả sản phẩm
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <Link
            href="/storefront"
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              selectedCategoryId
                ? "border border-white/15 text-white/70 hover:border-[#d7aa63] hover:text-white"
                : "bg-white text-black"
            }`}
          >
            Tất cả
          </Link>
          {CATEGORY_ITEMS.slice(0, 7).map((category) => (
            <Link
              key={category.id}
              href="/"
              onClick={(event) => {
                event.preventDefault();
                setSelectedCategoryId(category.id);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                selectedCategoryId === category.id
                  ? "bg-white text-black"
                  : "border border-white/15 text-white/70 hover:border-[#d7aa63] hover:text-white"
              }`}
            >
              {category.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleLots.map((lot) => {
            const category = CATEGORY_ITEMS.find(
              (item) => item.id === lot.categoryId,
            );

            return (
              <article
                key={lot.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-[#d7aa63]/25 bg-[#080808] transition-colors hover:border-[#f0c982]"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-black">
                  <Link
                    href={`/auctions/${lot.id}`}
                    aria-label={`Xem chi tiết ${lot.title}`}
                    className="absolute inset-0"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${lot.image})` }}
                    />
                  </Link>
                  {lot.isLive && (
                    <span className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      LIVE
                    </span>
                  )}
                  {category && (
                    <Link
                      href="/"
                      onClick={(event) => {
                        event.preventDefault();
                        setSelectedCategoryId(category.id);
                      }}
                      className="absolute right-3 top-3 z-10 rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white/80 transition-colors hover:border-[#f0c982] hover:text-[#f0c982]"
                    >
                      {category.label}
                    </Link>
                  )}
                </div>
                <Link
                  href={`/auctions/${lot.id}`}
                  className="flex flex-1 flex-col gap-3 p-4"
                >
                  <div>
                    <p className="text-[10px] tracking-wider text-[#f0c982]">
                      {lot.lotNumber}
                    </p>
                    <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold text-white">
                      {lot.title}
                    </h3>
                  </div>
                  <div className="mt-auto border-t border-white/10 pt-3">
                    <p className="text-[10px] tracking-wider text-white/45">
                      Giá hiện tại
                    </p>
                    <p className="text-xl font-bold text-white">
                      ${lot.currentBid.toLocaleString("en-US")}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      Còn lại {lot.timeLeft}
                    </p>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
