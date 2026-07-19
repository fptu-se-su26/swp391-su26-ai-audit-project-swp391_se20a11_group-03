import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { BRAND_ITEMS } from "@/lib/home-data";

const BRAND_DETAILS = [
  {
    line: "Đồng hồ",
    description: "Đồng hồ biểu tượng có thanh khoản cao và cộng đồng sưu tầm mạnh.",
    volume: "482 lot",
  },
  {
    line: "Công nghệ",
    description: "Thiết bị flagship, phiên bản giới hạn và sản phẩm còn nguyên hộp.",
    volume: "318 lot",
  },
  {
    line: "Chế tác đồng hồ cao cấp",
    description: "Nhóm đồng hồ cao cấp dành cho nhà sưu tầm lâu năm.",
    volume: "74 lot",
  },
  {
    line: "Nhà mốt thời trang",
    description: "Túi, phụ kiện và vật phẩm thời trang luxury có nguồn gốc rõ.",
    volume: "176 lot",
  },
  {
    line: "Chế tác máy ảnh",
    description: "Máy ảnh sưu tầm, body hiếm và lens được kiểm tra tình trạng.",
    volume: "94 lot",
  },
  {
    line: "Nghe nhìn",
    description: "Thiết bị nghe nhìn, camera và công nghệ giải trí cao cấp.",
    volume: "140 lot",
  },
  {
    line: "Công nghệ sáng tạo",
    description: "Drone, gimbal và công cụ sáng tạo nội dung chuyên nghiệp.",
    volume: "88 lot",
  },
  {
    line: "Phòng thu âm thanh",
    description: "Âm thanh cá nhân, tai nghe và thiết bị phòng nghe.",
    volume: "210 lot",
  },
];

function BrandMark({ id, name }: { id: string; name: string }) {
  if (id === "louis-vuitton") {
    return <span className="font-serif text-5xl font-bold text-[#f0c982]">LV</span>;
  }

  if (id === "leica") {
    return (
      <span className="theme-dark-content flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-sm font-bold italic text-white">
        Leica
      </span>
    );
  }

  if (id === "apple") {
    return (
      <svg viewBox="0 0 64 64" className="h-14 w-14 text-white" aria-hidden="true">
        <path
          d="M41.5 6.5c-4.1.5-8.9 3.7-10.7 7.2-1.5 2.9-1.2 5.7-.9 6.8 3.9.3 8.2-2.4 10.1-5.6 1.8-3 2.1-6.1 1.5-8.4ZM52.8 46.3c-1.2 2.8-1.8 4-3.3 6.5-2.1 3.6-5.1 8.1-8.8 8.1-3.3 0-4.2-2.1-8.7-2.1-4.5 0-5.7 2.1-8.8 2.2-3.7.1-6.5-4-8.7-7.6-6-10-6.6-21.8-2.9-28.1 2.6-4.5 6.8-7.2 10.7-7.2 4 0 6.5 2.2 9.8 2.2 3.2 0 5.1-2.2 9.7-2.2 3.5 0 7.1 1.9 9.7 5.1-8.5 4.7-7.1 16.8 1.3 20.1Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <span className="text-center font-serif text-3xl font-bold tracking-[0.2em] text-[#f0c982]">
      {name}
    </span>
  );
}

export default function BrandsPage() {
  const heroBrand = BRAND_ITEMS[0];

  return (
    <div className="luxora-app min-h-screen bg-black text-white">
      <Header />
      <main className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-12">
        <section className="mb-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="themed-feature-panel rounded-2xl border border-[#d7aa63]/35 p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#f0c982]">
              Kho thương hiệu
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-6xl">
              Thương hiệu có giá trị sưu tầm cao
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-white/62">
              BidZone theo dõi nhu cầu thị trường, độ hiếm và lịch sử giao dịch
              để xây dựng bộ sưu tập thương hiệu phù hợp cho đấu giá.
            </p>
          </div>

          <Link
            href={`/storefront?brand=${heroBrand.id}`}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#070707] p-7 transition-all hover:border-[#f0c982]/60"
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#f0c982]/10 blur-3xl" />
            <div className="relative flex h-full min-h-80 flex-col justify-between">
              <span>
                <span className="text-xs font-semibold uppercase tracking-[0.32em] text-white/35">
                  Nổi bật
                </span>
                <div className="mt-10 flex min-h-24 items-center justify-center">
                  <BrandMark id={heroBrand.id} name={heroBrand.name} />
                </div>
                <h2 className="mt-8 text-2xl font-bold tracking-wider">
                  {heroBrand.name}
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/56">
                  {BRAND_DETAILS[0].description}
                </p>
              </span>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#f0c982]">
                Khám phá lot Rolex
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </span>
            </div>
          </Link>
        </section>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BRAND_ITEMS.map((brand, index) => (
            <Link
              key={brand.id}
              href={`/storefront?brand=${brand.id}`}
              className="group min-h-64 rounded-2xl border border-white/10 bg-[#070707] p-5 transition-all hover:-translate-y-1 hover:border-[#f0c982]/60"
            >
              <div className="flex h-full flex-col justify-between">
                <span>
                  <div className="flex h-20 items-center justify-center rounded-xl border border-white/10 bg-[var(--luxora-bg-soft)]">
                    <BrandMark id={brand.id} name={brand.name} />
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <span>
                      <h2 className="text-lg font-bold tracking-wider">
                        {brand.name}
                      </h2>
                      <p className="mt-1 text-[11px] uppercase tracking-wider text-[#f0c982]">
                        {BRAND_DETAILS[index].line}
                      </p>
                    </span>
                    <span className="text-right text-xs text-white/40">
                      {BRAND_DETAILS[index].volume}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    {BRAND_DETAILS[index].description}
                  </p>
                </span>
                <span className="mt-6 text-xs font-semibold uppercase tracking-wider text-white/40 transition-colors group-hover:text-[#f0c982]">
                  Xem phiên đấu giá
                </span>
              </div>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
