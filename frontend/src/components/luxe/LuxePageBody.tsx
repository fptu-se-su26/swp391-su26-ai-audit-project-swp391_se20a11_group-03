"use client";

import Link from "next/link";
import { useMemo } from "react";
import LuxeNav from "@/components/luxe/LuxeNav";
import LuxeProductFeed from "@/components/luxe/LuxeProductFeed";
import LuxeHeroCTA from "@/components/luxe/LuxeHeroCTA";
import { Eyebrow, GoldButton, OutlineButton } from "@/components/luxe/primitives";
import { displayFont } from "@/components/luxe/theme";
import { useTranslations } from "@/i18n/I18nProvider";

function Logo() {
  return (
    <Link href="/luxe" className="flex items-center gap-4" aria-label="Luxora Auction House">
      <span className={`${displayFont} text-4xl font-semibold leading-none tracking-[-0.08em] text-[#ddb76a]`}>LA</span>
      <span className="leading-none">
        <span className={`${displayFont} block text-[22px] font-semibold tracking-[0.34em] text-[#f5ead9]`}>LUXORA</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.42em] text-[#c7b79c]">Auction House</span>
      </span>
    </Link>
  );
}

export default function LuxePageBody() {
  const t = useTranslations("luxe");

  const stats = useMemo(
    () => [
      { icon: "gavel", value: "10,000+", label: t("statItems") },
      { icon: "groups", value: "50,000+", label: t("statMembers") },
      { icon: "emoji_events", value: "98%", label: t("statSuccess") },
      { icon: "verified_user", value: "100%", label: t("statTrust") },
    ],
    [t],
  );

  const categories = useMemo(
    () => [
      { icon: "diamond", title: t("catJewelry"), count: t("categoryLabel") },
      { icon: "watch", title: t("catWatches"), count: t("categoryLabel") },
      { icon: "shopping_bag", title: t("catBags"), count: t("categoryLabel") },
      { icon: "wine_bar", title: t("catWine"), count: t("categoryLabel") },
      { icon: "crop_original", title: t("catArt"), count: t("categoryLabel") },
      { icon: "workspace_premium", title: t("catCollectibles"), count: t("categoryLabel") },
    ],
    [t],
  );

  const processSteps = useMemo(
    () => [
      { icon: "person_add", title: t("process1Title"), text: t("process1Text") },
      { icon: "fact_check", title: t("process2Title"), text: t("process2Text") },
      { icon: "gavel", title: t("process3Title"), text: t("process3Text") },
      { icon: "local_shipping", title: t("process4Title"), text: t("process4Text") },
    ],
    [t],
  );

  const trustItems = useMemo(
    () => [
      { value: "24/7", label: t("trust1Label") },
      { value: "100%", label: t("trust2Label") },
      { value: "72h", label: t("trust3Label") },
    ],
    [t],
  );

  const journalPosts = useMemo(
    () => [
      { title: t("journal1"), date: "12.07.2026", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=900&auto=format&fit=crop" },
      { title: t("journal2"), date: "09.07.2026", image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=900&auto=format&fit=crop" },
      { title: t("journal3"), date: "04.07.2026", image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=900&auto=format&fit=crop" },
    ],
    [t],
  );

  const footerColumns = useMemo(
    () => [
      { title: t("footerCategories"), links: [t("footerLinkWatches"), t("footerLinkJewelry"), t("footerLinkBags"), t("footerLinkWine"), t("footerLinkArt")] },
      { title: t("footerServices"), links: [t("footerLive"), t("footerAuth"), t("footerConsign"), t("footerAdvisory")] },
      { title: t("footerSupport"), links: [t("footerGuide"), t("footerPrivacy"), t("footerTerms"), t("footerContact")] },
    ],
    [t],
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#070706] text-[#f5ead9]">
      <LuxeNav />

      <header className="relative min-h-[760px] border-b border-white/10 px-5 pb-28 pt-28 md:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgba(212,170,97,0.22),transparent_30%),linear-gradient(90deg,#070706_0%,rgba(7,7,6,0.9)_38%,rgba(7,7,6,0.22)_68%,#070706_100%)]" />
        <div className="absolute inset-y-20 right-0 hidden w-[58%] bg-[url('https://images.unsplash.com/photo-1639006570490-79c0c53f1080?q=80&w=1500&auto=format&fit=crop')] bg-cover bg-center opacity-90 mix-blend-screen lg:block" />
        <div className="absolute inset-y-20 right-0 hidden w-[58%] bg-gradient-to-r from-[#070706] via-transparent to-[#070706]/60 lg:block" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#17130d] to-transparent" />

        <div className="relative z-10 mx-auto grid max-w-[1500px] grid-cols-1 gap-8 lg:grid-cols-[1fr_0.9fr_70px]">
          <div className="pt-16 lg:pt-28">
            <Eyebrow>{t("heroEyebrow")}</Eyebrow>
            <h1 className={`${displayFont} max-w-[680px] text-[54px] font-medium uppercase leading-[1.08] text-white md:text-[88px] xl:text-[96px]`}>
              {t("heroTitle1")} <span className="block bg-gradient-to-r from-[#e7c57c] to-[#9f722d] bg-clip-text text-transparent">{t("heroTitle2")}</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#b7aea3]">{t("heroDesc")}</p>
            <LuxeHeroCTA />

            <div className="mt-12 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-4 border-r border-white/10 last:border-r-0">
                  <span className="material-symbols-outlined text-3xl text-[#d4aa61]">{stat.icon}</span>
                  <div>
                    <strong className={`${displayFont} block text-2xl font-medium text-[#efcf88]`}>{stat.value}</strong>
                    <p className="text-sm text-[#b7aea3]">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[560px] lg:block">
            <div className="absolute bottom-0 right-0 h-32 w-[620px] rounded-[50%] bg-black/50 blur-xl" />
            <div className="absolute bottom-3 right-4 h-28 w-[560px] rounded-t-[50%] border border-white/10 bg-gradient-to-b from-[#211b14] to-[#080807]" />
          </div>

          <aside className="hidden items-center justify-center lg:flex">
            <div className="space-y-7 text-center text-lg text-[#cfc6ba]">
              {["01", "02", "03", "04"].map((slide, index) => (
                <div key={slide} className={index === 0 ? "text-[#d4aa61]" : ""}>
                  <span className="block">{slide}</span>
                  {index === 0 && <span className="mx-auto mt-3 block h-7 w-px bg-[#d4aa61]" />}
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="relative z-10 mx-auto mt-12 max-w-[1500px] rounded-lg border border-white/10 bg-[#0b0b0a]/82 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur">
          <div className="grid grid-cols-2 gap-y-8 md:grid-cols-3 xl:grid-cols-6">
            {categories.map((category) => (
              <Link
                href="/browse"
                key={category.title}
                className="flex min-h-28 flex-col items-center justify-center border-white/10 text-center transition hover:text-[#d4aa61] md:border-r md:last:border-r-0"
              >
                <span className="material-symbols-outlined mb-4 text-4xl text-[#d4aa61]">{category.icon}</span>
                <strong className={`${displayFont} text-lg font-semibold uppercase tracking-[0.12em] text-white`}>{category.title}</strong>
                <span className="mt-2 text-sm text-[#b7aea3]">{category.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      <LuxeProductFeed />

      <section className="border-t border-white/10 bg-[linear-gradient(180deg,#11100d,#070706)] px-5 py-20 md:px-12">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow>{t("processSectionEyebrow")}</Eyebrow>
            <h2 className={`${displayFont} text-4xl font-medium leading-tight text-white md:text-6xl`}>{t("processSectionTitle")}</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#b7aea3]">{t("processSectionDesc")}</p>
            <div className="mt-9 grid grid-cols-3 gap-4">
              {trustItems.map((item) => (
                <div key={item.label} className="border-l border-[#d4aa61]/50 pl-5">
                  <strong className={`${displayFont} block text-3xl font-medium text-[#efcf88]`}>{item.value}</strong>
                  <p className="mt-2 text-sm leading-6 text-[#b7aea3]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {processSteps.map((step, index) => (
              <article key={step.title} className="relative overflow-hidden rounded-md border border-white/10 bg-white/[0.035] p-7">
                <span className={`${displayFont} absolute right-6 top-5 text-5xl text-white/[0.04]`}>0{index + 1}</span>
                <span className="grid h-12 w-12 place-items-center rounded-full border border-[#d4aa61]/60 text-[#d4aa61]">
                  <span className="material-symbols-outlined">{step.icon}</span>
                </span>
                <h3 className={`${displayFont} mt-7 text-2xl font-medium text-white`}>{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#b7aea3]">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/10 px-5 py-24 md:px-12">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#070706_0%,rgba(7,7,6,0.9)_42%,rgba(7,7,6,0.34)),url('https://images.unsplash.com/photo-1545987796-200677ee1011?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="relative z-10 mx-auto max-w-[1500px]">
          <div className="max-w-2xl">
            <Eyebrow>{t("membershipEyebrow")}</Eyebrow>
            <h2 className={`${displayFont} text-4xl font-medium leading-tight text-white md:text-6xl`}>{t("membershipTitle")}</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#d8d0c6]">{t("membershipDesc")}</p>
            <div className="mt-9 flex flex-wrap gap-5">
              <GoldButton href="/browse">
                {t("viewMarketplace")} <span className="material-symbols-outlined text-base">arrow_forward_ios</span>
              </GoldButton>
              <OutlineButton href="/auth?mode=signup">{t("memberSignup")}</OutlineButton>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0b0a09] px-5 py-20 md:px-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>{t("journalEyebrow")}</Eyebrow>
              <h2 className={`${displayFont} text-4xl font-medium leading-tight text-white md:text-5xl`}>{t("journalTitle")}</h2>
            </div>
            <Link href="/upcoming" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#d4aa61]">
              {t("viewAllArticles")} <span className="material-symbols-outlined text-base">arrow_forward_ios</span>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {journalPosts.map((post) => (
              <article key={post.title} className="group overflow-hidden rounded-md border border-white/10 bg-[#11100d]">
                <div className="h-56 overflow-hidden">
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d4aa61]">{post.date}</p>
                  <h3 className={`${displayFont} mt-3 min-h-20 text-2xl font-medium leading-tight text-white`}>{post.title}</h3>
                  <Link href="/browse" className="mt-6 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#d4aa61]">
                    {t("browseMarketplace")} <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer id="about" className="border-t border-white/10 bg-[#050504] px-5 py-16 md:px-12 scroll-mt-24">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.35fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#9d948a]">{t("footerAbout")}</p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#d4aa61]">{column.title}</h3>
              <ul className="space-y-3 text-sm text-[#9d948a]">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link href="/browse" className="transition hover:text-[#d4aa61]">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#d4aa61]">{t("newsletterTitle")}</h3>
            <p className="text-sm leading-7 text-[#9d948a]">{t("newsletterDesc")}</p>
            <form className="mt-6 flex overflow-hidden rounded border border-white/10 bg-[#0c0b0a]">
              <input className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-[#6f675e]" placeholder={t("newsletterPlaceholder")} type="email" />
              <button className="grid w-14 place-items-center bg-[#d4aa61] text-[#100d08]" aria-label={t("newsletterAria")} type="button">
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-[1500px] flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#756d64] md:flex-row">
          <p>{t("footerCopyright")}</p>
          <p>{t("footerTagline")}</p>
        </div>
      </footer>
    </main>
  );
}
