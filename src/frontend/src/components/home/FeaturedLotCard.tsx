import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { LuxuryLot } from "./types";
import CountdownBadge from "@/components/ui/CountdownBadge";
import StatusBadge from "@/components/ui/StatusBadge";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function FeaturedLotCard({ lot }: { lot: LuxuryLot }) {
  return (
    <article className="animate-fade-up group relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.08] p-3 shadow-[0_30px_80px_rgba(0,0,0,.38)] backdrop-blur-xl transition duration-500 hover:-translate-y-1.5 hover:border-[#d6a84f]/60">
      <div className="relative aspect-[16/11] overflow-hidden rounded-[20px] bg-slate-900">
        <Image
          src={lot.image}
          alt={lot.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 52vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/28 to-black/20" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <StatusBadge status="ACTIVE" label="Live auction" className="bg-red-50 text-red-700" />
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-slate-950/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-white backdrop-blur"><span className="material-symbols-outlined text-[14px] text-[#d8bd75]">verified</span> Authenticated</span>
        </div>
        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 text-white">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.2em] text-[#d8bd75]">Lot {lot.lotNumber}</p>
            <h2 className="max-w-[420px] font-display-lg text-xl font-semibold leading-tight sm:text-2xl">{lot.title}</h2>
          </div>
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur transition hover:bg-white hover:text-slate-950" aria-label="Save lot"><span className="material-symbols-outlined text-[20px]">favorite</span></button>
        </div>
      </div>

      <div className="grid gap-4 px-2 pb-2 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-[10px] uppercase tracking-[.14em] text-white/50">Current bid</p><p className="mt-1 text-xl font-semibold text-white">{money.format(lot.currentBid)}</p><p className="mt-1 text-xs text-white/50">{lot.bids} bids</p></div>
          <div><p className="text-[10px] uppercase tracking-[.14em] text-white/50">Ending in</p><div className="mt-1"><CountdownBadge label={lot.timeLeft} urgent /></div><p className="mt-1 text-xs text-white/50">Today, 9:30 PM</p></div>
        </div>
        <div className="flex gap-2">
          <Link href={`/auctions/${lot.id}`} className="rounded-full bg-[#9a6b13] px-5 py-3 text-center text-xs font-bold uppercase tracking-[.1em] text-white transition hover:-translate-y-0.5 hover:bg-[#b9841a]">Place bid</Link>
          <Link href={`/auctions/${lot.id}`} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition hover:bg-white/10" aria-label="View details"><span className="material-symbols-outlined text-[20px]">arrow_outward</span></Link>
        </div>
      </div>
    </article>
  );
}

export default memo(FeaturedLotCard);
