import Link from "next/link";
import { FiArrowRight, FiRadio } from "react-icons/fi";
import type { TrustStat } from "@/lib/home-data";

export default function Hero({ stats }: { stats: TrustStat[] }) {
  return (
    <section className="home-hero relative min-h-[calc(100svh-64px)] overflow-hidden border-b border-white/10 sm:min-h-[calc(100svh-80px)]">
      <div className="home-hero__background absolute inset-0" aria-hidden="true" />
      <div
        className="home-hero__overlay-horizontal absolute inset-0"
        aria-hidden="true"
      />
      <div
        className="home-hero__overlay-vertical absolute inset-0"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-[1920px] items-center px-4 py-12 sm:min-h-[calc(100svh-80px)] sm:px-6 sm:py-16 lg:px-12 lg:py-20">
        <div className="w-full max-w-3xl">
          <p className="home-hero__eyebrow text-[10px] font-semibold tracking-[0.34em] text-[#b47a20] sm:text-xs sm:tracking-[0.5em]">
            NHÀ ĐẤU GIÁ CAO CẤP
          </p>

          <h1 className="mt-7 max-w-2xl text-4xl font-bold leading-[1.08] tracking-[0.02em] text-white sm:mt-9 sm:text-6xl lg:text-7xl">
            NƠI GIÁ TRỊ
            <br />
            ĐƯỢC TÔN VINH
          </h1>

          <p className="mt-7 max-w-lg text-sm leading-7 text-white/72 sm:mt-8 sm:text-base sm:leading-8">
            Khám phá những vật phẩm tuyển chọn, được kiểm định minh bạch và
            đấu giá trực tuyến trong một không gian xứng tầm giá trị thật.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link
              href="/storefront"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f0c982] px-7 py-3.5 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:bg-[#f4d79b] hover:shadow-lg"
            >
              KHÁM PHÁ NGAY
              <FiArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/auctions"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7aa63]/70 bg-black/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/10"
            >
              <FiRadio className="h-4 w-4" aria-hidden="true" />
              XEM PHIÊN LIVE
            </Link>
          </div>

          <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 sm:mt-16 sm:grid-cols-4 sm:gap-x-8">
            {stats.map((stat) => (
              <div key={stat.id}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-xl font-bold text-white sm:text-2xl">
                  {stat.value}
                </dd>
                <dd className="mt-1 text-xs leading-snug text-white/55">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
