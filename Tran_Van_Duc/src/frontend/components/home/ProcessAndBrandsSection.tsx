import { AUCTION_PROCESS_STEPS, BRAND_ITEMS } from "@/lib/home-data";

const BRAND_META = [
  "Đồng hồ",
  "Công nghệ",
  "Chế tác đồng hồ cao cấp",
  "Nhà mốt thời trang",
  "Chế tác máy ảnh",
  "Nghe nhìn",
  "Công nghệ sáng tạo",
  "Phòng thu âm thanh",
];

function BrandLogo({ id, name }: { id: string; name: string }) {
  if (id === "rolex") {
    return (
      <div className="flex flex-col items-center gap-2">
        <svg viewBox="0 0 88 34" className="h-9 w-24 text-[#f0c982]" aria-hidden="true">
          <path
            d="M14 28h60l-7 5H21l-7-5Zm8-3L13 9l15 8 7-14 9 16 9-16 7 14 15-8-9 16H22Z"
            fill="currentColor"
          />
        </svg>
        <span className="font-serif text-lg font-bold tracking-[0.26em] text-white">
          ROLEX
        </span>
      </div>
    );
  }

  if (id === "apple") {
    return (
      <div className="flex flex-col items-center gap-2">
        <svg viewBox="0 0 64 64" className="h-10 w-10 text-white" aria-hidden="true">
          <path
            d="M41.5 6.5c-4.1.5-8.9 3.7-10.7 7.2-1.5 2.9-1.2 5.7-.9 6.8 3.9.3 8.2-2.4 10.1-5.6 1.8-3 2.1-6.1 1.5-8.4ZM52.8 46.3c-1.2 2.8-1.8 4-3.3 6.5-2.1 3.6-5.1 8.1-8.8 8.1-3.3 0-4.2-2.1-8.7-2.1-4.5 0-5.7 2.1-8.8 2.2-3.7.1-6.5-4-8.7-7.6-6-10-6.6-21.8-2.9-28.1 2.6-4.5 6.8-7.2 10.7-7.2 4 0 6.5 2.2 9.8 2.2 3.2 0 5.1-2.2 9.7-2.2 3.5 0 7.1 1.9 9.7 5.1-8.5 4.7-7.1 16.8 1.3 20.1Z"
            fill="currentColor"
          />
        </svg>
        <span className="text-sm font-bold tracking-[0.28em] text-white">
          APPLE
        </span>
      </div>
    );
  }

  if (id === "patek") {
    return (
      <div className="flex flex-col items-center gap-2">
        <svg viewBox="0 0 64 64" className="h-10 w-10 text-[#f0c982]" aria-hidden="true">
          <path
            d="M32 5 42 22l17 10-17 10-10 17-10-17L5 32l17-10L32 5Zm0 14-5 9-9 4 9 4 5 9 5-9 9-4-9-4-5-9Z"
            fill="currentColor"
          />
        </svg>
        <span className="text-center font-serif text-[15px] font-bold leading-tight tracking-[0.16em] text-white">
          PATEK
          <br />
          PHILIPPE
        </span>
      </div>
    );
  }

  if (id === "louis-vuitton") {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="font-serif text-4xl font-bold tracking-[0.08em] text-[#f0c982]">
          LV
        </span>
        <span className="text-center text-[11px] font-bold leading-tight tracking-[0.22em] text-white">
          LOUIS
          <br />
          VUITTON
        </span>
      </div>
    );
  }

  if (id === "leica") {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold italic text-white shadow-[0_0_28px_rgba(220,38,38,0.35)]">
          Leica
        </span>
        <span className="text-sm font-bold tracking-[0.24em] text-white">
          LEICA
        </span>
      </div>
    );
  }

  if (id === "sony") {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="font-serif text-2xl font-bold tracking-[0.22em] text-white">
          SONY
        </span>
        <span className="h-px w-14 bg-[#f0c982]/60" />
      </div>
    );
  }

  if (id === "dji") {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-3xl font-black italic tracking-[0.04em] text-white">
          dji
        </span>
        <span className="text-[9px] font-bold tracking-[0.35em] text-[#f0c982]">
          AERIAL
        </span>
      </div>
    );
  }

  if (id === "bose") {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-3xl font-black italic tracking-[0.06em] text-white">
          BOSE
        </span>
        <span className="h-px w-16 bg-[#f0c982]/60" />
      </div>
    );
  }

  return (
    <span className="text-center text-sm font-bold tracking-[0.18em] text-white">
      {name}
    </span>
  );
}

export default function ProcessAndBrandsSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(240,201,130,0.08),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(255,255,255,0.05),transparent_28%)]" />
      <div className="relative mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:px-12">
        <div className="rounded-2xl border border-white/10 bg-black/55 p-5 sm:p-7">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/35">
                Bốn bước
              </p>
              <h2 className="mt-2 text-sm font-semibold tracking-[0.25em] text-[#f0c982]">
                QUY TRÌNH ĐẤU GIÁ
              </h2>
            </div>
            <span className="hidden rounded-full border border-[#d7aa63]/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#f0c982] sm:inline-flex">
              Đã xác minh trực tiếp
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {AUCTION_PROCESS_STEPS.map((step, index) => (
              <div
                key={step.id}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#070707] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f0c982]/55"
              >
                <div className="absolute right-3 top-3 text-4xl font-bold text-white/[0.035]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="relative">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d7aa63]/40 bg-[#f0c982]/10">
                    <span className="material-symbols-outlined text-2xl text-[#f0c982]">
                      {step.icon}
                    </span>
                  </span>
                  <p className="mt-5 text-sm font-bold text-[#f0c982]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-xs font-bold tracking-wider text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-white/52">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/55 p-5 sm:p-7">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/35">
              Kho thương hiệu
            </p>
            <h2 className="mt-2 text-sm font-semibold tracking-[0.25em] text-[#f0c982]">
              BỘ SƯU TẬP THƯƠNG HIỆU
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {BRAND_ITEMS.map((brand, index) => (
              <div
                key={brand.id}
                className="group relative min-h-32 overflow-hidden rounded-xl border border-white/10 bg-[#070707] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f0c982]/55 hover:bg-white/[0.045]"
              >
                <div className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-[#f0c982]/8 blur-xl transition-opacity group-hover:opacity-100" />
                <div className="absolute inset-x-4 top-4 h-px bg-gradient-to-r from-[#f0c982]/55 via-white/10 to-transparent" />
                <div className="relative flex h-full flex-col items-center justify-between pt-4 text-center">
                  <BrandLogo id={brand.id} name={brand.name} />
                  <span className="mt-4 block text-[10px] uppercase tracking-wider text-white/38">
                    {BRAND_META[index]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
