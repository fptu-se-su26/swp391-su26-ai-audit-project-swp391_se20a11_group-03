"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Countdown from "@/components/home/Countdown";
import type { LiveAuctionItem } from "@/lib/home-data";

type LiveAuctionGridProps = {
  items: LiveAuctionItem[];
};

export default function LiveAuctionGrid({ items }: LiveAuctionGridProps) {
  const t = useTranslations("liveGrid");
  const [selectedItem, setSelectedItem] = useState<LiveAuctionItem | null>(null);

  useEffect(() => {
    if (!selectedItem) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedItem(null); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handleKeyDown); };
  }, [selectedItem]);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {items.map((item) => (
          <article
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-lg border border-[#d7aa63]/35 bg-[#080808] transition-colors hover:border-[#f0c982]"
          >
            <button
              type="button"
              onClick={() => setSelectedItem(item)}
              className="theme-dark-content relative aspect-[4/3] w-full overflow-hidden bg-black text-left sm:aspect-square"
              aria-label={`${t("zoomIn")} ${item.title}`}
            >
              <Image
                src={item.imageSrc}
                alt={item.title}
                fill
                sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                LIVE
              </span>
              <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur">
                <span className="material-symbols-outlined text-lg">favorite</span>
              </span>
            </button>

            <div className="flex flex-1 flex-col gap-3 p-4">
              <button type="button" onClick={() => setSelectedItem(item)} className="text-left">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-0.5 text-xs text-white/55">{item.subtitle}</p>
              </button>

              <div>
                <p className="text-[10px] tracking-wider text-white/45">{t("currentPrice")}</p>
                <p className="text-xl font-bold text-white">{item.currentPrice}</p>
                <p className="text-[11px] text-white/45">
                  {t("startingPrice", { price: item.estimatedPrice })}
                </p>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3 border-t border-white/12 pt-3 text-xs">
                <div>
                  <Countdown endsAt={item.endsAt} />
                  <p className="mt-1 text-white/45">{t("ends")}</p>
                </div>
                <div>
                  <p className="font-semibold text-white">{item.bidCount}</p>
                  <p className="mt-1 text-white/45">{t("bids")}</p>
                </div>
              </div>

              <Link
                href={`/auctions/${item.id}`}
                className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d7aa63]/50 px-4 py-2.5 text-xs font-semibold tracking-wider text-white transition-colors hover:bg-[#f0c982] hover:text-black"
              >
                {t("bidNow")}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${t("zoomIn")} ${selectedItem.title}`}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="theme-dark-content theme-dark-surface relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#d7aa63]/45 bg-[#050505] shadow-[0_30px_120px_rgba(240,201,130,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition-colors hover:border-[#f0c982] hover:text-[#f0c982]"
              aria-label={t("closeZoom")}
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="relative min-h-[56vh] bg-black sm:min-h-[68vh]">
              <Image
                src={selectedItem.imageSrc}
                alt={selectedItem.title}
                fill
                priority
                sizes="(min-width: 1024px) 900px, 100vw"
                className="object-contain p-6 sm:p-10"
              />
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#f0c982]">
                  {t("selectedItem")}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">{selectedItem.title}</h3>
                <p className="mt-1 text-sm text-white/55">{selectedItem.subtitle}</p>
              </div>
              <Link
                href={`/auctions/${selectedItem.id}`}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-[#f0c982] px-6 py-3 text-xs font-bold tracking-wider text-black transition-colors hover:bg-[#f4d79b]"
              >
                {t("bidNow")}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
