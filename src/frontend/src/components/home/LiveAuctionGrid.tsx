"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AuctionCard from "./AuctionCard";
import { LuxuryLot } from "./types";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";
import SectionHeader from "@/components/ui/SectionHeader";

export default function LiveAuctionGrid({ lots, loading = false }: { lots: LuxuryLot[]; loading?: boolean }) {
  const copy = useLuxuryHomeCopy();
  const [activeTab, setActiveTab] = useState(0);
  const [sort, setSort] = useState("ending");
  const categoryKeys = ["", "watch", "art", "jewel", "car", "collect"];
  const filtered = useMemo(() => activeTab === 0 ? lots : lots.filter((lot) => lot.category.toLowerCase().includes(categoryKeys[activeTab])), [activeTab, lots]);

  return (
    <section id="live-lots" className="px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <SectionHeader
          eyebrow={copy.curated}
          title={copy.liveTitle}
          description={copy.liveDesc}
          action={
            <Link href="/live" className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[.13em] text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d6a84f]/50 hover:text-[#9a6b13]">
              {copy.explore} <span className="material-symbols-outlined text-[17px]">north_east</span>
            </Link>
          }
        />

        <div className="mt-9 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white/75 p-3 shadow-[0_14px_45px_rgba(15,23,42,.06)] backdrop-blur xl:flex-row xl:items-center xl:justify-between">
          <div className="no-scrollbar flex gap-1 overflow-x-auto pb-1 xl:pb-0">{copy.tabs.map((tab, index) => <button key={tab} onClick={() => setActiveTab(index)} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition ${activeTab === index ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-[#fff8e6] hover:text-[#9a6b13]"}`}>{tab}</button>)}</div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-[#d6a84f]/50 hover:text-[#9a6b13]"><span className="material-symbols-outlined text-[17px]">tune</span> {copy.price}</button>
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm"><span className="material-symbols-outlined text-[17px]">sort</span><select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent outline-none"><option value="ending">{copy.ending}</option><option value="new">{copy.newly}</option><option value="high">{copy.highest}</option></select></label>
          </div>
        </div>

        {loading ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[0,1,2,3].map((i) => <div key={i} className="skeleton-shimmer h-[470px] rounded-[24px]" />)}</div> : filtered.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((lot) => <AuctionCard key={lot.id} lot={lot} />)}</div> : <div className="mt-8 rounded-[24px] border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm"><span className="material-symbols-outlined text-4xl text-[#9a6b13]">inventory_2</span><h3 className="mt-3 font-display-lg text-xl font-semibold text-slate-950">{copy.noLots}</h3><p className="mt-2 text-sm text-slate-500">{copy.noLotsDesc}</p></div>}
      </div>
    </section>
  );
}
