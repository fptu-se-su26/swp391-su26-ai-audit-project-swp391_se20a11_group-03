"use client";

import { useState } from "react";
import { mockLiveAuction } from "@/lib/mock-data";

export default function BiddingPanel() {
  const auction = mockLiveAuction;
  const [currentBid, setCurrentBid] = useState(auction.currentBid);
  const [customAmount, setCustomAmount] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);

  function placeBid(amount: number) {
    setCurrentBid(amount);
    setDepositOpen(true);
  }

  function handlePlaceBidClick() {
    const parsed = Number(customAmount);
    if (customAmount && !Number.isNaN(parsed) && parsed > currentBid) {
      placeBid(parsed);
    } else {
      setDepositOpen(true);
    }
  }

  return (
    <div className="glass-panel sticky top-24 flex flex-col gap-6 rounded-2xl p-6">
      <div>
        <p className="text-xs text-white/50">Giá hiện tại</p>
        <p className="font-display-lg mt-1 text-3xl text-[var(--luxora-gold-light)]">
          ${currentBid.toLocaleString("en-US")}
        </p>
        <p className="mt-1 text-xs text-white/40">
          Kết thúc sau {auction.timeRemaining}
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-white/50">
          Đặt giá nhanh
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[5000, 10000, 25000].map((increment) => (
            <button
              key={increment}
              type="button"
              onClick={() => placeBid(currentBid + increment)}
              className="rounded-xl border border-white/10 py-2 text-xs font-semibold text-white/80 hover:border-[var(--luxora-gold)] hover:text-[var(--luxora-gold-light)]"
            >
              +${increment / 1000}k
            </button>
          ))}
        </div>

        <input
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder={`Tối thiểu $${(currentBid + 1000).toLocaleString("en-US")}`}
          className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
        />

        <button
          type="button"
          onClick={handlePlaceBidClick}
          className="gradient-cta mt-3 w-full rounded-full py-3 text-sm font-semibold text-black"
        >
          Đặt giá
        </button>
      </div>

      {depositOpen && !depositPaid && (
        <div className="rounded-xl border border-[var(--luxora-gold)]/40 bg-[var(--luxora-gold)]/5 p-4">
          <p className="text-sm font-semibold text-[var(--luxora-gold-light)]">
            Yêu cầu đặt cọc
          </p>
          <p className="mt-1 text-xs text-white/60">
            Đặt cọc 10% giá trị lot để xác nhận giá thầu: $
            {auction.depositRequired.toLocaleString("en-US")}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setDepositPaid(true);
                setDepositOpen(false);
              }}
              className="flex-1 rounded-full bg-[var(--luxora-gold)] py-2.5 text-xs font-semibold text-black"
            >
              Xác nhận đặt cọc
            </button>
            <button
              type="button"
              onClick={() => setDepositOpen(false)}
              className="flex-1 rounded-full border border-white/15 py-2.5 text-xs font-semibold text-white/70"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {depositPaid && (
        <p className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-xs text-green-300">
          <span className="material-symbols-outlined text-base">
            check_circle
          </span>
          Đã xác nhận đặt cọc cho giá thầu này.
        </p>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-white/50">
          Lượt đấu giá gần đây
        </p>
        <ul className="flex flex-col gap-2">
          {auction.recentBids.map((bid, i) => (
            <li
              key={i}
              className="flex items-center justify-between text-xs text-white/60"
            >
              <span>{bid.bidder}</span>
              <span className="font-semibold text-white">
                ${bid.amount.toLocaleString("en-US")}
              </span>
              <span className="text-white/30">{bid.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
