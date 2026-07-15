"use client";

import { useState } from "react";
import { mockLiveAuction } from "@/lib/mock-data";
import CollectorShell from "@/components/layout/CollectorShell";

export default function AuctionDetailPage() {
  const auction = mockLiveAuction;
  const [activeImage, setActiveImage] = useState(0);
  const [depositOpen, setDepositOpen] = useState(false);
  const [customBid, setCustomBid] = useState("");

  const INCREMENT_BIDS = [
    auction.currentBid + 5000,
    auction.currentBid + 10000,
    auction.currentBid + 25000,
  ];

  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant mb-md">
          <a href="/storefront" className="hover:text-primary transition-colors">Storefront</a>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface">{auction.collection}</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary">Lot #{auction.lotNumber}</span>
        </nav>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
          {/* Left: Images + Details */}
          <div className="xl:col-span-2 space-y-lg">
            {/* Main Image */}
            <div className="relative bg-surface-variant rounded-2xl overflow-hidden aspect-video">
              <img
                src={auction.images[activeImage]}
                alt={auction.title}
                className="w-full h-full object-cover"
              />
              {auction.isLive && (
                <div className="absolute top-md left-md flex items-center gap-sm bg-surface/90 backdrop-blur-sm rounded-full px-md py-sm">
                  <span className="w-2 h-2 rounded-full bg-error pulse-live" />
                  <span className="font-label-md text-[11px] font-bold uppercase tracking-wider text-on-surface">Live Auction</span>
                </div>
              )}
              <div className="absolute top-md right-md flex items-center gap-sm bg-surface/90 backdrop-blur-sm rounded-xl px-md py-sm font-headline-sm text-sm text-error font-bold">
                <span className="material-symbols-outlined text-[18px]">timer</span>
                {auction.timeRemaining}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-sm">
              {auction.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === i ? "border-secondary" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Details */}
            <div className="bg-surface rounded-xl p-lg soft-shadow border border-surface-variant space-y-md">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">{auction.collection}</p>
                <h1 className="font-display-lg-mobile md:font-headline-md text-primary mt-xs">{auction.title}</h1>
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Lot Number</p>
                  <p className="font-headline-sm text-headline-sm text-primary">#{auction.lotNumber}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Reserve Status</p>
                  <span className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-on-tertiary-container text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="font-label-md text-label-md text-on-tertiary-container">Reserve Met</span>
                  </span>
                </div>
              </div>

              <div className="pt-md border-t border-surface-variant">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">About this Lot</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  An exceptionally rare example from 1968, this Rolex Cosmograph Daytona references one of the most coveted configurations.
                  The oyster case in stainless steel bears the signature push-in pump chronograph pushers and the three-register Paul Newman dial —
                  a design revered among horological collectors worldwide. Offered from a distinguished private European collection.
                  Accompanied by original box and documentation.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-md pt-md border-t border-surface-variant text-center">
                {[
                  { label: "Case Material", value: "Stainless Steel" },
                  { label: "Movement", value: "Manual Wind" },
                  { label: "Year", value: "1968" },
                ].map((spec) => (
                  <div key={spec.label} className="bg-surface-container-low rounded-lg p-sm">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{spec.label}</p>
                    <p className="font-label-md text-label-md text-on-surface mt-xs">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Bidding Panel */}
          <aside className="space-y-md">
            {/* Bid Card */}
            <div className="bg-surface rounded-2xl p-lg soft-shadow border border-surface-variant sticky top-md">
              <div className="flex items-center justify-between mb-md">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Current Bid</p>
                  <p className="font-display-lg-mobile text-[36px] font-bold text-primary leading-none">
                    ${auction.currentBid.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-label-sm text-label-sm text-error">Ends in</p>
                  <p className="font-headline-sm text-headline-sm text-error font-bold">{auction.timeRemaining}</p>
                </div>
              </div>

              {!depositOpen ? (
                <div className="space-y-sm">
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Quick Bid</p>
                  <div className="grid grid-cols-3 gap-xs">
                    {INCREMENT_BIDS.map((amt) => (
                      <button
                        key={amt}
                        className="border border-outline-variant rounded-lg py-2 font-label-sm text-sm text-on-surface hover:border-secondary hover:text-secondary transition-colors"
                      >
                        ${(amt / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                    <input
                      type="number"
                      value={customBid}
                      onChange={(e) => setCustomBid(e.target.value)}
                      placeholder="Enter custom bid"
                      className="w-full pl-8 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl font-body-md text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={() => setDepositOpen(true)}
                    className="w-full bg-secondary text-on-secondary py-md rounded-xl font-headline-sm glow-accent hover:bg-secondary-fixed-dim transition-all flex items-center justify-center gap-sm"
                  >
                    <span className="material-symbols-outlined">gavel</span>
                    Place Bid
                  </button>
                  <p className="text-center text-xs text-on-surface-variant">
                    A 10% deposit ({`$${auction.depositRequired.toLocaleString()}`}) is required to bid.
                  </p>
                </div>
              ) : (
                <div className="space-y-md">
                  <div className="p-md bg-primary-container rounded-xl border border-secondary/20">
                    <h4 className="font-headline-sm text-headline-sm text-primary mb-xs">Deposit Required</h4>
                    <p className="font-body-md text-sm text-on-primary-container">
                      A refundable deposit of <span className="font-bold">${auction.depositRequired.toLocaleString()}</span> ({auction.depositPercent}% of current bid)
                      is required to participate.
                    </p>
                    <div className="mt-md flex gap-sm">
                      <button className="flex-1 bg-secondary text-on-secondary rounded-lg py-sm font-label-md text-label-md glow-accent hover:bg-secondary-fixed-dim transition-colors">
                        Authorize Deposit
                      </button>
                      <button
                        onClick={() => setDepositOpen(false)}
                        className="border border-outline-variant rounded-lg py-sm px-md font-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Bids */}
              <div className="mt-lg pt-md border-t border-surface-variant">
                <h3 className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase tracking-wide">Recent Bids</h3>
                <div className="space-y-sm">
                  {auction.recentBids.map((bid, i) => (
                    <div key={i} className={`flex justify-between items-center p-sm rounded-lg ${i === 0 ? "bg-tertiary-fixed/20" : "bg-surface-container-lowest"}`}>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{bid.bidder}</span>
                      <div className="text-right">
                        <p className={`font-label-md text-label-md font-bold ${i === 0 ? "text-primary" : "text-on-surface-variant"}`}>
                          ${bid.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-outline">{bid.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </CollectorShell>
  );
}
