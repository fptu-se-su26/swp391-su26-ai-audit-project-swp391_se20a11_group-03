"use client";

import Link from "next/link";
import { displayFont } from "./theme";
import { LuxuryLot } from "@/components/home/types";
import { formatVnd } from "@/lib/money";
import { useTranslations } from "@/i18n/I18nProvider";

export function UpcomingCard({ lot }: { lot: LuxuryLot }) {
  const t = useTranslations("luxe");
  return (
    <article className="group overflow-hidden rounded-md border border-white/10 bg-[#090908]">
      <div className="relative h-64 overflow-hidden">
        <img src={lot.image} alt={lot.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <span className="absolute left-5 top-5 rounded bg-[#b88a3a]/80 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
          {t("badgeUpcoming")}
        </span>
      </div>
      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d4aa61]">{lot.category}</p>
        <h3 className={`${displayFont} mt-2 line-clamp-2 text-2xl font-medium text-white`}>{lot.title}</h3>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#9d948a]">{t("startingPrice")}</p>
            <p className="mt-1 text-lg font-semibold text-[#efcf88]">{formatVnd(lot.currentBid)}</p>
          </div>
          <Link href={`/auctions/${lot.id}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d4aa61] text-[#d4aa61]" aria-label={t("viewLot", { title: lot.title })}>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function FeaturedCard({ lot, live }: { lot: LuxuryLot; live: boolean }) {
  const t = useTranslations("luxe");
  return (
    <article className="group overflow-hidden rounded-md border border-white/10 bg-[#0e0d0b]">
      <div className="relative h-72 overflow-hidden">
        <img src={lot.image} alt={lot.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {live && (
          <span className="absolute left-5 top-5 rounded bg-red-600/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
            Live
          </span>
        )}
      </div>
      <div className="p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d4aa61]">{lot.category}</p>
        <h3 className={`${displayFont} mt-3 min-h-16 line-clamp-2 text-2xl font-medium leading-tight text-white`}>{lot.title}</h3>
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#9d948a]">{live ? t("currentPrice") : t("startingPrice")}</p>
            <p className="mt-1 text-lg font-semibold text-[#efcf88]">{formatVnd(lot.currentBid)}</p>
            <p className="mt-1 text-xs text-[#756d64]">{lot.timeLeft}</p>
          </div>
          <Link href={`/auctions/${lot.id}`} className="grid h-11 w-11 place-items-center rounded-full bg-[#d4aa61] text-[#100d08]" aria-label={t("bidLot", { title: lot.title })}>
            <span className="material-symbols-outlined">gavel</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
