import Link from "next/link";
import CollectorShell from "@/components/shells/CollectorShell";
import AuctionDetailClient from "@/app/auctions/[id]/AuctionDetailClient";
import { mockLiveAuction } from "@/lib/mock-data";

export default function AuctionDetailPage() {
  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <nav className="mb-6 flex items-center gap-2 text-xs text-white/40">
          <Link href="/storefront" className="hover:text-white">
            Cửa hàng
          </Link>
          <span>/</span>
          <span>{mockLiveAuction.collection}</span>
          <span>/</span>
          <span className="text-white/70">{mockLiveAuction.lotNumber}</span>
        </nav>

        <AuctionDetailClient />
      </div>
    </CollectorShell>
  );
}
