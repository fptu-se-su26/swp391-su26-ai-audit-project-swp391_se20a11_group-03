"use client";

import { useState } from "react";
import { mockLiveAuction } from "@/lib/mock-data";

export default function BiddingPanel() {
  const lot = mockLiveAuction;
  const [depositPaid, setDepositPaid] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  return (
    <div className="sticky top-28 flex flex-col gap-sm">
      {/* Main Bidding Card */}
      <div className="glass-panel rounded-xl p-md shadow-lg border border-outline-variant/30 flex flex-col gap-4">
        {/* Header */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Lot #{lot.lotNumber} • Heritage Collection
            </span>
            <div className="flex items-center gap-1 bg-error/10 text-error px-2 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-error pulse-live" />
              <span className="font-label-sm text-label-sm font-bold">LIVE</span>
            </div>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary-container mb-1">{lot.title}</h1>
        </div>

        {/* Countdown */}
        <div className="bg-surface-container-highest p-3 rounded-lg border border-outline-variant/20 flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">timer</span>
            Time Remaining
          </span>
          <span className="font-headline-sm text-headline-sm text-error font-bold font-mono">{lot.timeRemaining}</span>
        </div>

        <hr className="border-outline-variant/20" />

        {/* Current Bid */}
        <div>
          <span className="font-label-md text-label-md text-on-surface-variant">Current Highest Bid</span>
          <div className="font-display-lg-mobile text-display-lg-mobile md:text-display-lg text-primary-container font-bold mt-1">
            ${lot.currentBid.toLocaleString()}
          </div>
          <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">Reserve Met.</div>
        </div>

        {!depositPaid ? (
          /* Deposit Required */
          <div className="bg-primary-container text-on-primary rounded-xl p-4 flex flex-col gap-3 mt-2 relative overflow-hidden shadow-md">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-container opacity-10 rounded-full blur-xl" />
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-md text-label-md font-bold text-secondary-container flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
                  Action Required
                </span>
                <span className="font-body-md text-body-md text-on-primary/80 mt-1 block">
                  Pay {lot.depositPercent}% deposit to unlock bidding for this lot.
                </span>
              </div>
              <button className="text-on-primary/60 hover:text-on-primary" title="Why is a deposit required?">
                <span className="material-symbols-outlined">info</span>
              </button>
            </div>
            <button
              onClick={() => setDepositPaid(true)}
              className="w-full bg-secondary-container hover:bg-secondary-fixed transition-colors text-primary-container font-label-md text-label-md font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              Pay ${lot.depositRequired.toLocaleString()} Deposit to Join
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        ) : (
          /* Active Bidding */
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface-variant">Place a Bid</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-surface-container py-2 rounded-lg font-label-md text-label-md text-on-surface border border-outline-variant/30 hover:border-secondary transition-colors">
                + $10,000
              </button>
              <button className="flex-1 bg-surface-container py-2 rounded-lg font-label-md text-label-md text-on-surface border border-outline-variant/30 hover:border-secondary transition-colors">
                + $50,000
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter custom amount..."
                className="flex-grow bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none"
              />
              <button className="bg-secondary text-on-secondary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-secondary-fixed-dim transition-colors glow-accent">
                Bid
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Bids */}
      <div className="bg-surface rounded-xl p-4 border border-outline-variant/20 shadow-sm">
        <h4 className="font-label-md text-label-md text-on-surface font-bold mb-3">Recent Activity</h4>
        <div className="space-y-2">
          {lot.recentBids.map((bid, i) => (
            <div key={i} className={`flex justify-between items-center text-sm ${i > 0 ? `opacity-${100 - i * 30}` : ""}`}>
              <span className={`font-body-md text-body-md text-on-surface ${i === 0 ? "font-semibold" : ""}`}>
                ${bid.amount.toLocaleString()}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {bid.bidder} • {bid.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
