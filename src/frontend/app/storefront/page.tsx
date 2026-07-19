import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import StorefrontData from "./StorefrontData";
import StorefrontDataFallback from "./StorefrontDataFallback";

function StorefrontHero() {
  const t = useTranslations("storefront");
  return (
    <section className="glass-card relative min-h-[260px] overflow-hidden rounded-3xl border border-white/10 bg-[#030303]">
      <Image
        src="/images/luxury-watch-hero-lcp.webp"
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
          {t("heroTitle")}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-white/55">
          {t("heroDesc")}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/watchlist"
            className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold hover:bg-white/10"
          >
            {t("watchlist")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function StorefrontPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header />
      <main className="flex-1">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
          <StorefrontHero />
          <Suspense fallback={<StorefrontDataFallback />}>
            <StorefrontData />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
