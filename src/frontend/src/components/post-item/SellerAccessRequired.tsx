"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import SellerBenefits from "./SellerBenefits";

export default function SellerAccessRequired({ mode }: { mode: "signin" | "upgrade" }) {
  const t = useTranslations("sellerAccess");
  const tCommon = useTranslations("common");

  const steps = useMemo(
    () => [
      ["01", t("step1Title"), t("step1Desc")],
      ["02", t("step2Title"), t("step2Desc")],
      ["03", t("step3Title"), t("step3Desc")],
    ],
    [t],
  );

  return (
    <div className="mx-auto max-w-[1260px] px-4 py-10 sm:px-7 lg:px-10 lg:py-14">
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#c6a75a]/30 bg-[#c6a75a]/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-[#87651f]">
            <span className="material-symbols-outlined text-[14px]">diamond</span>
            {t("eyebrow")}
          </div>
          <h1 className="font-display-lg text-3xl font-semibold tracking-[-.04em] text-[#071626] sm:text-4xl">{t("pageTitle")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#65717b]">{t("pageDesc")}</p>
        </div>
        <Link href="/" className="inline-flex w-fit items-center gap-2 text-xs font-bold text-[#86631c] hover:text-[#071626]">
          <span className="material-symbols-outlined text-[17px]">arrow_back</span>
          {t("backHome")}
        </Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.18fr_.82fr]">
        <section className="relative overflow-hidden rounded-[28px] border border-[#d7c9a8] bg-[#071626] p-6 text-white shadow-[0_24px_70px_rgba(7,22,38,.18)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_8%,rgba(213,181,101,.24),transparent_26%),linear-gradient(135deg,transparent_55%,rgba(255,255,255,.035)_55%)]" />
          <div className="relative">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[#d8ba70]/30 bg-[#d8ba70]/10 text-[#e6cb84] shadow-inner">
              <span className="material-symbols-outlined text-[27px]">{mode === "signin" ? "shield_lock" : "storefront"}</span>
            </div>
            <p className="mt-8 text-[9px] font-bold uppercase tracking-[.2em] text-[#d7ba70]">{t("secureAccess")}</p>
            <h2 className="mt-3 max-w-xl font-display-lg text-2xl font-semibold leading-tight tracking-[-.03em] sm:text-3xl">
              {mode === "signin" ? t("signInTitle") : t("upgradeTitle")}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#aebbc6]">{t("signInDesc")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={mode === "signin" ? "/auth" : "/become-seller"} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#dfbf70] px-6 py-3.5 text-sm font-bold text-[#071626] transition hover:-translate-y-0.5 hover:bg-[#efd694]">
                {mode === "signin" ? tCommon("login") : t("registerSeller")}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <a href="#selling-process" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[.07]">
                <span className="material-symbols-outlined text-[18px]">info</span>
                {t("learnProcess")}
              </a>
            </div>
          </div>
        </section>

        <aside className="rounded-[28px] border border-[#ded7ca] bg-[#fffdf8]/90 p-6 shadow-[0_14px_45px_rgba(18,31,44,.07)] backdrop-blur sm:p-8">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eee6d3] text-[#947128]"><span className="material-symbols-outlined">handshake</span></span>
          <h2 className="mt-5 font-display-lg text-xl font-semibold tracking-[-.03em] text-[#071626]">{t("becomeSellerTitle")}</h2>
          <p className="mt-3 text-sm leading-6 text-[#6d7780]">{t("becomeSellerDesc")}</p>
          <Link href="/profile#seller-upgrade" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#b9974f] px-5 py-3 text-xs font-bold uppercase tracking-[.1em] text-[#78591b] transition hover:bg-[#071626] hover:text-[#f0d58a]">
            {t("registerSellerCta")}
            <span className="material-symbols-outlined text-[17px]">north_east</span>
          </Link>
          <div className="mt-6 border-t border-[#e4ded3] pt-5">
            <p className="flex items-center gap-2 text-[11px] font-semibold text-[#52606c]">
              <span className="material-symbols-outlined text-[16px] text-[#4d8a75]">verified_user</span>
              {t("noSignupFee")}
            </p>
          </div>
        </aside>
      </div>

      <section id="selling-process" className="mt-6 rounded-[26px] border border-[#dfd8cb] bg-white/70 p-6 backdrop-blur sm:p-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#987328]">{t("processEyebrow")}</p>
            <h2 className="mt-2 font-display-lg text-2xl font-semibold tracking-[-.03em] text-[#071626]">{t("processTitle")}</h2>
          </div>
          <p className="text-xs text-[#7a8289]">{t("processSupport")}</p>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {steps.map(([number, title, description], index) => (
            <div key={number} className="relative rounded-2xl border border-[#e5dfd4] bg-[#fffdf9] p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#a17b2c]">{number}</span>
                <span className="material-symbols-outlined text-[18px] text-[#b69a5a]">{index === 0 ? "edit_note" : index === 1 ? "fact_check" : "campaign"}</span>
              </div>
              <h3 className="mt-6 text-sm font-bold text-[#102235]">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-[#727b83]">{description}</p>
              {index < 2 && <span className="absolute -right-3 top-1/2 z-10 hidden h-px w-6 bg-[#cdbd99] md:block" />}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-5"><SellerBenefits /></div>
    </div>
  );
}
