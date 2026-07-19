import Image from "next/image";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import LiveChat from "@/components/feature/LiveChat";
import StorefrontData from "@/app/storefront/StorefrontData";
import StorefrontDataFallback from "@/app/storefront/StorefrontDataFallback";

export default async function AuctionsPage() {
  const t = await getTranslations("auctionsPage");

  return (
    <div className="luxora-app flex min-h-screen flex-col bg-black text-white">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        <section className="glass-card relative min-h-[280px] overflow-hidden rounded-3xl border border-white/10 bg-[#030303]">
          <Image
            src="/images/luxury-watch-hero-lcp.webp"
            alt={t("imageAlt")}
            fill
            priority
            sizes="(min-width: 768px) calc(100vw - 16rem), 100vw"
            className="object-cover object-[70%_center] opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_42%,rgba(240,201,130,0.16),transparent_36%)]" />
          <div className="relative z-10 flex max-w-3xl flex-col gap-5 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[var(--luxora-gold)]">
              {t("badge")}
            </p>
            <h1 className="font-display-lg text-3xl leading-tight sm:text-5xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/60">
              {t("desc")}
            </p>
          </div>
        </section>

        <Suspense fallback={<StorefrontDataFallback />}>
          <StorefrontData basePath="/auctions" />
        </Suspense>
        </div>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
}
