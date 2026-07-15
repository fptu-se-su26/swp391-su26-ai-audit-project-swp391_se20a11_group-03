"use client";

import { useCallback, useEffect, useState } from "react";
import LiveBiddingPanel from "@/components/feature/LiveBiddingPanel";
import {
  auctionApi,
  type AuctionState,
  type BidRecord,
  type ProductDetail,
} from "@/lib/api";

type AuctionDetailClientProps = {
  initialState: AuctionState;
  product: ProductDetail;
  initialBids: BidRecord[];
};

const VND = new Intl.NumberFormat("vi-VN");

export default function AuctionDetailClient({
  initialState,
  product,
  initialBids,
}: AuctionDetailClientProps) {
  const [state, setState] = useState(initialState);
  const [bids, setBids] = useState(initialBids);
  const [activeImage, setActiveImage] = useState(0);

  const images =
    product.imageUrls.length > 0
      ? product.imageUrls
      : ["/images/auction-products/placeholder.png"];

  const refresh = useCallback(async () => {
    try {
      const [nextState, nextBids] = await Promise.all([
        auctionApi.state(state.auctionId),
        auctionApi.bids(state.auctionId),
      ]);
      setState(nextState);
      setBids(nextBids);
    } catch {
      // giữ dữ liệu cũ nếu 1 lần poll lỗi
    }
  }, [state.auctionId]);

  useEffect(() => {
    if (state.status !== "ACTIVE") return;
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [refresh, state.status]);

  const isActive = state.status === "ACTIVE";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Cột trái (2/3) */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="relative overflow-hidden rounded-3xl">
          <div
            className="aspect-video w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${images[activeImage]})` }}
          />
          {isActive ? (
            <span className="pulse-live absolute left-4 top-4 rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white">
              Đang đấu giá trực tiếp
            </span>
          ) : (
            <span className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              {state.status === "UPCOMING" ? "Sắp diễn ra" : "Đã kết thúc"}
            </span>
          )}
        </div>

        {images.length > 1 ? (
          <div className="flex gap-3">
            {images.map((img, i) => (
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
        ) : null}

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-white/40">
                LOT #{product.productId} · {product.categoryName ?? "Đấu giá"}
              </p>
              <h1 className="font-display-lg mt-1 text-2xl">
                {product.productName}
              </h1>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
              {state.totalBids} lượt bid
            </span>
          </div>

          <h2 className="mt-6 text-sm font-semibold text-white/70">
            Thông tin lot này
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            {product.description ?? "Chưa có mô tả cho sản phẩm này."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 p-3">
              <p className="text-[10px] text-white/40">Giá khởi điểm</p>
              <p className="mt-1 text-sm font-semibold">
                {VND.format(state.startingPrice)} ₫
              </p>
            </div>
            <div className="rounded-xl border border-white/10 p-3">
              <p className="text-[10px] text-white/40">Bước giá</p>
              <p className="mt-1 text-sm font-semibold">
                {VND.format(state.bidStep)} ₫
              </p>
            </div>
            <div className="rounded-xl border border-white/10 p-3">
              <p className="text-[10px] text-white/40">Chế độ</p>
              <p className="mt-1 text-sm font-semibold">
                {state.auctionMode === "LIVE" ? "Live" : "Timed"}
              </p>
            </div>
          </div>

          {bids.length > 0 ? (
            <>
              <h2 className="mt-6 text-sm font-semibold text-white/70">
                Lịch sử đấu giá
              </h2>
              <ul className="mt-2 divide-y divide-white/8">
                {bids.slice(0, 8).map((bid) => (
                  <li
                    key={bid.bidId}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="text-white/60">
                      {bid.username ?? "Người tham gia ẩn danh"}
                    </span>
                    <span className="font-semibold text-[var(--luxora-gold-light)]">
                      {VND.format(bid.bidAmount)} ₫
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      {/* Cột phải: Bidding Panel */}
      <div className="lg:col-span-1">
        <LiveBiddingPanel state={state} onBidPlaced={refresh} />
      </div>
    </div>
  );
}
