"use client";

import Link from "next/link";
import { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { LuxuryLot } from "./types";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";

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

export default function MarketSections({ upcoming, results }: { upcoming: LuxuryLot[]; results: LuxuryLot[] }) {
  const copy = useLuxuryHomeCopy();

  return (
    <section className="relative overflow-hidden bg-[#030712] px-4 py-20 text-white sm:px-6 lg:px-10 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_18%,rgba(154,107,19,.3),transparent_28%),radial-gradient(circle_at_48%_4%,rgba(20,52,142,.34),transparent_34%),radial-gradient(circle_at_88%_88%,rgba(214,168,79,.18),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(2,6,23,.94)_0%,rgba(15,23,42,.82)_44%,rgba(3,7,18,.97)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[82%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d6a84f]/50 to-transparent" />
      <div className="sparkle-field" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1440px] items-start gap-10 xl:grid-cols-[1fr_1fr] xl:gap-16">
        <div className="brand-ring overflow-hidden rounded-[34px] border border-white/10 bg-white/[.065] p-5 shadow-[0_30px_90px_rgba(0,0,0,.28)] backdrop-blur sm:p-7">
          <div className="mb-7">
            <SectionHeader
              eyebrow={copy.upcomingEyebrow}
              title={copy.upcoming}
              tone="dark"
              action={<Link href="/upcoming" className="text-xs font-bold text-[#d8bd75] transition hover:text-white">{copy.calendar} -&gt;</Link>}
            />
          </div>
          <div className="grid gap-4">
            {upcoming.slice(0, 3).map((lot, index) => (
              <Link
                href={`/auctions/${lot.id}`}
                key={lot.id}
                className="group grid grid-cols-[92px_1fr_auto] items-center gap-4 rounded-[26px] border border-white/10 bg-white/[.075] p-3 shadow-[0_18px_50px_rgba(0,0,0,.18)] transition duration-300 hover:-translate-y-1 hover:border-[#d6a84f]/45 hover:bg-white/[.11] sm:grid-cols-[116px_1fr_auto]"
              >
                <div className="relative overflow-hidden rounded-2xl bg-slate-900">
                  <SafeLotImage src={lot.image} alt={lot.title} className="h-24 w-24 object-cover transition duration-500 group-hover:scale-105 sm:h-28 sm:w-28" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#d8bd75]">
                    {index === 0 ? "Tomorrow - 7:00 PM" : `${index + 2} days - 8:30 PM`}
                  </p>
                  <h3 className="mt-2 line-clamp-2 font-display-lg text-base font-bold leading-6 text-white sm:text-lg">{lot.title}</h3>
                  <p className="mt-2 text-xs text-slate-300">
                    Estimate {money.format(lot.estimateLow)}-{money.format(lot.estimateHigh)}
                  </p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#d6a84f]/10 text-[#f2d786] ring-1 ring-[#d6a84f]/25 transition group-hover:translate-x-1 group-hover:bg-[#9a6b13] group-hover:text-white">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="brand-ring overflow-hidden rounded-[34px] border border-white/10 bg-[#050b1d]/85 p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,.32)] backdrop-blur sm:p-7">
          <div className="mb-7">
            <SectionHeader
              eyebrow={copy.resultsEyebrow}
              title={copy.results}
              tone="dark"
              action={<Link href="/results" className="text-xs font-bold text-[#d8bd75] transition hover:text-white">{copy.allResults} -&gt;</Link>}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.slice(0, 4).map((lot) => (
              <Link
                href={`/auctions/${lot.id}`}
                key={lot.id}
                className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[.06] p-3 transition duration-300 hover:-translate-y-1 hover:border-[#d6a84f]/45 hover:bg-white/[.11]"
              >
                <div className="relative overflow-hidden rounded-2xl bg-slate-900">
                  <SafeLotImage src={lot.image} alt={lot.title} className="aspect-[16/10] w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
                  <div className="absolute left-3 top-3">
                    <StatusBadge status="ENDED" label={`Lot ${lot.lotNumber}`} />
                  </div>
                  <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-slate-950/70 text-white backdrop-blur transition group-hover:bg-[#9a6b13]">
                    <span className="material-symbols-outlined text-[18px]">north_east</span>
                  </span>
                </div>
                <div className="p-2 pt-4">
                  <h3 className="line-clamp-2 min-h-12 font-display-lg text-base font-bold leading-6">{lot.title}</h3>
                  <p className="mt-5 text-[9px] uppercase tracking-[.18em] text-slate-400">Sold for</p>
                  <p className="mt-1 text-2xl font-black tracking-[-.03em] text-[#f2d786]">{money.format(lot.currentBid)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
