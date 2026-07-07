import Image from "next/image";
import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import StorefrontCategoryFilter from "./StorefrontCategoryFilter";
import StorefrontLotBrowser from "./StorefrontLotBrowser";
import { mockStorefrontLots } from "@/lib/mock-data";
import { CATEGORY_ITEMS } from "@/lib/home-data";

type StorefrontPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StorefrontPage({
  searchParams,
}: StorefrontPageProps) {
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
  const featureLot = visibleLots[0] ?? mockStorefrontLots[0];
  const categoryFilters = CATEGORY_ITEMS.map((category) => ({
    ...category,
    lotCount: mockStorefrontLots.filter((lot) => lot.categoryId === category.id)
      .length,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header />
      <main className="flex-1">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
          <section className="glass-card relative min-h-[260px] overflow-hidden rounded-3xl border border-white/10 bg-[#030303]">
            <Image
              src={featureLot.image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-right opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/15" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(240,201,130,0.12),transparent_34%)]" />
            <div className="relative z-10 flex max-w-2xl flex-col gap-5 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
              <span className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
                BIDZONE STOREFRONT
              </span>
              <h1 className="font-display-lg max-w-lg text-3xl sm:text-4xl">
                {activeCategory
                  ? `Sản phẩm ${activeCategory.label.toLowerCase()} đang bán`
                  : "Phòng đấu giá tuyển chọn"}
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-white/55">
                {activeCategory
                  ? "Các lot đang mở trong danh mục này, sẵn sàng để theo dõi và đặt giá."
                  : "Khám phá toàn bộ lot đang bán theo từng danh mục nổi bật."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={`/auctions/${featureLot.id}`} className="hidden">
                  Đấu giá ngay
                </Link>
                <Link
                  href="/watchlist"
                  className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold hover:bg-white/10"
                >
                  Theo dõi
                </Link>
              </div>
            </div>
          </section>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
            <StorefrontCategoryFilter
              categories={categoryFilters}
              activeCategoryId={activeCategory?.id}
              totalLotCount={mockStorefrontLots.length}
            />

            <StorefrontLotBrowser
              lots={visibleLots}
              categoryLabel={
                activeCategory ? activeCategory.label : "Tất cả danh mục"
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
