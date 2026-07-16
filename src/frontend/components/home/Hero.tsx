"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight, FiRadio } from "react-icons/fi";
import type { TrustStat } from "@/lib/home-data";

const HERO_SLIDES = [
  {
    number: "01",
    eyebrow: "LUXURY AUCTION HOUSE",
    title: ["NƠI GIÁ TRỊ", "ĐƯỢC TÔN VINH"],
    description:
      "Khám phá những sản phẩm đẳng cấp, hiếm có từ các thương hiệu hàng đầu thế giới.",
    image: "/images/luxury-watch-hero-lcp.webp",
    position: "center",
  },
  {
    number: "02",
    eyebrow: "ĐỒNG HỒ DANH TIẾNG",
    title: ["TUYỆT TÁC", "VƯỢT THỜI GIAN"],
    description:
      "Những mẫu đồng hồ được tuyển chọn kỹ lưỡng, minh bạch hồ sơ và nguồn gốc.",
    image: "/images/auction-products/rolex-daytona.png",
    position: "68% center",
  },
  {
    number: "03",
    eyebrow: "CÔNG NGHỆ SƯU TẦM",
    title: ["KHOẢNH KHẮC", "ĐÁNG GIÁ"],
    description:
      "Máy ảnh và thiết bị công nghệ cao cấp dành cho những nhà sưu tầm tinh tế.",
    image: "/images/auction-products/leica-m11.png",
    position: "70% center",
  },
  {
    number: "04",
    eyebrow: "PHIÊN ĐẤU GIÁ MỖI NGÀY",
    title: ["CHỌN SẢN PHẨM", "ĐẶT GIÁ CỦA BẠN"],
    description:
      "Theo dõi phiên live, kiểm tra điều kiện và tham gia đấu giá ngay trên BidZone.",
    image: "/images/auction-products/macbook-pro-m3-max.png",
    position: "72% center",
  },
] as const;

export default function Hero({ stats }: { stats: TrustStat[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = HERO_SLIDES[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[calc(100svh-64px)] overflow-hidden border-b border-white/10 sm:min-h-[calc(100svh-80px)]">
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={slide.number}
          aria-hidden="true"
          className={`absolute inset-0 bg-cover transition-all duration-700 ease-out ${
            index === activeIndex ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
          }`}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundPosition: slide.position,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/25 sm:via-black/72 sm:to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/20" />

      <div className="relative mx-auto grid min-h-[calc(100svh-64px)] w-full max-w-[1920px] grid-cols-1 px-4 pb-8 pt-12 sm:min-h-[calc(100svh-80px)] sm:px-6 sm:pb-10 sm:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-14 lg:pt-24">
        <div key={activeSlide.number} className="flex flex-col justify-end">
          <span className="text-[10px] font-semibold tracking-[0.32em] text-[#f0c982] sm:text-xs sm:tracking-[0.5em]">
            {activeSlide.eyebrow}
          </span>
          <h1 className="mt-8 max-w-2xl text-4xl font-bold leading-[1.14] tracking-[0.035em] text-white sm:mt-9 sm:text-6xl sm:tracking-[0.045em] lg:text-7xl">
            {activeSlide.title[0]}
            <br />
            {activeSlide.title[1]}
          </h1>
          <p className="mt-8 max-w-md text-sm leading-7 tracking-[0.015em] text-white/72 sm:mt-9 sm:text-base sm:leading-8">
            {activeSlide.description} Đấu giá trực tuyến mỗi ngày với quy trình rõ ràng và an toàn.
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
              href="/auctions"
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
                <dd className="mt-1 text-xs leading-snug text-white/55">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute right-0 top-8 flex flex-col items-center gap-3 text-xs">
            {HERO_SLIDES.map((slide, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={slide.number}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Hiển thị sản phẩm ${slide.number}`}
                  aria-current={active ? "true" : undefined}
                  className={`min-w-9 border-b py-2 text-center transition-all ${
                    active
                      ? "border-[#f0c982] font-semibold text-white"
                      : "border-transparent text-white/40 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {slide.number}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
