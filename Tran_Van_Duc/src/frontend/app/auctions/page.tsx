import Image from "next/image";
import CollectorShell from "@/components/shells/CollectorShell";
import StorefrontCategoryFilter from "@/app/storefront/StorefrontCategoryFilter";
import StorefrontLotBrowser from "@/app/storefront/StorefrontLotBrowser";
import { mockStorefrontLots } from "@/lib/mock-data";
import { CATEGORY_ITEMS } from "@/lib/home-data";

type AuctionsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AuctionsPage({ searchParams }: AuctionsPageProps) {
  const categoryParam = (await searchParams).category;
  const selectedCategoryId = Array.isArray(categoryParam)
    ? categoryParam[0]
    : categoryParam;
  const activeCategory = CATEGORY_ITEMS.find(
    (category) => category.id === selectedCategoryId,
  );
  const visibleLots = activeCategory
    ? mockStorefrontLots.filter((lot) => lot.categoryId === activeCategory.id)
    : mockStorefrontLots;
  const heroLot = visibleLots.find((lot) => lot.isLive) ?? visibleLots[0];
  const categoryFilters = CATEGORY_ITEMS.map((category) => ({
    ...category,
    lotCount: mockStorefrontLots.filter((lot) => lot.categoryId === category.id)
      .length,
  }));
  const liveCount = visibleLots.filter((lot) => lot.isLive).length;
  const consignCount = visibleLots.filter((lot) => lot.canConsign).length;

  return (
    <CollectorShell>
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        <section className="glass-card relative min-h-[280px] overflow-hidden rounded-3xl border border-white/10 bg-[#030303]">
          <Image
            src={heroLot.image}
            alt="Phòng đấu giá BidZone"
            fill
            priority
            sizes="(min-width: 768px) calc(100vw - 16rem), 100vw"
            className="object-cover object-[70%_center] opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_42%,rgba(240,201,130,0.16),transparent_36%)]" />
          <div className="relative z-10 flex max-w-3xl flex-col gap-5 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[var(--luxora-gold)]">
              Phòng đấu giá
            </p>
            <h1 className="font-display-lg text-3xl leading-tight sm:text-5xl">
              Danh sách sản phẩm đang đấu giá
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/60">
              Theo dõi các lot đang live, lọc theo danh mục, sắp xếp theo giá
              hoặc thời gian còn lại và vào phòng đấu chi tiết chỉ với một lần
              bấm.
            </p>

            <div className="grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-xl font-bold text-[var(--luxora-gold-light)]">
                  {visibleLots.length}
                </p>
                <p className="mt-1 text-[11px] text-white/45">Lot đang mở</p>
              </div>
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3">
                <p className="text-xl font-bold text-red-200">{liveCount}</p>
                <p className="mt-1 text-[11px] text-red-100/55">Đang live</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-xl font-bold text-white">{consignCount}</p>
                <p className="mt-1 text-[11px] text-white/45">Có ký gửi</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <StorefrontCategoryFilter
            categories={categoryFilters}
            activeCategoryId={activeCategory?.id}
            totalLotCount={mockStorefrontLots.length}
            basePath="/auctions"
          />

          <StorefrontLotBrowser
            lots={visibleLots}
            categoryLabel={
              activeCategory ? activeCategory.label : "Tất cả sản phẩm đấu giá"
            }
          />
        </section>
      </div>
    </CollectorShell>
  );
}
