"use client";

import { useRef } from "react";
import Link from "next/link";
import { mockStorefrontLots } from "@/lib/mock-data";

interface LotCardProps {
  id: number;
  lotNumber: string;
  title: string;
  currentBid: number;
  timeLeft: string;
  isLive: boolean;
  image: string;
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
        <img src={image} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-md flex flex-col">
        <h4 className="font-headline-sm text-headline-sm text-primary font-bold mb-2 line-clamp-2">{title}</h4>
        <div className="mt-auto pt-4 border-t border-outline-variant/30 flex justify-between items-end">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase block mb-1">Current Bid</span>
            <span className="font-headline-md text-headline-md text-primary font-bold">${currentBid.toLocaleString()}</span>
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
  items?: LotCardProps[];
}

export default function Carousel({ title, subtitle, items = mockStorefrontLots }: CarouselProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const amount = ref.current.offsetWidth * 0.8;
    ref.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="px-margin-mobile md:px-margin-desktop py-xl max-w-7xl mx-auto w-full overflow-hidden">
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h3 className="font-headline-md text-headline-md text-primary font-bold">{title}</h3>
          {subtitle && <p className="font-body-md text-body-md text-on-surface-variant mt-1">{subtitle}</p>}
        </div>
        <a href="#" className="text-primary font-bold font-label-md hover:text-secondary transition-colors">
          View More &gt;
        </a>
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
          {items.map((item) => (
            <LotCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
