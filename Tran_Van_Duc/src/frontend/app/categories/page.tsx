import Image from "next/image";
import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import {
  CATEGORY_ITEMS,
  HERO_STATS,
  LIVE_AUCTION_ITEMS,
  WHY_CHOOSE_FEATURES,
} from "@/lib/home-data";

const CATEGORY_META = [
  {
    count: "482",
    lead: "Đồng hồ cơ, chronograph và dress watch được săn đón.",
    image: "/images/auction-products/rolex-daytona.png",
    tags: ["Rolex", "Patek Philippe", "Omega"],
  },
  {
    count: "318",
    lead: "Flagship, bản màu hiếm và thiết bị còn nguyên hộp.",
    image: "/images/auction-products/iphone-15-pro-max.png",
    tags: ["iPhone", "Samsung", "Xiaomi"],
  },
  {
    count: "126",
    lead: "Laptop hiệu năng cao cho sưu tầm và sáng tạo.",
    image: "/images/auction-products/macbook-pro-m3-max.png",
    tags: ["MacBook", "ROG", "Dell XPS"],
  },
  {
    count: "94",
    lead: "Máy ảnh rangefinder, mirrorless và lens cao cấp.",
    image: "/images/auction-products/leica-m11.png",
    tags: ["Leica", "Sony", "Fujifilm"],
  },
  {
    count: "210",
    lead: "Tai nghe, loa, âm thanh cá nhân và phòng nghe.",
    image: "/images/auction-products/airpods-max.png",
    tags: ["AirPods", "Bose", "Sony"],
  },
  {
    count: "176",
    lead: "Túi biểu tượng, bản vintage và phụ kiện luxury.",
    image: "/images/luxury-watch-hero.png",
    tags: ["Louis Vuitton", "Hermès", "Chanel"],
  },
  {
    count: "260",
    lead: "Thiết bị công nghệ, console và phụ kiện giới hạn.",
    image: "/images/auction-products/macbook-pro-m3-max.png",
    tags: ["PlayStation", "DJI", "GoPro"],
  },
  {
    count: "155",
    lead: "Trang sức, kim cương, phụ kiện quý và vật phẩm đeo.",
    image: "/images/luxury-watch-hero.png",
    tags: ["Kim cương", "Vàng 18K", "Đá quý"],
  },
];

const MAX_COUNT = Math.max(...CATEGORY_META.map((meta) => Number(meta.count)));

export default function CategoriesPage() {
  const featured = LIVE_AUCTION_ITEMS.slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10">
          <Image
            src="/images/luxury-watch-hero.png"
            alt="Danh mục đấu giá BidZone"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/86 to-black/35" />
          <div className="relative mx-auto grid max-w-[1600px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#f0c982]">
                Kho danh mục
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
                Chọn đúng danh mục, tìm đúng món đáng sở hữu
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/62">
                BidZone chia sản phẩm theo nhóm sưu tầm rõ ràng, mỗi nhóm có
                quy trình kiểm định và tiêu chí niêm yết riêng.
              </p>

              <div className="mt-10 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4">
                {HERO_STATS.map((stat) => (
                  <div key={stat.id}>
                    <p className="text-2xl font-bold text-[#f0c982] sm:text-3xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-white/45">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden items-end justify-end lg:flex">
              <div className="grid w-full max-w-xl grid-cols-3 gap-3">
                {featured.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-black/60"
                  >
                    <Image
                      src={item.imageSrc}
                      alt={item.title}
                      fill
                      sizes="220px"
                      className="object-contain p-3"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Category grid */}
        <section className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-12">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.25em] text-[#f0c982]">
                DANH MỤC NỔI BẬT
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                Bộ lọc dành cho người mua nghiêm túc
              </h2>
            </div>
            <Link
              href="/storefront"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d7aa63]/45 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Xem toàn bộ lot
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_ITEMS.map((category, index) => {
              const meta = CATEGORY_META[index];
              const fillPct = Math.round(
                (Number(meta.count) / MAX_COUNT) * 100
              );

              return (
                <Link
                  key={category.id}
                  href={`/storefront?category=${category.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#070707] transition-all hover:-translate-y-1 hover:border-[#f0c982]/60 hover:shadow-[0_20px_45px_-25px_rgba(240,201,130,0.5)]"
                >
                  <div className="relative aspect-[4/3] bg-black">
                    <Image
                      src={meta.image}
                      alt={category.label}
                      fill
                      sizes="(min-width: 1024px) 25vw, 100vw"
                      className="object-contain p-4 transition-transform group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#d7aa63]/40 bg-black/60">
                      <span className="material-symbols-outlined text-2xl text-[#f0c982]">
                        {category.icon}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold tracking-wider">
                        {category.label}
                      </h3>
                      <span className="text-right">
                        <span className="block text-2xl font-bold text-[#f0c982]">
                          {meta.count}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-white/35">
                          lot
                        </span>
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/55">
                      {meta.lead}
                    </p>

                    <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#f0c982] to-[#d7aa63]"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {meta.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span className="mt-auto flex items-center gap-1 pt-5 text-xs font-semibold uppercase tracking-wider text-[#f0c982] opacity-0 transition-opacity group-hover:opacity-100">
                      Khám phá ngay
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Why choose */}
        <section className="border-t border-white/10 bg-[#050505]">
          <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-12">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold tracking-[0.25em] text-[#f0c982]">
                VÌ SAO CHỌN BIDZONE
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                Mỗi danh mục đều được kiểm định như nhau
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {WHY_CHOOSE_FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  className="rounded-2xl border border-white/10 bg-black/60 p-6 text-center transition-colors hover:border-[#f0c982]/40"
                >
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d7aa63]/40 bg-black">
                    <span className="material-symbols-outlined text-2xl text-[#f0c982]">
                      {feature.icon}
                    </span>
                  </span>
                  <h3 className="mt-4 text-sm font-bold tracking-wider">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f0c982]">
              Sẵn sàng săn lot đầu tiên?
            </p>
            <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">
              Đăng ký tài khoản để theo dõi mọi phiên đấu giá theo danh mục yêu thích
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#f0c982] px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
              >
                Tạo tài khoản miễn phí
              </Link>
              <Link
                href="/storefront"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Duyệt toàn bộ lot
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
