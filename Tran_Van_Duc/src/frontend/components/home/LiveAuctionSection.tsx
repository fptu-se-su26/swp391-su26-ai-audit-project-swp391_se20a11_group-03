import Link from "next/link";
import LiveAuctionGrid from "@/components/home/LiveAuctionGrid";
import { LIVE_AUCTION_ITEMS } from "@/lib/home-data";

export default function LiveAuctionSection() {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-14 lg:px-12">
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <h2 className="flex min-w-0 items-center gap-3 text-xs font-semibold tracking-[0.18em] text-white sm:text-sm sm:tracking-[0.25em]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
            <span className="truncate">PHIÊN ĐẤU GIÁ LIVE</span>
          </h2>
          <Link
            href="/storefront"
            className="flex shrink-0 items-center gap-2 text-[11px] font-medium tracking-wider text-white/60 transition-colors hover:text-white sm:text-xs"
          >
            XEM TẤT CẢ
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>

        <LiveAuctionGrid items={LIVE_AUCTION_ITEMS} />
      </div>
    </section>
  );
}
