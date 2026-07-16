"use client";

import { useCallback, useEffect, useState } from "react";
import LiveBiddingPanel from "@/components/feature/LiveBiddingPanel";
import {
  ApiError,
  auctionApi,
  getToken,
  toImageSrc,
  userApi,
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [watchlistBusy, setWatchlistBusy] = useState(false);
  const [watchlistMessage, setWatchlistMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const images =
    product.imageUrls.length > 0
      ? product.imageUrls.map((imageUrl) => toImageSrc(imageUrl))
      : ["/images/auction-products/placeholder.png"];

  const showPreviousImage = useCallback(() => {
    setActiveImage((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);

  const showNextImage = useCallback(() => {
    setActiveImage((current) => (current + 1) % images.length);
  }, [images.length]);

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

  useEffect(() => {
    let cancelled = false;
    if (!getToken()) return;

    userApi
      .watchlist()
      .then((response) => {
        if (!cancelled) {
          setIsWatched(response.data.some((item) => item.productId === product.productId));
        }
      })
      .catch(() => {
        if (!cancelled) setIsWatched(false);
      });

    return () => {
      cancelled = true;
    };
  }, [product.productId]);

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, showNextImage, showPreviousImage]);

  const isActive = state.status === "ACTIVE";

  async function toggleWatchlist() {
    setWatchlistMessage(null);
    if (!getToken()) {
      setWatchlistMessage({
        kind: "error",
        text: "Bạn cần đăng nhập để thêm sản phẩm vào danh sách theo dõi.",
      });
      return;
    }

    setWatchlistBusy(true);
    try {
      if (isWatched) {
        await userApi.removeFromWatchlist(product.productId);
        setIsWatched(false);
        setWatchlistMessage({ kind: "success", text: "Đã bỏ khỏi danh sách theo dõi." });
      } else {
        await userApi.addToWatchlist(product.productId);
        setIsWatched(true);
        setWatchlistMessage({ kind: "success", text: "Đã thêm vào danh sách theo dõi." });
      }
    } catch (cause) {
      setWatchlistMessage({
        kind: "error",
        text:
          cause instanceof ApiError
            ? cause.message
            : "Không thể cập nhật danh sách theo dõi. Vui lòng thử lại.",
      });
    } finally {
      setWatchlistBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Cột trái (2/3) */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="group relative overflow-hidden rounded-3xl">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Mở ảnh sản phẩm toàn màn hình"
            className="block aspect-video w-full cursor-zoom-in bg-cover bg-center"
            style={{ backgroundImage: `url(${images[activeImage]})` }}
          />
          <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-black/65 px-3 py-1.5 text-xs text-white/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            <span className="material-symbols-outlined text-base">zoom_in</span>
            Xem toàn bộ ảnh
          </span>
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
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void toggleWatchlist()}
                disabled={watchlistBusy}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  isWatched
                    ? "border-[var(--luxora-gold)] bg-[var(--luxora-gold)]/15 text-[var(--luxora-gold-light)]"
                    : "border-white/15 bg-white/5 text-white/75 hover:border-[var(--luxora-gold)] hover:text-[var(--luxora-gold-light)]"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {isWatched ? "favorite" : "favorite_border"}
                </span>
                {isWatched ? "Đang theo dõi" : "Theo dõi"}
              </button>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                {state.totalBids} lượt bid
              </span>
            </div>
          </div>

          {watchlistMessage ? (
            <p
              className={`mt-4 rounded-lg border px-3 py-2 text-xs ${
                watchlistMessage.kind === "success"
                  ? "border-green-400/30 bg-green-500/10 text-green-200"
                  : "border-red-400/30 bg-red-500/10 text-red-200"
              }`}
            >
              {watchlistMessage.text}
            </p>
          ) : null}

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
        <LiveBiddingPanel
          state={state}
          sellerId={product.sellerId}
          onBidPlaced={refresh}
        />
      </div>

      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bộ sưu tập ảnh sản phẩm"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-5 top-5 z-10 rounded-full border border-white/15 bg-black/60 p-2 text-white/80 hover:text-white"
            aria-label="Đóng trình xem ảnh"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {images.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPreviousImage();
              }}
              className="absolute left-4 z-10 rounded-full border border-white/15 bg-black/60 p-3 text-white/80 hover:text-white"
              aria-label="Ảnh trước"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          ) : null}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeImage]}
            alt={`${product.productName} - ảnh ${activeImage + 1}`}
            className="max-h-[82vh] max-w-[88vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />

          {images.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNextImage();
              }}
              className="absolute right-4 z-10 rounded-full border border-white/15 bg-black/60 p-3 text-white/80 hover:text-white"
              aria-label="Ảnh tiếp theo"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          ) : null}

          <div className="absolute bottom-5 rounded-full bg-black/65 px-4 py-2 text-xs text-white/70">
            {activeImage + 1} / {images.length} · Dùng phím ← → để chuyển ảnh
          </div>
        </div>
      ) : null}
    </div>
  );
}
