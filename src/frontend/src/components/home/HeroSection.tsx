"use client";

import Link from "next/link";
import FeaturedLotCard from "./FeaturedLotCard";
import { LuxuryLot } from "./types";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";

export default function HeroSection({ featuredLot }: { featuredLot: LuxuryLot }) {
  const copy = useLuxuryHomeCopy();
  return (
    <section className="relative isolate overflow-hidden bg-[#071626] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_22%,rgba(190,151,68,.22),transparent_28%),radial-gradient(circle_at_12%_85%,rgba(38,78,111,.5),transparent_38%),linear-gradient(135deg,#071626_0%,#0b2138_52%,#06111e_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[.06] [background-image:linear-gradient(rgba(255,255,255,.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.3)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute -right-32 -top-36 -z-10 h-[520px] w-[520px] rounded-full border border-[#d6b765]/20" />
      <div className="absolute -right-16 -top-20 -z-10 h-[390px] w-[390px] rounded-full border border-[#d6b765]/10" />

      <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[.93fr_1.07fr] lg:px-10 lg:py-24 xl:gap-24">
        <div className="max-w-[650px]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e1c477]/30 bg-white/[.06] px-3 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#e8cd8a] backdrop-blur">
            <span className="material-symbols-outlined text-[15px]">workspace_premium</span> {copy.badge}
          </div>
          <h1 className="font-display-lg text-[42px] font-semibold leading-[1.04] tracking-[-.045em] sm:text-[56px] lg:text-[64px]">
            {copy.heroTitle}
          </h1>
          <p className="mt-7 max-w-[590px] text-base leading-7 text-[#b8c3cf] sm:text-lg">
            {copy.heroDescription}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/live" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#dfbe6d] px-6 py-3.5 text-sm font-bold text-[#071626] shadow-[0_12px_32px_rgba(202,163,73,.22)] transition hover:-translate-y-0.5 hover:bg-[#f0d58f]">{copy.browse} <span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
            <Link href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/[.07]"><span className="material-symbols-outlined text-[19px]">play_circle</span> {copy.how}</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#9eaebb]">
            {copy.trust.map((item) => <span key={item} className="inline-flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-[#d9ba6e]">check_circle</span>{item}</span>)}
          </div>
        </div>
        <FeaturedLotCard lot={featuredLot} />
      </div>
    </section>
  );
}
