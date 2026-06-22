import Link from "next/link";
import { LuxuryLot } from "./types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function FeaturedLotCard({ lot }: { lot: LuxuryLot }) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.08] p-3 shadow-[0_30px_80px_rgba(0,0,0,.38)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-[#dfc076]/60">
      <div className="relative overflow-hidden rounded-[20px] bg-[#0c1d30]">
        <img src={lot.image} alt={lot.title} className="aspect-[16/11] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06111f]/90 via-transparent to-black/10" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#a9342f] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-white"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live auction</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-[#071626]/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.12em] text-white backdrop-blur"><span className="material-symbols-outlined text-[14px] text-[#e5c576]">verified</span> Authenticated</span>
        </div>
        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 text-white">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.2em] text-[#e5c576]">Lot {lot.lotNumber}</p>
            <h2 className="max-w-[420px] font-display-lg text-xl font-semibold leading-tight sm:text-2xl">{lot.title}</h2>
          </div>
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur transition hover:bg-white hover:text-[#071626]" aria-label="Save lot"><span className="material-symbols-outlined text-[20px]">favorite</span></button>
        </div>
      </div>

      <div className="grid gap-4 px-2 pb-2 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-[10px] uppercase tracking-[.14em] text-white/50">Current bid</p><p className="mt-1 text-xl font-semibold text-white">{money.format(lot.currentBid)}</p><p className="mt-1 text-xs text-white/50">{lot.bids} bids</p></div>
          <div><p className="text-[10px] uppercase tracking-[.14em] text-white/50">Ending in</p><p className="mt-1 font-mono text-xl font-semibold tracking-tight text-[#e9ca80]">{lot.timeLeft}</p><p className="mt-1 text-xs text-white/50">Today, 9:30 PM</p></div>
        </div>
        <div className="flex gap-2">
          <Link href={`/auctions/${lot.id}`} className="rounded-full bg-[#e2c171] px-5 py-3 text-center text-xs font-bold uppercase tracking-[.1em] text-[#071626] transition hover:bg-[#f0d994]">Place bid</Link>
          <Link href={`/auctions/${lot.id}`} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition hover:bg-white/10" aria-label="View details"><span className="material-symbols-outlined text-[20px]">arrow_outward</span></Link>
        </div>
      </div>
    </article>
  );
}
