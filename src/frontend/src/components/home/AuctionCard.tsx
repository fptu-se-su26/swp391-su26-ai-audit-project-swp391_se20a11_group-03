import Link from "next/link";
import { LuxuryLot } from "./types";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function AuctionCard({ lot }: { lot: LuxuryLot }) {
  return (
    <article className="group overflow-hidden rounded-[22px] border border-[#ded8cc] bg-white shadow-[0_8px_30px_rgba(18,31,44,.06)] transition duration-500 hover:-translate-y-1.5 hover:border-[#c6a75c] hover:shadow-[0_20px_48px_rgba(18,31,44,.13)]">
      <div className="relative overflow-hidden bg-[#ece8df]">
        <img src={lot.image} alt={lot.title} className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#071626]/90 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-white backdrop-blur"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e14b42]" /> Live</span>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#273648] shadow-sm backdrop-blur transition hover:bg-[#071626] hover:text-white" aria-label={`Save ${lot.title}`}><span className="material-symbols-outlined text-[19px]">favorite</span></button>
        </div>
        {lot.verified && <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-[#315f51] backdrop-blur"><span className="material-symbols-outlined text-[14px]">verified</span> Verified</span>}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.16em] text-[#9a7429]"><span>{lot.category}</span><span className="text-[#8b8d8e]">Lot {lot.lotNumber}</span></div>
        <h3 className="mt-3 min-h-[48px] font-display-lg text-[17px] font-semibold leading-6 tracking-[-.02em] text-[#0b1c2e]">{lot.title}</h3>
        <div className="mt-5 grid grid-cols-2 border-y border-[#ece7de] py-4">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#8a8d91]">Current bid</p><p className="mt-1 text-base font-bold text-[#071626]">{money.format(lot.currentBid)}</p><p className="mt-1 text-[11px] text-[#777d84]">{lot.bids} bids</p></div>
          <div className="border-l border-[#ece7de] pl-4"><p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#8a8d91]">Ends in</p><p className="mt-1 font-mono text-base font-bold text-[#a3332e]">{lot.timeLeft}</p><p className="mt-1 text-[11px] text-[#777d84]">Ending today</p></div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[10px] leading-4 text-[#777d84]">Estimate<br/><span className="font-semibold text-[#44505d]">{money.format(lot.estimateLow)}–{money.format(lot.estimateHigh)}</span></p>
          <Link href={`/auctions/${lot.id}`} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[.1em] text-[#8c681f] transition group-hover:text-[#071626]">View lot <span className="material-symbols-outlined text-[17px]">arrow_forward</span></Link>
        </div>
      </div>
    </article>
  );
}
