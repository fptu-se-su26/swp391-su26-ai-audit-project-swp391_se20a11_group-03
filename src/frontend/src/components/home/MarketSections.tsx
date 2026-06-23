"use client";
import Link from "next/link";
import { LuxuryLot } from "./types";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function MarketSections({ upcoming, results }: { upcoming: LuxuryLot[]; results: LuxuryLot[] }) {
  const copy = useLuxuryHomeCopy();
  return (
    <section className="bg-[#fffdf8] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-16 xl:grid-cols-2">
        <div>
          <div className="mb-7 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#9a7429]">{copy.upcomingEyebrow}</p><h2 className="mt-2 font-display-lg text-3xl font-semibold tracking-[-.04em] text-[#071626]">{copy.upcoming}</h2></div><Link href="/upcoming" className="text-xs font-bold text-[#87651f]">{copy.calendar} →</Link></div>
          <div className="grid gap-4">{upcoming.slice(0, 3).map((lot, index) => <Link href={`/auctions/${lot.id}`} key={lot.id} className="group grid grid-cols-[104px_1fr_auto] items-center gap-4 rounded-2xl border border-[#e3ddd2] bg-white p-3 transition hover:border-[#c4a75f] hover:shadow-lg"><img src={lot.image} alt="" className="h-24 w-24 rounded-xl object-cover"/><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#9a7429]">{index === 0 ? "Tomorrow · 7:00 PM" : `${index + 2} days · 8:30 PM`}</p><h3 className="mt-2 line-clamp-2 font-display-lg text-sm font-semibold text-[#0b1c2e]">{lot.title}</h3><p className="mt-2 text-xs text-[#747b83]">Estimate {money.format(lot.estimateLow)}–{money.format(lot.estimateHigh)}</p></div><span className="material-symbols-outlined mr-2 text-[#9a7429] transition group-hover:translate-x-1">arrow_forward</span></Link>)}</div>
        </div>
        <div>
          <div className="mb-7 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#9a7429]">{copy.resultsEyebrow}</p><h2 className="mt-2 font-display-lg text-3xl font-semibold tracking-[-.04em] text-[#071626]">{copy.results}</h2></div><Link href="/results" className="text-xs font-bold text-[#87651f]">{copy.allResults} →</Link></div>
          <div className="overflow-hidden rounded-[22px] border border-[#e3ddd2] bg-[#071626] text-white"><div className="grid grid-cols-2 gap-px bg-white/10">{results.slice(0, 4).map((lot) => <Link href={`/auctions/${lot.id}`} key={lot.id} className="group bg-[#071626] p-5 transition hover:bg-[#0c2339]"><div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[.15em] text-[#d8b866]">Lot {lot.lotNumber}</span><span className="material-symbols-outlined text-[16px] text-white/40 group-hover:text-[#d8b866]">north_east</span></div><h3 className="mt-4 line-clamp-2 min-h-10 font-display-lg text-sm font-semibold leading-5">{lot.title}</h3><p className="mt-6 text-[9px] uppercase tracking-[.12em] text-white/45">Sold for</p><p className="mt-1 text-lg font-semibold text-[#e5c574]">{money.format(lot.currentBid)}</p></Link>)}</div></div>
        </div>
      </div>
    </section>
  );
}
