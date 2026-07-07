"use client";

import { useState } from "react";
import BiddingPanel from "@/components/feature/BiddingPanel";
import { mockLiveAuction } from "@/lib/mock-data";

export default function AuctionDetailClient() {
  const auction = mockLiveAuction;
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Cột trái (2/3) */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="relative overflow-hidden rounded-3xl">
          <div
            className="aspect-video w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${auction.images[activeImage]})` }}
          />
          <span className="pulse-live absolute left-4 top-4 rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white">
            Đang đấu giá trực tiếp
          </span>
          <span className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur">
            {auction.timeRemaining}
          </span>
        </div>

        <div className="flex gap-3">
          {auction.images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActiveImage(i)}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-cover bg-center transition-colors ${
                activeImage === i
                  ? "border-[var(--luxora-gold)]"
                  : "border-transparent opacity-60"
              }`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-white/40">
                {auction.lotNumber} · {auction.collection}
              </p>
              <h1 className="font-display-lg mt-1 text-2xl">
                {auction.title}
              </h1>
            </div>
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                auction.reserveMet
                  ? "bg-green-500/10 text-green-300"
                  : "bg-yellow-500/10 text-yellow-300"
              }`}
            >
              {auction.reserveMet ? "Đã đạt giá sàn" : "Chưa đạt giá sàn"}
            </span>
          </div>

          <h2 className="mt-6 text-sm font-semibold text-white/70">
            Thông tin lot này
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            {auction.description}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {auction.specs.map((spec) => (
              <div
                key={spec.label}
                className="rounded-xl border border-white/10 p-3"
              >
                <p className="text-[10px] text-white/40">{spec.label}</p>
                <p className="mt-1 text-sm font-semibold">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cột phải: Bidding Panel */}
      <div className="lg:col-span-1">
        <BiddingPanel />
      </div>
    </div>
  );
}
