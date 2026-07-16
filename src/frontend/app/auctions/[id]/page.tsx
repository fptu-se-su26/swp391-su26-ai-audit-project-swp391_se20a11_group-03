import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import LiveChat from "@/components/feature/LiveChat";
import AuctionDetailClient from "@/app/auctions/[id]/AuctionDetailClient";
import { auctionApi, productApi, type BidRecord } from "@/lib/api";

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auctionId = Number(id);

  let state = null;
  let product = null;
  let bids: BidRecord[] = [];

  try {
    state = await auctionApi.state(auctionId);
    [product, bids] = await Promise.all([
      productApi.detail(state.productId),
      auctionApi.bids(auctionId),
    ]);
  } catch {
    // backend tắt hoặc phiên không tồn tại — render thông báo bên dưới
  }

  return (
    <div className="luxora-app flex min-h-screen flex-col bg-black text-white">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <nav className="mb-6 flex items-center gap-2 text-xs text-white/40">
          <Link href="/storefront" className="hover:text-white">
            Cửa hàng
          </Link>
          <span>/</span>
          <span>{product?.categoryName ?? "Đấu giá"}</span>
          <span>/</span>
          <span className="text-white/70">
            {product ? `LOT #${product.productId}` : `#${id}`}
          </span>
        </nav>

        {state && product ? (
          <AuctionDetailClient
            initialState={state}
            product={product}
            initialBids={bids}
          />
        ) : (
          <div className="glass-panel rounded-2xl p-10 text-center">
            <p className="text-sm text-white/60">
              Không tải được phiên đấu giá. Kiểm tra backend đang chạy và phiên
              tồn tại.
            </p>
            <Link
              href="/storefront"
              className="mt-4 inline-block rounded-full border border-[#d7aa63]/50 px-6 py-2 text-xs font-semibold text-white hover:bg-[#f0c982] hover:text-black"
            >
              Quay lại cửa hàng
            </Link>
          </div>
        )}
        </div>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
}
