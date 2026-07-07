"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { StorefrontLot } from "@/lib/mock-data";

const QUICK_FILTERS = [
  { id: "live", label: "Đang live", icon: "sensors" },
  { id: "ending", label: "Sắp kết thúc", icon: "hourglass_top" },
  { id: "highest", label: "Giá cao nhất", icon: "trending_up" },
  { id: "consign", label: "Có thể ký gửi", icon: "sell" },
] as const;

const SORT_OPTIONS = [
  { value: "default", label: "Mặc định" },
  { value: "ending", label: "Sắp kết thúc" },
  { value: "highest", label: "Giá cao nhất" },
  { value: "lowest", label: "Giá thấp nhất" },
  { value: "name", label: "Tên A-Z" },
] as const;

type QuickFilter = (typeof QUICK_FILTERS)[number]["id"];
type SortBy = (typeof SORT_OPTIONS)[number]["value"];

type StorefrontLotBrowserProps = {
  lots: StorefrontLot[];
  categoryLabel: string;
};

function timeLeftToSeconds(timeLeft: string) {
  const [hours = "0", minutes = "0", seconds = "0"] = timeLeft.split(":");
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function parsePrice(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const price = Number(trimmedValue);
  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

export default function StorefrontLotBrowser({
  lots,
  categoryLabel,
}: StorefrontLotBrowserProps) {
  const [query, setQuery] = useState("");
  const [liveOnly, setLiveOnly] = useState(false);
  const [consignOnly, setConsignOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const visibleLots = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
    const min = parsePrice(minPrice);
    const max = parsePrice(maxPrice);

    const filteredLots = lots.filter((lot) => {
      const matchesQuery =
        !normalizedQuery ||
        lot.title.toLocaleLowerCase("vi-VN").includes(normalizedQuery) ||
        lot.lotNumber.toLocaleLowerCase("vi-VN").includes(normalizedQuery);
      const matchesLive = !liveOnly || lot.isLive;
      const matchesConsign = !consignOnly || lot.canConsign;
      const matchesMin = min === undefined || lot.currentBid >= min;
      const matchesMax = max === undefined || lot.currentBid <= max;

      return (
        matchesQuery &&
        matchesLive &&
        matchesConsign &&
        matchesMin &&
        matchesMax
      );
    });

    return filteredLots.sort((a, b) => {
      if (sortBy === "ending") {
        return timeLeftToSeconds(a.timeLeft) - timeLeftToSeconds(b.timeLeft);
      }

      if (sortBy === "highest") {
        return b.currentBid - a.currentBid;
      }

      if (sortBy === "lowest") {
        return a.currentBid - b.currentBid;
      }

      if (sortBy === "name") {
        return a.title.localeCompare(b.title, "vi-VN");
      }

      return 0;
    });
  }, [consignOnly, liveOnly, lots, maxPrice, minPrice, query, sortBy]);

  const hasActiveFilters =
    query ||
    liveOnly ||
    consignOnly ||
    sortBy !== "default" ||
    minPrice ||
    maxPrice;

  function resetFilters() {
    setQuery("");
    setLiveOnly(false);
    setConsignOnly(false);
    setSortBy("default");
    setMinPrice("");
    setMaxPrice("");
  }

  function handleQuickFilter(filter: QuickFilter) {
    if (filter === "live") {
      setLiveOnly((current) => !current);
      return;
    }

    if (filter === "consign") {
      setConsignOnly((current) => !current);
      return;
    }

    if (filter === "ending") {
      setSortBy((current) => (current === "ending" ? "default" : "ending"));
      return;
    }

    setSortBy((current) => (current === "highest" ? "default" : "highest"));
  }

  function isQuickFilterActive(filter: QuickFilter) {
    if (filter === "live") {
      return liveOnly;
    }

    if (filter === "consign") {
      return consignOnly;
    }

    return sortBy === filter;
  }

  return (
    <div className="min-w-0">
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(320px,1fr)_auto] xl:items-center">
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 focus-within:border-[var(--luxora-gold)]">
            <span className="material-symbols-outlined text-base text-white/35">
              search
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên sản phẩm hoặc mã lot"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
          </label>

          <label className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white/55">
            <span className="material-symbols-outlined text-base text-white/35">
              sort
            </span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="bg-transparent text-sm text-white outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-[#111] text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(280px,0.45fr)_minmax(360px,1fr)_auto] xl:items-center">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Giá từ"
              className="h-10 min-w-0 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--luxora-gold)]"
            />
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Giá đến"
              className="h-10 min-w-0 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--luxora-gold)]"
            />
          </div>

          <div className="flex min-w-0 flex-wrap gap-2">
            {QUICK_FILTERS.map((filter) => {
              const isActive = isQuickFilterActive(filter.id);

              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleQuickFilter(filter.id)}
                  className={`flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-[var(--luxora-gold)] bg-[var(--luxora-gold)]/15 text-[var(--luxora-gold-light)]"
                      : "border-white/10 text-white/60 hover:border-[var(--luxora-gold)] hover:text-[var(--luxora-gold-light)]"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {filter.icon}
                  </span>
                  {filter.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="h-10 whitespace-nowrap rounded-full border border-white/10 px-5 text-xs font-semibold text-white/55 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            Đặt lại
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--luxora-gold)]">
            Sản phẩm đang bán
          </p>
          <h2 className="mt-2 text-2xl font-bold">{categoryLabel}</h2>
          {hasActiveFilters && (
            <p className="mt-2 text-sm text-white/45">
              Đang lọc {visibleLots.length} trong {lots.length} lot
            </p>
          )}
        </div>
        <span className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/50">
          {visibleLots.length} lot
        </span>
      </div>

      {visibleLots.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {visibleLots.map((lot) => (
            <Link
              key={lot.id}
              href={`/auctions/${lot.id}`}
              className="glass-card group flex h-full flex-col overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#030303]">
                <Image
                  src={lot.image}
                  alt={lot.title}
                  fill
                  sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03] sm:p-6"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
                {lot.isLive && (
                  <span className="pulse-live absolute left-3 top-3 rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-semibold text-white">
                    LIVE
                  </span>
                )}
                {lot.canConsign && (
                  <span className="absolute left-3 top-12 rounded-full border border-[var(--luxora-gold)]/40 bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-[var(--luxora-gold-light)] backdrop-blur">
                    KÝ GỬI
                  </span>
                )}
                <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white/75 backdrop-blur">
                  {lot.lotNumber}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug">
                  {lot.title}
                </h3>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-white/40">Giá hiện tại</p>
                    <p className="text-xl font-bold text-[var(--luxora-gold-light)]">
                      ${lot.currentBid.toLocaleString("en-US")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-white/40">Còn lại</p>
                    <p className="text-xs font-medium text-white/70">
                      {lot.timeLeft}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                    Xem chi tiết
                  </span>
                  <span className="material-symbols-outlined text-base text-[var(--luxora-gold-light)] transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/50">
          Chưa có lot phù hợp với bộ lọc này.
        </div>
      )}
    </div>
  );
}
