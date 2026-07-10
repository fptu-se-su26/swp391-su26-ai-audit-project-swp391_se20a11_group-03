"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useTranslations } from "@/i18n/I18nProvider";

export default function SupportPage() {
  const t = useTranslations("supportPage");
  const [query, setQuery] = useState("");

  const faqs = useMemo(
    () => [
      ["gavel", t("buyingTitle"), t("buyingDesc")],
      ["verified", t("faqAuthTitle"), t("faqAuthDesc")],
      ["payments", t("paymentsTitle"), t("paymentsDesc")],
      ["local_shipping", t("faqShippingTitle"), t("faqShippingDesc")],
      ["storefront", t("sellingTitle"), t("sellingDesc")],
      ["security", t("faqSecurityTitle"), t("faqSecurityDesc")],
    ],
    [t],
  );

  const filtered = faqs.filter(([, title]) => title.toLowerCase().includes(query.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1260px] px-4 py-10 sm:px-7 lg:px-10 lg:py-14">
        <DashboardHeader eyebrow="Private client care" title={t("title")} subtitle={t("subtitle")} />
        <div className="mt-8 rounded-3xl border border-white/10 bg-[#071626] p-7 text-white shadow-[0_22px_60px_rgba(7,22,38,.18)] sm:p-10">
          <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#d9bc72]">{t("helpPrompt")}</p>
          <h2 className="mt-3 font-display-lg text-2xl font-semibold sm:text-3xl">{t("helpQuestion")}</h2>
          <div className="mt-6 flex max-w-2xl items-center rounded-2xl border border-white/15 bg-white/[.07] px-4 py-3 focus-within:border-[#d7b86b]">
            <span className="material-symbols-outlined text-[#d7b86b]">search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="ml-3 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#80909d]"
            />
          </div>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(([icon, title, desc]) => (
            <button
              key={title}
              className="group rounded-2xl border border-[#e0d9ce] bg-white/80 p-5 text-left shadow-[0_8px_28px_rgba(18,31,44,.04)] transition hover:-translate-y-1 hover:border-[#c5a65b]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1ead9] text-[#947025]">
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </span>
              <h3 className="mt-4 text-sm font-bold text-[#102235]">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-[#737d85]">{desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8c681f]">
                {t("viewGuide")} <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#dfd8cb] bg-white/75 p-6">
            <span className="material-symbols-outlined text-[#9a7429]">support_agent</span>
            <h3 className="mt-3 font-display-lg text-lg font-semibold">{t("conciergeTitle")}</h3>
            <p className="mt-2 text-xs leading-5 text-[#737d85]">{t("conciergeDesc")}</p>
            <button className="mt-5 rounded-full bg-[#071626] px-5 py-2.5 text-xs font-bold text-[#e4c77b]">{t("startChat")}</button>
          </div>
          <div className="rounded-2xl border border-[#dfd8cb] bg-[#f1ead9] p-6">
            <span className="material-symbols-outlined text-[#9a7429]">mail</span>
            <h3 className="mt-3 font-display-lg text-lg font-semibold">{t("privateRequestTitle")}</h3>
            <p className="mt-2 text-xs leading-5 text-[#737d85]">{t("privateRequestDesc")}</p>
            <button className="mt-5 rounded-full border border-[#9e7a31] px-5 py-2.5 text-xs font-bold text-[#795b20]">{t("contactExpert")}</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
