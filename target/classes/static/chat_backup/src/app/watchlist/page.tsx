import { mockWatchlist } from "@/lib/mock-data";
import Link from "next/link";
import CollectorShell from "@/components/layout/CollectorShell";

export default function WatchlistPage() {
  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">Watchlist</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">Track lots you are monitoring for upcoming bids.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
          {mockWatchlist.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-xl overflow-hidden soft-shadow border border-surface-variant group"
            >
              <div className="relative h-48 overflow-hidden bg-surface-variant">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-surface-container/90 backdrop-blur-sm text-on-surface px-2 py-1 rounded font-label-sm text-label-sm">
                    Lot #{item.lotNumber}
                  </span>
                </div>
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/90 flex items-center justify-center text-error hover:bg-surface transition-colors">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </button>
              </div>
              <div className="p-md">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{item.category}</span>
                <h3 className="font-headline-sm text-headline-sm text-primary mt-1 mb-sm">{item.title}</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Current Bid</p>
                    <p className="font-headline-sm text-headline-sm text-primary font-bold">${item.currentBid.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Time Left</p>
                    <p className="font-label-md text-label-md text-error font-bold">{item.timeLeft}</p>
                  </div>
                </div>
                <Link
                  href={`/auctions/${item.id}`}
                  className="mt-md w-full bg-primary-container text-on-primary font-label-md text-label-md py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-xs"
                >
                  View Auction
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CollectorShell>
  );
}
