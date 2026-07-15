"use client";

import Link from "next/link";
import { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { LuxuryLot } from "./types";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";
import { displayFont } from "@/components/luxe/theme";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function SafeLotImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={`${className} grid place-items-center bg-[radial-gradient(circle_at_18%_18%,rgba(214,168,79,.28),transparent_30%),radial-gradient(circle_at_82%_72%,rgba(20,52,142,.32),transparent_34%),linear-gradient(135deg,#111827,#020617)]`}>
        <span className="material-symbols-outlined text-3xl text-[#d8bd75]/70">image</span>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

export default function MarketSections({ upcoming, results, loading = false }: { upcoming: LuxuryLot[]; results: LuxuryLot[]; loading?: boolean }) {
  const copy = useLuxuryHomeCopy();

  return (
    <section className="relative overflow-hidden bg-[#070706] px-4 py-20 text-[#f5ead9] sm:px-6 lg:px-10 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_18%,rgba(201,154,75,.24),transparent_28%),radial-gradient(circle_at_48%_4%,rgba(212,170,97,.16),transparent_34%),radial-gradient(circle_at_88%_88%,rgba(212,170,97,.16),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(7,7,6,.94)_0%,rgba(17,16,13,.82)_44%,rgba(7,7,6,.97)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[82%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d4aa61]/50 to-transparent" />
      <div className="sparkle-field" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1440px] items-start gap-10 xl:grid-cols-[1fr_1fr] xl:gap-16">
        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[.04] p-5 shadow-[0_30px_90px_rgba(0,0,0,.4)] backdrop-blur sm:p-7">
          <div className="mb-7">
            <SectionHeader
              eyebrow={copy.upcomingEyebrow}
              title={copy.upcoming}
              tone="dark"
              action={<Link href="/upcoming" className="text-xs font-bold text-[#d4aa61] transition hover:text-white">{copy.calendar} -&gt;</Link>}
            />
          </div>
          <div className="grid gap-4">
            {loading ? (
              [0, 1, 2].map((i) => <div key={i} className="skeleton-shimmer h-28 rounded-[26px]" />)
            ) : upcoming.length === 0 ? (
              <p className="rounded-[26px] border border-dashed border-white/20 bg-white/[.04] p-8 text-center text-sm text-slate-400">{copy.noUpcoming}</p>
            ) : (
            upcoming.slice(0, 3).map((lot, index) => (
              <Link
                href={`/auctions/${lot.id}`}
                key={lot.id}
                className="group grid grid-cols-[92px_1fr_auto] items-center gap-4 rounded-[26px] border border-white/10 bg-white/[.05] p-3 shadow-[0_18px_50px_rgba(0,0,0,.28)] transition duration-300 hover:-translate-y-1 hover:border-[#d4aa61]/45 hover:bg-white/[.08] sm:grid-cols-[116px_1fr_auto]"
              >
                <div className="relative overflow-hidden rounded-2xl bg-[#11100d]">
                  <SafeLotImage src={lot.image} alt={lot.title} className="h-24 w-24 object-cover transition duration-500 group-hover:scale-105 sm:h-28 sm:w-28" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#d4aa61]">
                    {index === 0 ? "Tomorrow - 7:00 PM" : `${index + 2} days - 8:30 PM`}
                  </p>
                  <h3 className={`${displayFont} mt-2 line-clamp-2 text-base font-medium leading-6 text-white sm:text-lg`}>{lot.title}</h3>
                  <p className="mt-2 text-xs text-[#b7aea3]">
                    Estimate {money.format(lot.estimateLow)}-{money.format(lot.estimateHigh)}
                  </p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#d4aa61]/10 text-[#efcf88] ring-1 ring-[#d4aa61]/25 transition group-hover:translate-x-1 group-hover:bg-[#d4aa61] group-hover:text-[#100d08]">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </span>
              </Link>
            ))
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[#0e0d0b]/85 p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,.4)] backdrop-blur sm:p-7">
          <div className="mb-7">
            <SectionHeader
              eyebrow={copy.resultsEyebrow}
              title={copy.results}
              tone="dark"
              action={<Link href="/results" className="text-xs font-bold text-[#d4aa61] transition hover:text-white">{copy.allResults} -&gt;</Link>}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {loading ? (
              [0, 1, 2, 3].map((i) => <div key={i} className="skeleton-shimmer aspect-[16/10] rounded-[24px]" />)
            ) : results.length === 0 ? (
              <p className="col-span-full rounded-[24px] border border-dashed border-white/20 bg-white/[.04] p-8 text-center text-sm text-slate-400">{copy.noResults}</p>
            ) : (
            results.slice(0, 4).map((lot) => (
              <Link
                href={`/auctions/${lot.id}`}
                key={lot.id}
                className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[.04] p-3 transition duration-300 hover:-translate-y-1 hover:border-[#d4aa61]/45 hover:bg-white/[.07]"
              >
                <div className="relative overflow-hidden rounded-2xl bg-[#11100d]">
                  <SafeLotImage src={lot.image} alt={lot.title} className="aspect-[16/10] w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
                  <div className="absolute left-3 top-3">
                    <StatusBadge status="ENDED" label={`Lot ${lot.lotNumber}`} />
                  </div>
                  <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition group-hover:bg-[#d4aa61] group-hover:text-[#100d08]">
                    <span className="material-symbols-outlined text-[18px]">north_east</span>
                  </span>
                </div>
                <div className="p-2 pt-4">
                  <h3 className={`${displayFont} line-clamp-2 min-h-12 text-base font-medium leading-6`}>{lot.title}</h3>
                  <p className="mt-5 text-[9px] uppercase tracking-[.18em] text-[#9d948a]">Sold for</p>
                  <p className="mt-1 text-2xl font-black tracking-[-.03em] text-[#efcf88]">{money.format(lot.currentBid)}</p>
                </div>
              </Link>
            ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
