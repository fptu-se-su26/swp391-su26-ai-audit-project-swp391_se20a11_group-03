import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

const COLLECTIONS = [
  {
    id: "watches",
    image: "/images/backgrounds/auction-bg-watch.png",
    className: "min-h-[420px] lg:min-h-[570px]",
    imageClassName: "object-cover object-center",
  },
  {
    id: "technology",
    image: "/images/backgrounds/auction-bg-phone.png",
    className: "min-h-[270px] sm:col-span-2",
    imageClassName: "object-cover object-center",
  },
  {
    id: "cameras",
    image: "/images/auction-products/leica-m11.png",
    className: "min-h-[280px]",
    imageClassName: "object-contain object-[72%_center] p-6",
  },
  {
    id: "audio",
    image: "/images/auction-products/airpods-max.png",
    className: "min-h-[280px]",
    imageClassName: "object-contain object-[72%_center] p-6",
  },
];

const STANDARDS = [
  {
    id: "itemProfile",
    icon: "fact_check",
  },
  {
    id: "controlledDeposit",
    icon: "account_balance_wallet",
  },
  {
    id: "history",
    icon: "history",
  },
  {
    id: "security",
    icon: "shield_lock",
  },
];

const FAQ_ITEMS = [
  "beforeBidding",
  "liveAuction",
  "deposit",
  "watchlist",
  "selling",
  "support",
] as const;

export default async function HomeDiscoverySections() {
  const t = await getTranslations("homeDiscovery");
  const collections = COLLECTIONS.map((item) => ({
    ...item,
    title: t(`collections.${item.id}.title` as Parameters<typeof t>[0]),
    description: t(`collections.${item.id}.description` as Parameters<typeof t>[0]),
    eyebrow: t(`collections.${item.id}.eyebrow` as Parameters<typeof t>[0]),
  }));
  return (
    <>
      <section id="collections" className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--luxora-gold)]">
                {t("collectionsBadge")}
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
                {t("collectionsTitle.0")}
                <br className="hidden sm:block" /> {t("collectionsTitle.1")}
              </h2>
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-7 text-white/60 sm:text-base">
                {t("collectionsDesc")}
              </p>
              <Link
                href="/categories"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxora-gold)] transition-colors hover:text-[var(--luxora-gold-light)]"
              >
                {t("viewCategories")}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
            <CollectionCard item={collections[0]} priority />
            <div className="grid gap-4 sm:grid-cols-2">
              {collections.slice(1).map((item) => (
                <CollectionCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="standards" className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(240,201,130,0.09),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-[1600px] gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:px-12 lg:py-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--luxora-gold)]">
              {t("standardsBadge")}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
              {t("standardsTitle")}
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              {t("standardsDesc")}
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d7aa63]/45 px-6 text-xs font-semibold uppercase tracking-[0.13em] text-white transition-colors hover:bg-[#f0c982] hover:text-black"
            >
              {t("aboutLink")}
              <span className="material-symbols-outlined text-base">north_east</span>
            </Link>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[var(--luxora-bg-elevated)]">
            {STANDARDS.map((item, index) => (
              <article
                key={item.id}
                className="group grid gap-5 border-b border-white/10 p-6 last:border-0 sm:grid-cols-[72px_1fr_auto] sm:items-center sm:p-8"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d7aa63]/30 bg-[#f0c982]/10 text-[var(--luxora-gold)] transition-transform duration-300 group-hover:scale-105">
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </span>
                <div>
                  <h3 className="text-base font-bold text-white sm:text-lg">
                    {t(`standards.${item.id}.title` as Parameters<typeof t>[0])}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                    {t(`standards.${item.id}.description` as Parameters<typeof t>[0])}
                  </p>
                </div>
                <span className="hidden font-serif text-3xl text-white/10 sm:block">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-b border-white/10">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.65fr_1.35fr] lg:px-12 lg:py-24">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--luxora-gold)]">
              {t("faqBadge")}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">
              {t("faqTitle")}
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
              {t("faqDesc")}
            </p>
          </div>

          <div className="grid gap-3">
            {FAQ_ITEMS.map((item, index) => (
              <details
                key={item}
                className="group rounded-2xl border border-white/10 bg-[var(--luxora-bg-elevated)] px-5 py-1 open:border-[#d7aa63]/35 sm:px-7"
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 text-sm font-semibold text-white marker:hidden sm:text-base">
                  <span className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-[var(--luxora-gold)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {t(`faq.${item}.question` as Parameters<typeof t>[0])}
                  </span>
                  <span className="material-symbols-outlined shrink-0 text-xl text-white/40 transition-transform group-open:rotate-45 group-open:text-[var(--luxora-gold)]">
                    add
                  </span>
                </summary>
                <p className="border-t border-white/10 py-5 pl-9 text-sm leading-7 text-white/55 sm:pl-12">
                  {t(`faq.${item}.answer` as Parameters<typeof t>[0])}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function CollectionCard({
  item,
  priority = false,
}: {
  item: (typeof COLLECTIONS)[number] & {
    title: string;
    description: string;
    eyebrow: string;
  };
  priority?: boolean;
}) {
  return (
    <Link
      href="/storefront"
      className={`theme-dark-content theme-dark-surface group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#050505] ${item.className}`}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 55vw, 100vw"
        className={`${item.imageClassName} transition-transform duration-700 group-hover:scale-[1.035]`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/5" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 sm:p-8">
        <div className="max-w-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f0c982]">
            {item.eyebrow}
          </p>
          <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-white/65">
            {item.description}
          </p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur transition-colors group-hover:border-[#f0c982] group-hover:bg-[#f0c982] group-hover:text-black">
          <span className="material-symbols-outlined text-lg">arrow_outward</span>
        </span>
      </div>
    </Link>
  );
}
