import Link from "next/link";
import CollectorShell from "@/components/shells/CollectorShell";
import { mockWatchlist } from "@/lib/mock-data";

export default function WatchlistPage() {
  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">Danh sách theo dõi</h1>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {mockWatchlist.map((item) => (
            <div
              key={item.id}
              className="glass-card group flex flex-col overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold backdrop-blur">
                  {item.lotNumber}
                </span>
                <button
                  type="button"
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-[var(--luxora-gold)] backdrop-blur"
                >
                  <span className="material-symbols-outlined text-lg">
                    favorite
                  </span>
                </button>
              </div>
              <div className="flex flex-col gap-1 p-4">
                <span className="text-[10px] tracking-wider text-white/40">
                  {item.category}
                </span>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/40">Giá hiện tại</p>
                    <p className="text-base font-bold text-[var(--luxora-gold-light)]">
                      ${item.currentBid.toLocaleString("en-US")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/40">Thời gian còn lại</p>
                    <p className="text-xs font-semibold">{item.timeLeft}</p>
                  </div>
                </div>
                <Link
                  href={`/auctions/${item.id}`}
                  className="mt-3 rounded-full border border-white/15 py-2 text-center text-xs font-semibold hover:border-[var(--luxora-gold)] hover:text-[var(--luxora-gold-light)]"
                >
                  Xem phiên đấu giá
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CollectorShell>
  );
}
