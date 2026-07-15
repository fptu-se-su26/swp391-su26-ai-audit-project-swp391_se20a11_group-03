"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { searchProducts, ProductSummary } from "@/lib/services/productService";

interface LotCardProps {
  id: number;
  lotNumber: string;
  title: string;
  currentBid: number;
  timeLeft: string;
  isLive: boolean;
  image: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function calculateTimeLeft(endTime: string | null): string {
  if (!endTime) return "N/A";
  const end = new Date(endTime).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function LotCard({ id, lotNumber, title, currentBid, timeLeft, isLive, image }: LotCardProps) {
  return (
    <Link
      href={`/auctions/${id}`}
      className="min-w-[calc(100%-16px)] md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] snap-start bg-surface rounded-xl overflow-hidden soft-shadow border border-outline-variant/50 relative cursor-pointer hover:border-primary transition-colors flex-shrink-0"
    >
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {isLive && (
          <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-1 rounded-sm font-label-sm text-label-sm flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-error animate-ping" />
            Live
          </span>
        )}
        <span className="bg-surface-container/80 backdrop-blur-sm text-on-surface px-2 py-1 rounded-sm font-label-sm text-label-sm">
          Lot #{lotNumber}
        </span>
      </div>
      <div className="h-64 overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-variant">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant">image</span>
          </div>
        )}
      </div>
      <div className="p-md flex flex-col">
        <h4 className="font-headline-sm text-headline-sm text-primary font-bold mb-2 line-clamp-2">{title}</h4>
        <div className="mt-auto pt-4 border-t border-outline-variant/30 flex justify-between items-end">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-1">Current Bid</span>
            <span className="font-headline-md text-headline-md text-primary font-bold">
              {currentBid > 0 ? formatCurrency(currentBid) : "-"}
            </span>
          </div>
          <div className="text-right text-error font-bold font-label-md">{timeLeft}</div>
        </div>
      </div>
    </Link>
  );
}

interface CarouselProps {
  title: string;
  subtitle?: string;
  auctionStatus?: string;
  items?: LotCardProps[];
}

export default function Carousel({ title, subtitle, auctionStatus, items }: CarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await searchProducts({
          size: 10,
          status: auctionStatus === "UPCOMING" ? "ACTIVE" : undefined,
          auctionStatus: auctionStatus,
        });
        setProducts(response.content);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (items === undefined) {
      fetchProducts();
    }
  }, [items, auctionStatus]);

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const amount = ref.current.offsetWidth * 0.8;
    ref.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const displayItems: LotCardProps[] = items || products.map((p) => ({
    id: p.productId,
    lotNumber: String(p.productId),
    title: p.productName,
    currentBid: p.currentBid || p.startingPrice,
    timeLeft: calculateTimeLeft(p.auctionEndTime),
    isLive: p.auctionStatus === "ACTIVE",
    image: p.imageUrl || "",
  }));

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-xl max-w-7xl mx-auto w-full overflow-hidden">
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h3 className="font-headline-md text-headline-md text-primary font-bold">{title}</h3>
          {subtitle && <p className="font-body-md text-body-md text-on-surface-variant mt-1">{subtitle}</p>}
        </div>
        {auctionStatus && (
          <Link
            href={auctionStatus === "ACTIVE" ? "/" : auctionStatus === "UPCOMING" ? "/upcoming" : "/results"}
            className="text-primary font-bold font-label-md hover:text-secondary transition-colors"
          >
            View More &gt;
          </Link>
        )}
      </div>

      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute -left-12 top-1/2 -translate-y-1/2 z-20 bg-surface/80 hover:bg-white text-primary p-2 rounded-full shadow-lg border border-outline-variant hidden lg:flex items-center justify-center"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute -right-12 top-1/2 -translate-y-1/2 z-20 bg-surface/80 hover:bg-white text-primary p-2 rounded-full shadow-lg border border-outline-variant hidden lg:flex items-center justify-center"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>

        <div
          ref={ref}
          className="flex gap-gutter overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
        >
          {loading ? (
            <div className="min-w-full flex items-center justify-center h-64">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
          ) : displayItems.length > 0 ? (
            displayItems.map((item) => <LotCard key={item.id} {...item} />)
          ) : (
            <div className="min-w-full flex items-center justify-center h-64">
              <p className="text-on-surface-variant">No items available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
