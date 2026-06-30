"use client";
import Link from "next/link";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";

export default function SellCTA() {
  const copy = useLuxuryHomeCopy();
  return (
    <section className="px-4 pb-20 pt-14 sm:px-6 lg:px-10 lg:pb-28 lg:pt-18">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[32px] bg-slate-950 px-6 py-14 text-white shadow-[0_26px_80px_rgba(15,23,42,.22)] sm:px-12 lg:px-20 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_30%,rgba(214,168,79,.3),transparent_25%),radial-gradient(circle_at_18%_80%,rgba(20,52,142,.25),transparent_28%),linear-gradient(110deg,transparent_45%,rgba(255,255,255,.05)_45%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl"><p className="text-[10px] font-bold uppercase tracking-[.23em] text-[#d8bd75]">{copy.sellEyebrow}</p><h2 className="mt-4 font-display-lg text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{copy.sellTitle}</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">{copy.sellDesc}</p></div>
          <div className="flex flex-col gap-3 sm:flex-row"><Link href="/sell" className="rounded-full bg-[#9a6b13] px-6 py-3.5 text-center text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#b9841a]">{copy.valuation}</Link><Link href="/sell" className="rounded-full border border-[#d6a84f]/35 px-6 py-3.5 text-center text-sm font-semibold text-[#f2d786] transition hover:-translate-y-0.5 hover:bg-white/10">{copy.specialists}</Link></div>
        </div>
      </div>
    </section>
  );
}
