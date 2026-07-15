import Image from "next/image";
import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import CategoriesGrid from "./CategoriesGrid";
import { DEFAULT_PUBLIC_STATS, WHY_CHOOSE_FEATURES } from "@/lib/home-data";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10">
          <Image
            src="/images/luxury-watch-hero.webp"
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
                {DEFAULT_PUBLIC_STATS.map((stat) => (
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
            <div className="hidden lg:block" aria-hidden="true" />
          </div>
        </section>

        <CategoriesGrid />

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
