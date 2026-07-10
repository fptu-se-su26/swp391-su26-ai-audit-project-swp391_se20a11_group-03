"use client";
import Link from "next/link";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";
import { displayFont } from "@/components/luxe/theme";

export default function SellCTA() {
  const copy = useLuxuryHomeCopy();
  return (
    <section className="bg-[#070706] px-4 pb-20 pt-14 sm:px-6 lg:px-10 lg:pb-28 lg:pt-18">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[32px] border border-white/10 bg-[#0e0d0b] px-6 py-14 text-white shadow-[0_26px_80px_rgba(0,0,0,.5)] sm:px-12 lg:px-20 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_30%,rgba(212,170,97,.28),transparent_26%),radial-gradient(circle_at_18%_80%,rgba(201,154,75,.18),transparent_28%),linear-gradient(110deg,transparent_45%,rgba(255,255,255,.04)_45%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl"><p className="text-[10px] font-bold uppercase tracking-[.23em] text-[#d4aa61]">{copy.sellEyebrow}</p><h2 className={`${displayFont} mt-4 text-3xl font-medium leading-tight sm:text-4xl`}>{copy.sellTitle}</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-[#b7aea3]">{copy.sellDesc}</p></div>
          <div className="flex flex-col gap-3 sm:flex-row"><Link href="/sell" className="rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-6 py-3.5 text-center text-sm font-bold text-[#100d08] transition hover:-translate-y-0.5 hover:brightness-110">{copy.valuation}</Link><Link href="/sell" className="rounded-full border border-[#d4aa61]/50 px-6 py-3.5 text-center text-sm font-semibold text-[#f0ce88] transition hover:-translate-y-0.5 hover:bg-[#d4aa61]/10">{copy.specialists}</Link></div>
        </div>
      </div>
    </section>
  );
}
