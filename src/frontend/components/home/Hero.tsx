import Link from "next/link";
import { FiArrowRight, FiRadio } from "react-icons/fi";
import type { TrustStat } from "@/lib/home-data";

const SLIDE_NUMBERS = ["01", "02", "03", "04"];

export default function Hero({ stats }: { stats: TrustStat[] }) {
  return (
    <section className="home-hero-bg relative min-h-[calc(100svh-64px)] overflow-hidden border-b border-white/10 sm:min-h-[calc(100svh-80px)]">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20 sm:via-black/70 sm:to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/20" />

      <div className="relative mx-auto grid min-h-[calc(100svh-64px)] w-full max-w-[1920px] grid-cols-1 px-4 pb-8 pt-12 sm:min-h-[calc(100svh-80px)] sm:px-6 sm:pb-10 sm:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-14 lg:pt-24">
        <div className="flex flex-col justify-end">
          <span className="text-[10px] font-semibold tracking-[0.32em] text-[#f0c982] sm:text-xs sm:tracking-[0.5em]">
            LUXURY AUCTION HOUSE
          </span>
          <h1 className="mt-8 max-w-2xl text-4xl font-bold leading-[1.14] tracking-[0.035em] text-white sm:mt-9 sm:text-6xl sm:tracking-[0.045em] lg:text-7xl">
            NƠI GIÁ TRỊ
            <br />
            ĐƯỢC TÔN VINH
          </h1>
          <p className="mt-8 max-w-md text-sm leading-7 tracking-[0.015em] text-white/72 sm:mt-9 sm:text-base sm:leading-8">
            Khám phá những sản phẩm đẳng cấp, công nghệ, hiếm có từ các thương
            hiệu hàng đầu thế giới. Đấu giá live mỗi ngày với mức giá tốt nhất.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:mt-11 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link
              href="/storefront"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f0c982] px-7 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-[#f4d79b]"
            >
              KHÁM PHÁ NGAY
              <FiArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/storefront"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7aa63]/60 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <FiRadio className="h-4 w-4" aria-hidden="true" />
              XEM PHIÊN LIVE
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-5 gap-y-6 sm:mt-16 sm:grid-cols-4 sm:gap-x-8 sm:gap-y-8">
            {stats.map((stat) => (
              <div key={stat.id}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-xl font-bold text-white sm:text-2xl">{stat.value}</dd>
                <dd className="mt-1 text-xs leading-snug text-white/55">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute right-0 top-8 flex flex-col items-center gap-4 text-xs text-white/45">
            {SLIDE_NUMBERS.map((num, i) => (
              <span
                key={num}
                className={
                  i === 0
                    ? "border-b border-[#f0c982] pb-2 font-semibold text-white"
                    : undefined
                }
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
