import { mockStorefrontLots } from "@/lib/mock-data";
import Link from "next/link";
import CollectorShell from "@/components/layout/CollectorShell";

const CATEGORIES = ["All", "Watches", "Fine Art", "Jewelry", "Automotive", "Wine & Spirits", "Real Estate"];

function LotCard({ lot }: { lot: (typeof mockStorefrontLots)[0] }) {
  return (
    <div className="bg-surface rounded-xl overflow-hidden soft-shadow border border-surface-variant group flex flex-col">
      <div className="relative h-52 overflow-hidden bg-surface-variant">
        <img
          src={lot.image}
          alt={lot.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {lot.isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-surface/90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-error pulse-live" />
            <span className="font-label-sm text-[10px] text-on-surface font-bold uppercase tracking-wide">Live</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm rounded px-2 py-1">
          <span className="font-label-sm text-label-sm text-on-surface">Lot #{lot.lotNumber}</span>
        </div>
      </div>
      <div className="p-md flex flex-col flex-1">
        <h3 className="font-headline-sm text-headline-sm text-primary mb-auto">{lot.title}</h3>
        <div className="mt-md flex justify-between items-end">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Current Bid</p>
            <p className="font-headline-sm text-headline-sm text-primary font-bold">${lot.currentBid.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="font-label-sm text-label-sm text-on-surface-variant">Ends in</p>
            <p className={`font-label-md text-label-md font-bold ${lot.isLive ? "text-error" : "text-on-surface"}`}>{lot.timeLeft}</p>
          </div>
        </div>
        <Link
          href={`/auctions/${lot.id}`}
          className="mt-md w-full bg-secondary text-on-secondary font-label-md text-label-md py-2.5 rounded-lg hover:bg-secondary-fixed-dim transition-colors glow-accent flex items-center justify-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">gavel</span>
          {lot.isLive ? "Bid Now" : "View Lot"}
        </Link>
      </div>
    </div>
  );
}

export default function StorefrontPage() {
  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        {/* Hero */}
        <section className="bg-primary-container rounded-2xl p-lg relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-72 h-72 bg-secondary-container opacity-20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <p className="font-label-md text-label-md text-on-primary/70 uppercase tracking-widest mb-sm">Heritage Collection · Now Live</p>
            <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-md leading-tight">
              Extraordinary Objects.<br />Singular Provenance.
            </h1>
            <p className="font-body-lg text-on-primary/80 mb-lg">
              Bid on authenticated works of art, rare timepieces, and curated luxury goods from estates around the world.
            </p>
            <div className="flex flex-wrap gap-sm">
              <Link
                href="/auctions/1"
                className="bg-secondary text-on-secondary font-headline-sm px-lg py-md rounded-xl hover:bg-secondary-fixed-dim transition-colors glow-accent flex items-center gap-sm"
              >
                <span className="material-symbols-outlined">gavel</span>
                Bid on Live Lots
              </Link>
              <button className="border border-primary text-primary font-label-md px-lg py-md rounded-xl hover:bg-primary/5 transition-colors flex items-center gap-sm">
                <span className="material-symbols-outlined">calendar_month</span>
                View Schedule
              </button>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <div className="flex gap-sm overflow-x-auto pb-xs no-scrollbar">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              className={`whitespace-nowrap px-md py-sm rounded-full font-label-md text-label-md transition-colors flex-shrink-0 ${
                i === 0
                  ? "bg-secondary text-on-secondary glow-accent"
                  : "border border-outline-variant text-on-surface hover:bg-surface-container-low"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live Auctions */}
        <section>
          <div className="flex items-center justify-between mb-md">
            <div className="flex items-center gap-sm">
              <h2 className="font-headline-sm text-headline-sm text-primary">Live Auctions</h2>
              <span className="flex items-center gap-1 bg-error-container text-on-error-container px-2 py-1 rounded-full font-label-sm text-[10px] font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-error pulse-live" />
                {mockStorefrontLots.filter((l) => l.isLive).length} Live
              </span>
            </div>
            <button className="text-secondary font-label-sm text-label-sm hover:underline">View All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-md">
            {mockStorefrontLots.map((lot) => (
              <LotCard key={lot.id} lot={lot} />
            ))}
          </div>
        </section>

        {/* Upcoming */}
        <section>
          <div className="flex items-center justify-between mb-md">
            <h2 className="font-headline-sm text-headline-sm text-primary">Upcoming Lots</h2>
            <button className="text-secondary font-label-sm text-label-sm hover:underline">Browse Catalogue</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-md">
            {mockStorefrontLots.slice(0, 4).map((lot) => (
              <div key={`upcoming-${lot.id}`} className="bg-surface rounded-xl overflow-hidden soft-shadow border border-surface-variant">
                <div className="h-36 bg-surface-variant overflow-hidden">
                  <img src={lot.image} alt={lot.title} className="w-full h-full object-cover opacity-60" />
                </div>
                <div className="p-md">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Preview · Nov 5, 2023</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary mt-xs mb-sm text-sm">{lot.title}</h3>
                  <button className="w-full border border-outline-variant rounded-lg py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">favorite_border</span>
                    Add to Watchlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </CollectorShell>
  );
}
