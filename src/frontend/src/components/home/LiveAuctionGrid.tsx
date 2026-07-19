"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AuctionCard from "./AuctionCard";
import { LuxuryLot } from "./types";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";
import SectionHeader from "@/components/ui/SectionHeader";
import { displayFont } from "@/components/luxe/theme";

export default function LiveAuctionGrid({ lots, loading = false }: { lots: LuxuryLot[]; loading?: boolean }) {
  const copy = useLuxuryHomeCopy();
  const [activeTab, setActiveTab] = useState(0);
  const [sort, setSort] = useState("ending");
  const categoryKeys = ["", "watch", "art", "jewel", "car", "collect"];
  const filtered = useMemo(() => activeTab === 0 ? lots : lots.filter((lot) => lot.category.toLowerCase().includes(categoryKeys[activeTab])), [activeTab, lots]);

  return (
    <section id="live-lots" className="bg-[#080807] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <SectionHeader
          eyebrow={copy.curated}
          title={copy.liveTitle}
          description={copy.liveDesc}
          tone="dark"
          action={
            <Link href="/live" className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d4aa61]/40 bg-white/[0.04] px-4 py-2.5 text-xs font-bold uppercase tracking-[.13em] text-[#f0ce88] transition hover:-translate-y-0.5 hover:bg-[#d4aa61]/10">
              {copy.explore} <span className="material-symbols-outlined text-[17px]">north_east</span>
            </Link>
          }
        />

        <div className="mt-9 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-3 backdrop-blur xl:flex-row xl:items-center xl:justify-between">
          <div className="no-scrollbar flex gap-1 overflow-x-auto pb-1 xl:pb-0">{copy.tabs.map((tab, index) => <button key={tab} onClick={() => setActiveTab(index)} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition ${activeTab === index ? "bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] text-[#100d08]" : "text-[#cfc6ba] hover:bg-white/[0.06] hover:text-[#d4aa61]"}`}>{tab}</button>)}</div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-[#cfc6ba] transition hover:border-[#d4aa61]/50 hover:text-[#d4aa61]"><span className="material-symbols-outlined text-[17px]">tune</span> {copy.price}</button>
            <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-[#cfc6ba]"><span className="material-symbols-outlined text-[17px]">sort</span><select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent text-[#cfc6ba] outline-none [&>option]:bg-[#11100d] [&>option]:text-[#f5ead9]"><option value="ending">{copy.ending}</option><option value="new">{copy.newly}</option><option value="high">{copy.highest}</option></select></label>
          </div>
        </div>

        {loading ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[0,1,2,3].map((i) => <div key={i} className="skeleton-shimmer h-[470px] rounded-[24px]" />)}</div> : filtered.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((lot) => <AuctionCard key={lot.id} lot={lot} />)}</div> : <div className="mt-8 rounded-[24px] border border-dashed border-white/15 bg-white/[0.03] p-14 text-center"><span className="material-symbols-outlined text-4xl text-[#d4aa61]">inventory_2</span><h3 className={`${displayFont} mt-3 text-xl font-semibold text-white`}>{copy.noLots}</h3><p className="mt-2 text-sm text-[#9d948a]">{copy.noLotsDesc}</p></div>}
      </div>
    </section>
  );
}
