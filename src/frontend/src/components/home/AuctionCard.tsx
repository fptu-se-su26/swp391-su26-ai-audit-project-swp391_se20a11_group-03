import Link from "next/link";
import CountdownBadge from "@/components/ui/CountdownBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import { LuxuryLot } from "./types";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function AuctionCard({ lot }: { lot: LuxuryLot }) {
  const isLive = lot.status === "live";

  return (
    <article className="animate-fade-up group overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_14px_45px_rgba(15,23,42,.08)] transition duration-500 hover:-translate-y-2 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(15,23,42,.14)]">
      <div className="relative overflow-hidden bg-slate-100">
        <img
          src={lot.image}
          alt={lot.title}
          className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <StatusBadge status={isLive ? "ACTIVE" : lot.status} label={isLive ? "Live" : lot.status} />
          <button
            className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm backdrop-blur transition hover:scale-105 hover:bg-red-50 hover:text-red-600"
            aria-label={`Save ${lot.title}`}
          >
            <span className="material-symbols-outlined text-[19px]">favorite</span>
          </button>
        </div>
        {lot.verified && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-emerald-700 backdrop-blur">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            Verified
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.16em] text-[#9a6b13]">
          <span>{lot.category}</span>
          <span className="text-slate-400">Lot {lot.lotNumber}</span>
        </div>
        <h3 className="mt-3 min-h-[56px] font-display-lg text-[18px] font-semibold leading-7 tracking-[-.02em] text-slate-950">
          {lot.title}
        </h3>
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-slate-500">Current bid</p>
            <p className="mt-1 text-base font-extrabold text-slate-950">{money.format(lot.currentBid)}</p>
            <p className="mt-1 text-[11px] text-slate-500">{lot.bids} bids</p>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-slate-500">Ends in</p>
            <div className="mt-1">
              <CountdownBadge label={lot.timeLeft} urgent={isLive} />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Ending today</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[10px] leading-4 text-slate-500">
            Estimate
            <br />
            <span className="font-semibold text-slate-700">
              {money.format(lot.estimateLow)}-{money.format(lot.estimateHigh)}
            </span>
          </p>
          <Link
            href={`/auctions/${lot.id}`}
            className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-bold uppercase tracking-[.1em] text-white transition group-hover:bg-[#9a6b13]"
          >
            View lot <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
