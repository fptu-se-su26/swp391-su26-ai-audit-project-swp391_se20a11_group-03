"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AuctionCard from "./AuctionCard";
import { LuxuryLot } from "./types";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";

export default function LiveAuctionGrid({ lots, loading = false }: { lots: LuxuryLot[]; loading?: boolean }) {
  const copy = useLuxuryHomeCopy();
  const [activeTab, setActiveTab] = useState(0);
  const [sort, setSort] = useState("ending");
  const categoryKeys = ["", "watch", "art", "jewel", "car", "collect"];
  const filtered = useMemo(() => activeTab === 0 ? lots : lots.filter((lot) => lot.category.toLowerCase().includes(categoryKeys[activeTab])), [activeTab, lots]);

  return (
    <section id="live-lots" className="bg-[#f7f4ed] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.24em] text-[#9a7429]">{copy.curated}</p><h2 className="font-display-lg text-3xl font-semibold tracking-[-.04em] text-[#071626] sm:text-4xl">{copy.liveTitle}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#69727c]">{copy.liveDesc}</p></div>
          <Link href="/live" className="inline-flex w-fit items-center gap-2 border-b border-[#9a7429] pb-1 text-xs font-bold uppercase tracking-[.13em] text-[#80601e]">{copy.explore} <span className="material-symbols-outlined text-[17px]">north_east</span></Link>
        </div>

        <div className="mt-9 flex flex-col gap-4 border-y border-[#ded7ca] py-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="no-scrollbar flex gap-1 overflow-x-auto pb-1 xl:pb-0">{copy.tabs.map((tab, index) => <button key={tab} onClick={() => setActiveTab(index)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${activeTab === index ? "bg-[#071626] text-white shadow-sm" : "text-[#59636e] hover:bg-white hover:text-[#071626]"}`}>{tab}</button>)}</div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-full border border-[#d8d0c2] bg-white px-4 py-2 text-xs font-semibold text-[#44505d]"><span className="material-symbols-outlined text-[17px]">tune</span> {copy.price}</button>
            <label className="inline-flex items-center gap-2 rounded-full border border-[#d8d0c2] bg-white px-4 py-2 text-xs font-semibold text-[#44505d]"><span className="material-symbols-outlined text-[17px]">sort</span><select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent outline-none"><option value="ending">{copy.ending}</option><option value="new">{copy.newly}</option><option value="high">{copy.highest}</option></select></label>
          </div>
        </div>

        {loading ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[0,1,2,3].map((i) => <div key={i} className="h-[470px] animate-pulse rounded-[22px] bg-white" />)}</div> : filtered.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((lot) => <AuctionCard key={lot.id} lot={lot} />)}</div> : <div className="mt-8 rounded-[22px] border border-dashed border-[#cfc5b3] bg-white p-14 text-center"><span className="material-symbols-outlined text-4xl text-[#b79a5a]">inventory_2</span><h3 className="mt-3 font-display-lg text-xl font-semibold text-[#071626]">{copy.noLots}</h3><p className="mt-2 text-sm text-[#737b84]">{copy.noLotsDesc}</p></div>}
      </div>
    </section>
  );
}
