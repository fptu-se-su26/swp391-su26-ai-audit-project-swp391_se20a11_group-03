"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import FeaturedLotCard from "./FeaturedLotCard";
import { LuxuryLot } from "./types";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { displayFont } from "@/components/luxe/theme";

const meteorConfig = [
  ["72%", "0.2s", "6.2s", ".9"], ["42%", "2.1s", "7.4s", ".75"], ["88%", "3.8s", "6.8s", ".65"],
  ["58%", "5.2s", "8s", ".55"], ["18%", "1.4s", "7.1s", ".7"], ["34%", "4.6s", "6.4s", ".58"],
  ["66%", "6.1s", "7.8s", ".72"], ["96%", "1.1s", "8.6s", ".5"], ["24%", "7.3s", "6.9s", ".62"],
  ["80%", "8.4s", "7.6s", ".68"], ["50%", "9.7s", "8.2s", ".48"], ["10%", "10.8s", "7s", ".58"],
  ["5%", "0.8s", "5.8s", ".45"], ["15%", "3.4s", "6.6s", ".62"], ["27%", "5.9s", "7.9s", ".5"],
  ["39%", "8.9s", "6.1s", ".72"], ["47%", "11.2s", "8.4s", ".52"], ["53%", "1.9s", "6.7s", ".66"],
  ["61%", "4.2s", "5.9s", ".56"], ["69%", "7.7s", "7.2s", ".78"], ["77%", "10.1s", "8.1s", ".48"],
  ["85%", "12.5s", "6.5s", ".63"], ["93%", "2.8s", "7.7s", ".54"], ["99%", "6.8s", "6.3s", ".7"],
  ["30%", "12.9s", "8.8s", ".42"], ["44%", "13.8s", "7.1s", ".64"], ["56%", "14.6s", "6.2s", ".58"],
  ["68%", "15.4s", "8.5s", ".5"], ["82%", "16.2s", "7.4s", ".7"], ["12%", "17.1s", "6.9s", ".52"],
  ["22%", "18.3s", "8.1s", ".6"], ["36%", "19.4s", "7.6s", ".46"], ["64%", "20.2s", "6.4s", ".76"],
  ["74%", "21.6s", "8.9s", ".44"], ["90%", "22.8s", "7.3s", ".62"], ["98%", "24s", "6.8s", ".5"],
];

export default function HeroSection({ featuredLot }: { featuredLot: LuxuryLot | null }) {
  const copy = useLuxuryHomeCopy();
  return (
    <section className="aurora-panel relative isolate overflow-hidden bg-[#070706] text-[#f5ead9]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_22%,rgba(212,170,97,.22),transparent_32%),radial-gradient(circle_at_12%_85%,rgba(201,154,75,.16),transparent_34%),linear-gradient(135deg,#070706_0%,#100d08_56%,#17130d_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[#070706]/25" />
      <div className="absolute inset-0 -z-10 opacity-[.06] [background-image:linear-gradient(rgba(255,255,255,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.22)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute -right-32 -top-36 -z-10 h-[520px] w-[520px] rounded-full border border-[#d4aa61]/15" />
      <div className="absolute -right-16 -top-20 -z-10 h-[390px] w-[390px] rounded-full border border-[#d4aa61]/10" />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {meteorConfig.map(([left, delay, duration, opacity], index) => (
          <span
            aria-hidden="true"
            className="meteor"
            key={`${left}-${delay}`}
            style={{
              "--meteor-left": left,
              "--meteor-delay": delay,
              "--meteor-duration": duration,
              "--meteor-opacity": opacity,
              "--meteor-tail": `${index % 3 === 0 ? 150 : index % 3 === 1 ? 105 : 128}px`,
            } as CSSProperties & Record<string, string>}
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[.93fr_1.07fr] lg:px-10 lg:py-24 xl:gap-24">
        <div className="animate-fade-up max-w-[650px]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d4aa61]/25 bg-white/[.06] px-3 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#efcf88] backdrop-blur">
            <span className="material-symbols-outlined text-[15px]">workspace_premium</span> {copy.badge}
          </div>
          <h1 className={`${displayFont} luxe-gold-text text-[42px] font-semibold leading-[1.08] tracking-[-.02em] sm:text-[56px] lg:text-[68px]`}>
            {copy.heroTitle}
          </h1>
          <p className="mt-7 max-w-[590px] text-base leading-7 text-[#b7aea3] sm:text-lg">
            {copy.heroDescription}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton href="/live" variant="primary" size="lg" className="bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] !text-[#100d08] hover:brightness-110" iconRight={<span className="material-symbols-outlined text-[18px]">arrow_forward</span>}>{copy.browse}</PrimaryButton>
            <Link href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d4aa61]/40 px-6 py-3.5 text-sm font-semibold text-[#f0ce88] transition hover:-translate-y-0.5 hover:bg-[#d4aa61]/10"><span className="material-symbols-outlined text-[19px]">play_circle</span> {copy.how}</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#cfc6ba]">
            {copy.trust.map((item) => <span key={item} className="inline-flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-[#d4aa61]">check_circle</span>{item}</span>)}
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {["Live bids", "Verified lots", "Secure pay"].map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[.05] p-3 backdrop-blur">
                <p className={`${displayFont} text-lg font-semibold text-[#efcf88]`}>{index === 0 ? "24/7" : index === 1 ? "100%" : "SePay"}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#9d948a]">{item}</p>
              </div>
            ))}
          </div>
        </div>
        {featuredLot ? (
          <FeaturedLotCard lot={featuredLot} />
        ) : (
          <div className="animate-fade-up rounded-[28px] border border-white/15 bg-white/[0.05] p-10 text-center shadow-[0_30px_80px_rgba(0,0,0,.38)] backdrop-blur-xl">
            <span className="material-symbols-outlined text-5xl text-[#d4aa61]">gavel</span>
            <p className={`${displayFont} mt-5 text-xl font-semibold text-white`}>{copy.noFeatured}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#b7aea3]">{copy.noFeaturedDesc}</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <PrimaryButton href="/live" variant="primary" size="lg" className="bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] !text-[#100d08] hover:brightness-110" iconRight={<span className="material-symbols-outlined text-[18px]">arrow_forward</span>}>{copy.browse}</PrimaryButton>
              <Link href="/post-item" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d4aa61]/40 px-6 py-3.5 text-sm font-semibold text-[#f0ce88] transition hover:bg-[#d4aa61]/10">
                <span className="material-symbols-outlined text-[19px]">add_circle</span> {copy.sellCta}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
