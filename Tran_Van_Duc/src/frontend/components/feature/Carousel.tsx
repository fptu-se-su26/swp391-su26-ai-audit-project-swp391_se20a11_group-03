import Link from "next/link";
import type { StorefrontLot } from "@/lib/mock-data";

type CarouselProps = {
  title: string;
  subtitle?: string;
  items?: StorefrontLot[];
};

export default function Carousel({ title, subtitle, items = [] }: CarouselProps) {
  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="font-headline-md text-xl">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-white/50">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/auctions/${item.id}`}
            className="glass-card flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl"
          >
            <div
              className="relative aspect-square w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${item.image})` }}
            >
              {item.isLive && (
                <span className="pulse-live absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white">
                  LIVE
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 p-4">
              <span className="text-[10px] tracking-wider text-[var(--luxora-gold)]">
                {item.lotNumber}
              </span>
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="mt-1 text-base font-bold text-[var(--luxora-gold-light)]">
                ${item.currentBid.toLocaleString("en-US")}
              </p>
              <p className="text-[11px] text-white/40">
                Còn lại {item.timeLeft}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
