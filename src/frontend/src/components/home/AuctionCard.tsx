import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import CountdownBadge from "@/components/ui/CountdownBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import { LuxuryLot } from "./types";
import { displayFont } from "@/components/luxe/theme";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function AuctionCard({ lot }: { lot: LuxuryLot }) {
  const isLive = lot.status === "live";

  return (
    <article className="animate-fade-up group overflow-hidden rounded-[24px] border border-white/10 bg-[#0e0d0b] transition duration-500 hover:-translate-y-2 hover:border-[#d4aa61]/45 hover:shadow-[0_24px_70px_rgba(0,0,0,.5)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#11100d]">
        <Image
          src={lot.image}
          alt={lot.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <StatusBadge status={isLive ? "ACTIVE" : lot.status} label={isLive ? "Live" : lot.status} />
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/40 text-[#d4aa61] backdrop-blur transition hover:scale-105 hover:bg-black/60"
            aria-label={`Save ${lot.title}`}
          >
            <span className="material-symbols-outlined text-[19px]">favorite</span>
          </button>
        </div>
        {lot.verified && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-[#d4aa61]/40 bg-black/55 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-[#efcf88] backdrop-blur">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            Verified
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.16em] text-[#d4aa61]">
          <span>{lot.category}</span>
          <span className="text-[#9d948a]">Lot {lot.lotNumber}</span>
        </div>
        <h3 className={`${displayFont} mt-3 min-h-[56px] text-[20px] font-medium leading-7 text-white`}>
          {lot.title}
        </h3>
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#9d948a]">Current bid</p>
            <p className="mt-1 text-base font-extrabold text-[#efcf88]">{money.format(lot.currentBid)}</p>
            <p className="mt-1 text-[11px] text-[#9d948a]">{lot.bids} bids</p>
          </div>
          <div className="border-l border-white/10 pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#9d948a]">Ends in</p>
            <div className="mt-1">
              <CountdownBadge label={lot.timeLeft} urgent={isLive} />
            </div>
            <p className="mt-1 text-[11px] text-[#9d948a]">Ending today</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[10px] leading-4 text-[#9d948a]">
            Estimate
            <br />
            <span className="font-semibold text-[#cfc6ba]">
              {money.format(lot.estimateLow)}-{money.format(lot.estimateHigh)}
            </span>
          </p>
          <Link
            href={`/auctions/${lot.id}`}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-4 py-2.5 text-xs font-bold uppercase tracking-[.1em] text-[#100d08] transition hover:brightness-110"
          >
            View lot <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default memo(AuctionCard);
