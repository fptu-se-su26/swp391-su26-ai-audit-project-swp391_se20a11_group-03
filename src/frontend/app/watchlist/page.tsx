"use client";

import Link from "next/link";
import CollectorShell from "@/components/shells/CollectorShell";
import { toImageSrc, userApi, type WatchlistEntry } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

async function loadWatchlist(): Promise<WatchlistEntry[]> {
  return (await userApi.watchlist()).data;
}

function timeLeft(endTime: string | null) {
  if (!endTime) return "Chưa lên lịch";
  const milliseconds = new Date(endTime).getTime() - Date.now();
  if (milliseconds <= 0) return "Đã kết thúc";
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  return `${hours} giờ ${minutes} phút`;
}

export default function WatchlistPage() {
  const { data: watchlist, setData, loading, error } = useApiData(loadWatchlist, []);

  async function remove(productId: number) {
    await userApi.removeFromWatchlist(productId);
    setData((items) => items.filter((item) => item.productId !== productId));
  }

  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">Danh sách theo dõi</h1>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {watchlist.map((item) => (
            <div
              key={item.id}
              className="glass-card group flex flex-col overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url(${toImageSrc(item.image)})` }}
                />
                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold backdrop-blur">
                  {item.lotNumber}
                </span>
                <button
                  type="button"
                  onClick={() => void remove(item.productId)}
                  aria-label={`Bỏ theo dõi ${item.productName}`}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-[var(--luxora-gold)] backdrop-blur"
                >
                  <span className="material-symbols-outlined text-lg">
                    favorite
                  </span>
                </button>
              </div>
              <div className="flex flex-col gap-1 p-4">
                <span className="text-[10px] tracking-wider text-white/40">
                  {item.status}
                </span>
                <h3 className="text-sm font-semibold">{item.productName}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/40">Giá hiện tại</p>
                    <p className="text-base font-bold text-[var(--luxora-gold-light)]">
                      {item.currentBid.toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/40">Thời gian còn lại</p>
                    <p className="text-xs font-semibold">{timeLeft(item.endTime)}</p>
                  </div>
                </div>
                <Link
                  href={item.auctionId ? `/auctions/${item.auctionId}` : `/storefront`}
                  className="mt-3 rounded-full border border-white/15 py-2 text-center text-xs font-semibold hover:border-[var(--luxora-gold)] hover:text-[var(--luxora-gold-light)]"
                >
                  Xem phiên đấu giá
                </Link>
              </div>
            </div>
          ))}
          {!loading && watchlist.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-white/45">
              {error ?? "Danh sách theo dõi đang trống."}
            </p>
          )}
        </div>
      </div>
    </CollectorShell>
  );
}
