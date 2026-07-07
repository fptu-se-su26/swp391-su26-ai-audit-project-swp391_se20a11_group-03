import Image from "next/image";
import Link from "next/link";
import { CATEGORY_ITEMS } from "@/lib/home-data";

export default function CategorySection() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#f0c982]">
            DANH MỤC NỔI BẬT
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl">
            Bộ lọc dành cho người mua nghiêm túc
          </h2>
        </div>
        <Link
          href="/storefront"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d7aa63]/45 px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/10"
        >
          Xem toàn bộ lot
          <span className="material-symbols-outlined text-base">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORY_ITEMS.map((category) => (
          <Link
            key={category.id}
            href={`/storefront?category=${category.id}`}
            className="group overflow-hidden rounded-lg border border-white/10 bg-[#050505] transition-all duration-300 hover:-translate-y-1 hover:border-[#f0c982]/60 hover:shadow-[0_18px_55px_rgba(240,201,130,0.11)]"
          >
            <div className="relative aspect-[1.12/1] bg-black">
              <Image
                src={category.imageSrc}
                alt={category.label}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain p-8 transition-transform duration-300 group-hover:scale-105 sm:p-10"
              />
              <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#d7aa63]/60 bg-black/70 sm:left-4 sm:top-4">
                <span className="material-symbols-outlined text-[20px] text-[#f0c982]">
                  {category.icon}
                </span>
              </span>
            </div>
            <div className="border-t border-white/[0.04] bg-[#080808] p-4">
              <div className="flex items-start justify-between gap-4">
                <h3 className="pt-1 text-sm font-bold tracking-wide text-white">
                  {category.label}
                </h3>
                <span className="shrink-0 text-right">
                  <span className="block text-lg font-bold leading-none text-[#f0c982]">
                    {category.count}
                  </span>
                  <span className="mt-1 block text-[9px] uppercase tracking-wider text-white/35">
                    lot
                  </span>
                </span>
              </div>
              <p className="mt-3 min-h-10 text-[11px] leading-relaxed text-white/62">
                {category.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
