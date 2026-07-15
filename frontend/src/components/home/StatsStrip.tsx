"use client";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";
import { displayFont } from "@/components/luxe/theme";
const icons = ["groups", "verified", "public", "shield_lock"];

export default function StatsStrip() {
  const { stats } = useLuxuryHomeCopy();
  return (
    <section className="border-b border-white/10 bg-[#0b0b0a]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-10">
        {stats.map(([value, label], index) => <div key={label} className={`flex items-center gap-3 py-6 sm:gap-4 lg:px-7 ${index > 0 ? "border-l border-white/10 pl-4 sm:pl-7" : ""}`}>
          <span className="material-symbols-outlined hidden text-[25px] text-[#d4aa61] sm:block">{icons[index]}</span>
          <div><p className={`${displayFont} text-xl font-semibold tracking-tight text-[#efcf88] sm:text-2xl`}>{value}</p><p className="mt-0.5 text-[11px] font-medium text-[#9d948a] sm:text-xs">{label}</p></div>
        </div>)}
      </div>
    </section>
  );
}
