"use client";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";
const icons = ["groups", "verified", "public", "shield_lock"];

export default function StatsStrip() {
  const { stats } = useLuxuryHomeCopy();
  return (
    <section className="border-b border-[#e6dfd2] bg-[#fffdf8]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-10">
        {stats.map(([value, label], index) => <div key={label} className={`flex items-center gap-3 py-6 sm:gap-4 lg:px-7 ${index > 0 ? "border-l border-[#e8e1d4] pl-4 sm:pl-7" : ""}`}>
          <span className="material-symbols-outlined hidden text-[25px] text-[#a27a2f] sm:block">{icons[index]}</span>
          <div><p className="font-display-lg text-xl font-semibold tracking-tight text-[#071626] sm:text-2xl">{value}</p><p className="mt-0.5 text-[11px] font-medium text-[#68717b] sm:text-xs">{label}</p></div>
        </div>)}
      </div>
    </section>
  );
}
