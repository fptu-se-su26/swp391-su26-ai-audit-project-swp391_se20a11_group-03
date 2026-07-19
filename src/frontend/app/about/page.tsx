import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { DEFAULT_PUBLIC_STATS, WHY_CHOOSE_FEATURES } from "@/lib/home-data";

export default async function AboutPage() {
  const t = await getTranslations("about");
  const tWhy = await getTranslations("why");
  const tStats = await getTranslations("stats");

  const OPERATIONS = [
    t("operations.0"), t("operations.1"),
    t("operations.2"), t("operations.3"),
  ];

  const TIMELINE = [
    { year: t("timeline.0.year"), title: t("timeline.0.title"), text: t("timeline.0.text") },
    { year: t("timeline.1.year"), title: t("timeline.1.title"), text: t("timeline.1.text") },
    { year: t("timeline.2.year"), title: t("timeline.2.title"), text: t("timeline.2.text") },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10">
          <Image
            src="/images/luxury-watch-hero.webp"
            alt="BidZone luxury auction house"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/30" />
          <div className="relative mx-auto grid max-w-[1600px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#f0c982]">
                {t("badge")}
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
                {t("heroTitle")}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/64">
                {t("heroDesc")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 self-end">
              {DEFAULT_PUBLIC_STATS.map((stat) => (
                <div key={stat.id} className="rounded-xl border border-white/10 bg-black/45 p-5 backdrop-blur">
                  <p className="text-3xl font-bold text-[#f0c982]">{stat.value}</p>
                  <p className="mt-2 text-sm text-white/55">
                    {tStats(stat.id as Parameters<typeof tStats>[0])}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Operations + Why */}
        <section className="mx-auto grid max-w-[1600px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-12">
          <div className="rounded-2xl border border-[#d7aa63]/30 bg-[radial-gradient(circle_at_20%_20%,rgba(240,201,130,0.12),transparent_35%),#050505] p-6 sm:p-8">
            <p className="text-sm font-semibold tracking-[0.25em] text-[#f0c982]">
              {t("operationsBadge")}
            </p>
            <h2 className="mt-4 text-3xl font-bold">{t("operationsTitle")}</h2>
            <div className="mt-8 space-y-4">
              {OPERATIONS.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d7aa63]/40 text-sm font-bold text-[#f0c982]">
                    {index + 1}
                  </span>
                  <p className="pt-2 text-sm leading-relaxed text-white/65">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {WHY_CHOOSE_FEATURES.map((feature) => (
              <div key={feature.id} className="rounded-2xl border border-white/10 bg-[#070707] p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d7aa63]/35 bg-[#f0c982]/10">
                  <span className="material-symbols-outlined text-2xl text-[#f0c982]">{feature.icon}</span>
                </span>
                <h3 className="mt-5 text-sm font-bold tracking-wider">
                  {tWhy(`features.${feature.id}.title` as Parameters<typeof tWhy>[0])}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {tWhy(`features.${feature.id}.description` as Parameters<typeof tWhy>[0])}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-12">
            <p className="text-sm font-semibold tracking-[0.25em] text-[#f0c982]">
              {t("timelineBadge")}
            </p>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {TIMELINE.map((item) => (
                <div key={item.year} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-3xl font-bold text-[#f0c982]">{item.year}</p>
                  <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
