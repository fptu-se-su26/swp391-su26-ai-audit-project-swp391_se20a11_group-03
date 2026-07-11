"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CollectorShell from "@/components/layout/CollectorShell";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useTranslations } from "@/i18n/I18nProvider";

type FaqItem = {
  icon: string;
  title: string;
  desc: string;
  href: string;
};

export default function SupportPage() {
  const t = useTranslations("supportPage");
  const [query, setQuery] = useState("");

  const faqs = useMemo<FaqItem[]>(
    () => [
      { icon: "gavel", title: t("buyingTitle"), desc: t("buyingDesc"), href: "/live" },
      { icon: "verified", title: t("faqAuthTitle"), desc: t("faqAuthDesc"), href: "/live" },
      { icon: "payments", title: t("paymentsTitle"), desc: t("paymentsDesc"), href: "/wallet" },
      { icon: "local_shipping", title: t("faqShippingTitle"), desc: t("faqShippingDesc"), href: "/messages" },
      { icon: "storefront", title: t("sellingTitle"), desc: t("sellingDesc"), href: "/become-seller" },
      { icon: "security", title: t("faqSecurityTitle"), desc: t("faqSecurityDesc"), href: "/kyc" },
    ],
    [t],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = faqs.filter(
    (item) =>
      !normalizedQuery ||
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.desc.toLowerCase().includes(normalizedQuery),
  );

  return (
    <CollectorShell>
      <div className="mx-auto max-w-[1260px] space-y-7 px-4 py-10 sm:px-7 lg:px-10 lg:py-14">
        <DashboardHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <section className="rounded-[28px] border border-white/10 bg-[#0c0b09] p-6 text-white shadow-[0_22px_60px_rgba(0,0,0,.35)] sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#d9bc72]">{t("helpPrompt")}</p>
          <h2 className="mt-3 font-display-lg text-2xl font-semibold text-[#fff8df] sm:text-3xl">{t("helpQuestion")}</h2>
          <div className="mt-6 flex max-w-2xl items-center rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 focus-within:border-[#d7b86b]/60 focus-within:ring-2 focus-within:ring-[#d7b86b]/15">
            <span className="material-symbols-outlined text-[#d7b86b]">search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="ml-3 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#80909d]"
            />
          </div>
        </section>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0e0d0b] px-6 py-10 text-center">
            <span className="material-symbols-outlined text-[40px] text-[#9caec0]">search_off</span>
            <p className="mt-3 text-sm text-[#c8bda9]">{t("noResults")}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-white/10 bg-[#0e0d0b] p-5 text-left shadow-[0_8px_28px_rgba(0,0,0,.4)] transition hover:-translate-y-1 hover:border-[#c4a55a] hover:shadow-[0_18px_42px_rgba(0,0,0,.55)]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1a1712] text-[#d4aa61] ring-1 ring-[#c4a55a]/20">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </span>
                <h3 className="mt-4 text-sm font-bold text-[#f5efe3]">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#9caec0]">{item.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#d4aa61]">
                  {t("viewGuide")}
                  <span className="material-symbols-outlined text-[15px] transition group-hover:translate-x-0.5">arrow_forward</span>
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#0e0d0b] p-6">
            <span className="material-symbols-outlined text-[#d4aa61]">support_agent</span>
            <h3 className="mt-3 font-display-lg text-lg font-semibold text-[#fff8df]">{t("conciergeTitle")}</h3>
            <p className="mt-2 text-xs leading-5 text-[#9caec0]">{t("conciergeDesc")}</p>
            <Link
              href="/messages"
              className="mt-5 inline-flex rounded-full bg-gradient-to-r from-[#b8860b] via-[#d7b55c] to-[#f0d98b] px-5 py-2.5 text-xs font-bold text-[#06111f] transition hover:-translate-y-0.5"
            >
              {t("startChat")}
            </Link>
          </div>
          <div className="rounded-2xl border border-[#c4a55a]/25 bg-[#14110c] p-6">
            <span className="material-symbols-outlined text-[#d4aa61]">mail</span>
            <h3 className="mt-3 font-display-lg text-lg font-semibold text-[#fff8df]">{t("privateRequestTitle")}</h3>
            <p className="mt-2 text-xs leading-5 text-[#9caec0]">{t("privateRequestDesc")}</p>
            <Link
              href="/messages"
              className="mt-5 inline-flex rounded-full border border-[#c4a55a]/50 px-5 py-2.5 text-xs font-bold text-[#e8c97a] transition hover:border-[#d4aa61] hover:bg-white/[.04]"
            >
              {t("contactExpert")}
            </Link>
          </div>
        </div>
      </div>
    </CollectorShell>
  );
}
