import { getTranslations } from "next-intl/server";
import { AUCTION_PROCESS_STEPS, BRAND_ITEMS } from "@/lib/home-data";

function BrandLogo({ id, name }: { id: string; name: string }) {
  if (id === "rolex") {
    return (
      <div className="flex flex-col items-center gap-2">
        <svg viewBox="0 0 88 34" className="h-9 w-24 text-[#f0c982]" aria-hidden="true">
          <path
            d="M14 28h60l-7 5H21l-7-5Zm8-3L13 9l15 8 7-14 9 16 9-16 7 14 15-8-9 16H22Z"
            fill="currentColor"
          />
        </svg>
        <span className="font-serif text-lg font-bold tracking-[0.26em] text-white">
          ROLEX
        </span>
      </div>
    );
  }

  if (id === "apple") {
    return (
      <div className="flex flex-col items-center gap-2">
        <svg viewBox="0 0 64 64" className="h-10 w-10 text-white" aria-hidden="true">
          <path
            d="M41.5 6.5c-4.1.5-8.9 3.7-10.7 7.2-1.5 2.9-1.2 5.7-.9 6.8 3.9.3 8.2-2.4 10.1-5.6 1.8-3 2.1-6.1 1.5-8.4ZM52.8 46.3c-1.2 2.8-1.8 4-3.3 6.5-2.1 3.6-5.1 8.1-8.8 8.1-3.3 0-4.2-2.1-8.7-2.1-4.5 0-5.7 2.1-8.8 2.2-3.7.1-6.5-4-8.7-7.6-6-10-6.6-21.8-2.9-28.1 2.6-4.5 6.8-7.2 10.7-7.2 4 0 6.5 2.2 9.8 2.2 3.2 0 5.1-2.2 9.7-2.2 3.5 0 7.1 1.9 9.7 5.1-8.5 4.7-7.1 16.8 1.3 20.1Z"
            fill="currentColor"
          />
        </svg>
        <span className="text-sm font-bold tracking-[0.28em] text-white">
          APPLE
        </span>
      </div>
    );
  }

  if (id === "patek") {
    return (
      <div className="flex flex-col items-center gap-2">
        <svg viewBox="0 0 64 64" className="h-10 w-10 text-[#f0c982]" aria-hidden="true">
          <path
            d="M32 5 42 22l17 10-17 10-10 17-10-17L5 32l17-10L32 5Zm0 14-5 9-9 4 9 4 5 9 5-9 9-4-9-4-5-9Z"
            fill="currentColor"
          />
        </svg>
        <span className="text-center font-serif text-[15px] font-bold leading-tight tracking-[0.16em] text-white">
          PATEK
          <br />
          PHILIPPE
        </span>
      </div>
    );
  }

  if (id === "louis-vuitton") {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="font-serif text-4xl font-bold tracking-[0.08em] text-[#f0c982]">
          LV
        </span>
        <span className="text-center text-[11px] font-bold leading-tight tracking-[0.22em] text-white">
          LOUIS
          <br />
          VUITTON
        </span>
      </div>
    );
  }

  if (id === "leica") {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="theme-dark-content flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold italic text-white shadow-[0_0_28px_rgba(220,38,38,0.35)]">
          Leica
        </span>
        <span className="text-sm font-bold tracking-[0.24em] text-white">
          LEICA
        </span>
      </div>
    );
  }

  if (id === "sony") {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="font-serif text-2xl font-bold tracking-[0.22em] text-white">
          SONY
        </span>
        <span className="h-px w-14 bg-[#f0c982]/60" />
      </div>
    );
  }

  if (id === "dji") {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-3xl font-black italic tracking-[0.04em] text-white">
          dji
        </span>
        <span className="text-[9px] font-bold tracking-[0.35em] text-[#f0c982]">
          AERIAL
        </span>
      </div>
    );
  }

  if (id === "bose") {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-3xl font-black italic tracking-[0.06em] text-white">
          BOSE
        </span>
        <span className="h-px w-16 bg-[#f0c982]/60" />
      </div>
    );
  }

  return (
    <span className="text-center text-sm font-bold tracking-[0.18em] text-white">
      {name}
    </span>
  );
}

export default async function ProcessAndBrandsSection() {
  const t = await getTranslations("process");
  const introTitle = t("introTitle").split("\n");

  return (
    <section id="how-it-works" className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_15%,rgba(240,201,130,0.09),transparent_25%),radial-gradient(circle_at_92%_75%,rgba(240,201,130,0.06),transparent_24%)]" />
      <div className="relative mx-auto max-w-[1600px] px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--luxora-gold)]">
              {t("introBadge")}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
              {introTitle[0]}
              <br className="hidden sm:block" /> {introTitle[1]}
            </h2>
          </div>
          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-sm leading-7 text-white/60 sm:text-base">
              {t("introDesc")}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#d7aa63]/30 bg-[#f0c982]/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--luxora-gold)]">
              <span className="material-symbols-outlined text-base">verified</span>
              {t("transparentProcess")}
            </div>
          </div>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-[28px] border border-white/10 bg-[var(--luxora-bg-elevated)] shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {AUCTION_PROCESS_STEPS.map((step, index) => (
            <article
              key={step.id}
              className="group relative min-h-64 border-b border-white/10 p-6 transition-colors hover:bg-[#f0c982]/[0.045] sm:p-8 lg:border-b-0 lg:border-r last:border-0"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7aa63]/30 bg-[#f0c982]/10 text-[var(--luxora-gold)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
                  <span className="material-symbols-outlined text-2xl">
                    {step.icon}
                  </span>
                </span>
                <span className="font-serif text-4xl text-white/10">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="mt-12">
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--luxora-gold)]">
                  {t("stepLabel", { number: index + 1 })}
                </p>
                <h3 className="mt-3 text-base font-bold text-white">
                  {t(`steps.${step.id}.title` as Parameters<typeof t>[0])}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/55">
                  {t(`steps.${step.id}.description` as Parameters<typeof t>[0])}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--luxora-gold)]">
              {t("curatedBadge")}
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">
              {t("curatedTitle")}
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-white/55">
            {t("curatedDesc")}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 overflow-hidden rounded-[28px] border border-white/10 bg-[var(--luxora-bg-elevated)] sm:grid-cols-4 lg:grid-cols-8">
          {BRAND_ITEMS.map((brand, index) => (
            <div
              key={brand.id}
              className="group relative flex min-h-44 flex-col items-center justify-center border-b border-r border-white/10 p-4 text-center transition-colors hover:bg-[#f0c982]/[0.05]"
            >
              <div className="absolute inset-x-6 top-0 h-px origin-left scale-x-0 bg-[var(--luxora-gold)] transition-transform duration-300 group-hover:scale-x-100" />
              <BrandLogo id={brand.id} name={brand.name} />
              <span className="mt-5 block text-[9px] uppercase tracking-[0.12em] text-white/38">
                {t(`brandMeta.${index}` as Parameters<typeof t>[0])}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
