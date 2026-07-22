"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ApiError, premiumApi, type PremiumStatus } from "@/lib/api";

const BENEFITS = [
  ["verified", "expert"],
  ["smart_toy", "autoBid"],
  ["percent", "commission"],
  ["all_inclusive", "unlimited"],
  ["savings", "deposit"],
] as const;

const USER_BENEFITS = [BENEFITS[1], BENEFITS[4]] as const;

const TRUST_ITEMS = [
  ["bolt", "instant"],
  ["account_balance_wallet", "payment"],
  ["verified_user", "security"],
  ["headset_mic", "support"],
] as const;

const AUTO_BID_STEPS = [
  ["person", "set"],
  ["person_alert", "outbid"],
  ["smart_toy", "system"],
  ["emoji_events", "win"],
] as const;

export default function PremiumPurchaseClient() {
  const t = useTranslations("premiumPage");
  const locale = useLocale();
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
  const money = (value: number) => `${value.toLocaleString(dateLocale)} ₫`;
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  const selectedPrice = status
    ? selectedPlan === "YEARLY"
      ? status.yearlyPrice
      : status.monthlyPrice
    : 0;
  const isSeller = status?.accountType === "SELLER";
  const visibleBenefits = isSeller ? BENEFITS : USER_BENEFITS;
  const hasEnoughBalance = Boolean(status && status.remainingBalance >= selectedPrice);

  useEffect(() => {
    premiumApi
      .status()
      .then(setStatus)
      .catch((reason: unknown) =>
        setError(locale === "vi" && reason instanceof Error ? reason.message : t("messages.loadError")),
      )
      .finally(() => setLoading(false));
  }, [locale, t]);

  async function purchase() {
    if (!status || purchasing) return;
    setPurchasing(true);
    setError("");
    setSuccess("");

    try {
      const result = await premiumApi.purchase(selectedPlan);
      const wasPremium = status.premium;
      setStatus(result);
      setSuccess(t(wasPremium ? "messages.renewSuccess" : "messages.purchaseSuccess"));
      setConfirmOpen(false);
    } catch (reason: unknown) {
      setError(locale === "vi" && reason instanceof ApiError ? reason.message : t("messages.purchaseError"));
    } finally {
      setPurchasing(false);
    }
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_42%_0%,rgba(243,211,143,.12),transparent_34%),#fffdfa] text-[#24212a] xl:h-screen xl:min-h-0 xl:overflow-hidden">
      <div className="mx-auto grid max-w-[1440px] xl:h-full xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 px-5 py-6 sm:px-8 lg:px-9 xl:overflow-hidden xl:px-9 xl:py-5">
          <section className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_310px]" aria-labelledby="premium-title">
            <div className="py-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e5d2ac] bg-[#fffaf0] px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-[#8e641c]">
                <span className="material-symbols-outlined text-[20px]">crown</span>
                {t("brand")}
              </div>
              <h1 id="premium-title" className="mt-4 text-[clamp(2.35rem,4.5vw,3.5rem)] font-bold leading-[1.03] tracking-[-.045em] text-[#23212a]">
                {isSeller ? t("hero.sellerTitle") : t("hero.userTitle")}
                <span className="mt-1 block bg-gradient-to-r from-[#d69b36] to-[#f0c66f] bg-clip-text text-transparent">
                  {t("hero.accent")}
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#67616b]">
                {isSeller
                  ? t("hero.sellerDescription")
                  : t("hero.userDescription")}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => scrollTo("premium-checkout")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d59b37] to-[#efc66f] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(190,131,30,.2)] transition hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined text-[20px]">crown</span>
                  {status?.premium ? t("hero.renew") : t("hero.upgrade")}
                </button>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => setBenefitsOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2ddd5] bg-white px-5 py-3 text-sm font-bold text-[#302d34] shadow-sm transition hover:border-[#d7b36d] hover:bg-[#fffaf1]"
                >
                  <span className="material-symbols-outlined text-[19px]">double_arrow</span>
                  {t("hero.viewBenefits")}
                </button>
              </div>
            </div>

            <div className="relative mx-auto hidden w-full max-w-[310px] lg:block">
              <span className="absolute left-5 top-16 h-2 w-2 rounded-full bg-[#e8bc63]/50 shadow-[0_0_0_7px_rgba(232,188,99,.08)]" />
              <span className="absolute right-8 top-5 h-2.5 w-2.5 rounded-full border-2 border-[#d9a948]/35" />
              <Image
                src="/premium-crown-display.png"
                alt={t("hero.imageAlt")}
                width={1456}
                height={1080}
                priority
                className="h-auto w-full mix-blend-multiply"
              />
            </div>
          </section>

          <section className="mt-4 grid overflow-hidden rounded-2xl border border-[#e7e0d6] bg-white shadow-[0_8px_30px_rgba(65,48,20,.04)] sm:grid-cols-2 lg:grid-cols-4" aria-label={t("trust.aria")}>
            {TRUST_ITEMS.map(([icon, key], index) => (
              <div key={key} className={`flex gap-2.5 px-4 py-3.5 ${index > 0 ? "border-t border-[#eee8df] sm:border-t-0 sm:[&:nth-child(even)]:border-l lg:border-l" : ""} ${index > 1 ? "sm:border-t lg:border-t-0" : ""}`}>
                <span className="material-symbols-outlined shrink-0 text-[26px] text-[#d99a2e]">{icon}</span>
                <div>
                  <h2 className="text-sm font-bold text-[#2c2930]">{t(`trust.${key}.title`)}</h2>
                  <p className="mt-0.5 text-[11px] leading-4 text-[#777078]">{t(`trust.${key}.description`)}</p>
                </div>
              </div>
            ))}
          </section>

          <section id="premium-benefits" className="scroll-mt-6 pt-5" aria-labelledby="premium-benefits-title">
            <div className="flex items-end justify-between gap-4 px-1">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#8e8174]">{t("benefits.eyebrow")}</p>
                <h2 id="premium-benefits-title" className="mt-1 text-xl font-bold tracking-[-.025em] text-[#27242c]">
                  {t("benefits.title")}
                </h2>
              </div>
              <span className="hidden rounded-full border border-[#e3ddd4] bg-white px-3 py-1.5 text-xs font-semibold text-[#6d666d] sm:inline-flex">
                {t("benefits.count", { count: visibleBenefits.length })}
              </span>
            </div>

            <div className={`mt-3 grid gap-3 ${isSeller ? "md:grid-cols-2" : "md:grid-cols-2"}`}>
              {visibleBenefits.map(([icon, key]) => (
                <article key={key} className="rounded-2xl border border-[#e7dfd4] bg-white p-4 shadow-[0_10px_28px_rgba(69,51,21,.045)] transition hover:-translate-y-0.5 hover:border-[#dcb96f] hover:shadow-[0_14px_34px_rgba(121,83,18,.08)]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#efdfbf] bg-[#fff8eb] text-[#c88920]">
                      <span className="material-symbols-outlined text-[25px]">{icon}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#2d2931]">{t(`benefits.items.${key}.title`)}</h3>
                      <p className="mt-0.5 text-xs leading-5 text-[#716a72]">{t(`benefits.items.${key}.description`)}</p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5 border-t border-[#eee8df] pt-3">
                    {(["detail1", "detail2", "detail3"] as const).map((detailKey) => (
                      <li key={detailKey} className="flex items-center gap-2 text-xs text-[#716a72]">
                        <span className="material-symbols-outlined text-[15px] text-[#ca8d27]">check</span>
                        {t(`benefits.items.${key}.${detailKey}`)}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {!isSeller && (
            <section className="mt-4 rounded-2xl border border-[#e7dfd4] bg-white p-4 shadow-[0_8px_25px_rgba(69,51,21,.04)]" aria-labelledby="auto-bid-title">
              <p id="auto-bid-title" className="text-xs font-bold uppercase tracking-[.18em] text-[#746b64]">{t("autoBid.title")}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {AUTO_BID_STEPS.map(([icon, key], index) => (
                  <div key={key} className="relative flex items-center gap-3 lg:block">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ecdcbf] bg-[#fffaf0] text-[#ca8d27] lg:mb-2">
                      <span className="material-symbols-outlined text-[22px]">{icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#3b3539]">{t(`autoBid.steps.${key}.title`)}</h3>
                      <p className="mt-1 text-xs leading-5 text-[#777077]">{t(`autoBid.steps.${key}.description`)}</p>
                    </div>
                    {index < AUTO_BID_STEPS.length - 1 && (
                      <span className="material-symbols-outlined absolute -right-3 top-3 hidden text-[22px] text-[#cfc5b7] lg:block">arrow_forward</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside id="premium-checkout" className="scroll-mt-4 border-t border-[#e8e1d7] bg-white/65 p-5 sm:p-7 xl:h-full xl:min-h-0 xl:overflow-hidden xl:border-l xl:border-t-0 xl:p-4">
          <div className="xl:sticky xl:top-6">
            <section className="rounded-[24px] border border-[#e5ddd1] bg-white p-4 shadow-[0_16px_45px_rgba(74,54,21,.055)]" aria-labelledby="premium-plan-title">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#71675e]">{t("plan.eyebrow")}</p>
                  <h2 id="premium-plan-title" className="mt-1 text-xl font-bold text-[#27242c]">{t("plan.title")}</h2>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#ecdcbc] bg-[#fff9ef] text-[#ad7417]">
                  <span className="material-symbols-outlined text-[25px]">crown</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#e6dfd6] bg-[#fcfaf7] p-1">
                <button
                  type="button"
                  aria-pressed={selectedPlan === "MONTHLY"}
                  onClick={() => setSelectedPlan("MONTHLY")}
                  className={`rounded-xl px-3 py-3 text-left transition ${selectedPlan === "MONTHLY" ? "border border-[#d79429] bg-white shadow-sm" : "border border-transparent"}`}
                >
                  <span className="block text-xs text-[#6f6761]">{t("plan.monthly")}</span>
                  <strong className="mt-2 block text-sm text-[#28242a]">{status ? money(status.monthlyPrice) : "—"}</strong>
                </button>
                <button
                  type="button"
                  aria-pressed={selectedPlan === "YEARLY"}
                  onClick={() => setSelectedPlan("YEARLY")}
                  className={`relative rounded-xl px-3 py-3 text-left transition ${selectedPlan === "YEARLY" ? "border border-[#d79429] bg-white shadow-sm" : "border border-transparent"}`}
                >
                  <span className="absolute right-2 top-2 rounded-full bg-[#fff1d5] px-2 py-0.5 text-[9px] font-bold uppercase text-[#a56e12]">{t("plan.saving")}</span>
                  <span className="block text-xs text-[#6f6761]">{t("plan.yearly")}</span>
                  <strong className="mt-2 block text-sm text-[#28242a]">{status ? money(status.yearlyPrice) : "—"}</strong>
                </button>
              </div>

              <div className="border-b border-[#eae4dc] py-5 text-center">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#5f5860]">{t("plan.total")}</p>
                <div className="mt-3 flex items-baseline justify-center gap-1.5">
                  <strong className="text-[34px] font-bold tracking-[-.04em] text-[#d09a43]">{status ? selectedPrice.toLocaleString(dateLocale) : "—"}</strong>
                  {status && <span className="font-bold text-[#ba8126]">₫</span>}
                </div>
                <p className="mt-2 text-sm text-[#777078]">
                  {selectedPlan === "YEARLY" ? t("plan.yearlyDuration", { saving: money(status?.yearlySaving ?? 0) }) : t("plan.monthlyDuration")}
                </p>
              </div>

              <div className="pt-4">
                {loading ? (
                  <div className="space-y-3" aria-label={t("plan.loading")}>
                    <div className="h-14 animate-pulse rounded-xl bg-[#f3eee7]" />
                    <div className="h-14 animate-pulse rounded-xl bg-[#f3eee7]" />
                  </div>
                ) : (
                  status && (
                    <>
                      <div className="flex items-center justify-between rounded-xl border border-[#e8e1d8] bg-[#fcfaf7] px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-sm text-[#696269]">
                          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                          {t("plan.balance")}
                        </span>
                        <strong className="text-sm text-[#29252b]">{money(status.remainingBalance)}</strong>
                      </div>

                      {status.premium && (
                        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                          <div className="flex items-center gap-2 font-semibold">
                            <span className="material-symbols-outlined text-[19px]">verified</span>
                            {t("plan.active")}
                          </div>
                          {status.expiresAt && <p className="mt-1 pl-[27px] text-xs">{t("plan.until", { date: new Date(status.expiresAt).toLocaleDateString(dateLocale) })}</p>}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setConfirmOpen(true)}
                        disabled={purchasing || !hasEnoughBalance}
                        className="group mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d39a39] to-[#efc76f] px-5 py-3.5 font-bold text-white shadow-[0_10px_24px_rgba(181,121,22,.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                      >
                        <span className="material-symbols-outlined text-[21px]">crown</span>
                        {purchasing ? t("plan.purchasing") : status.premium ? t("plan.renew") : t("plan.upgrade")}
                        <span className="material-symbols-outlined ml-auto text-[20px] transition group-hover:translate-x-0.5">arrow_forward</span>
                      </button>

                      {!hasEnoughBalance && (
                        <p className="mt-3 text-center text-sm text-[#b27a1b]">
                          {t("plan.insufficient")}{" "}
                          <Link href="/wallet" className="font-bold underline underline-offset-3">{t("plan.topUp")}</Link>
                        </p>
                      )}
                    </>
                  )
                )}
              </div>

              {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              {success && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}

              <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-[#746e72]">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                {t("plan.secure")}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-[#e9e3db] bg-[#fffdfa] p-3">
                {TRUST_ITEMS.map(([icon, key]) => (
                  <div key={key} className="flex items-center gap-2 text-xs text-[#5f5960]">
                    <span className="material-symbols-outlined text-[20px] text-[#d39630]">{icon}</span>
                    {t(`trust.${key}.title`)}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2 rounded-2xl border border-[#e9e3db] bg-[#fcfaf7] p-3 text-[11px] leading-4 text-[#6f696f]">
                <span className="material-symbols-outlined shrink-0 text-[20px]">verified_user</span>
                <p>{t("plan.disclaimer")}</p>
              </div>
            </section>
          </div>
        </aside>
      </div>

      {benefitsOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#30291f]/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setBenefitsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-benefits-dialog-title"
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-[#e2d4ba] bg-[#fffdfa] shadow-[0_35px_100px_rgba(50,37,16,.3)]"
          >
            <header className="flex items-start justify-between gap-4 border-b border-[#eadfca] bg-[radial-gradient(circle_at_90%_0%,rgba(232,193,106,.2),transparent_38%),#fff9e9] px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9a6b1c]">{t("benefits.eyebrow")}</p>
                <h2 id="premium-benefits-dialog-title" className="mt-1 text-2xl font-bold text-[#29231b]">{t("benefits.title")}</h2>
                <p className="mt-2 text-sm text-[#756c61]">{t("benefits.count", { count: visibleBenefits.length })}</p>
              </div>
              <button
                type="button"
                aria-label={t("dialog.close")}
                onClick={() => setBenefitsOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e3d8c8] bg-white text-[#766d63] transition hover:bg-[#f4ede2] hover:text-[#302a22]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className={`custom-scrollbar grid max-h-[calc(90vh-116px)] gap-4 overflow-y-auto p-5 sm:p-7 ${isSeller ? "md:grid-cols-2" : "md:grid-cols-2"}`}>
              {visibleBenefits.map(([icon, key]) => (
                <article key={key} className="rounded-2xl border border-[#e7dfd4] bg-white p-5 shadow-[0_8px_24px_rgba(69,51,21,.05)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#efdfbf] bg-[#fff8eb] text-[#c88920]">
                      <span className="material-symbols-outlined text-[27px]">{icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2d2931]">{t(`benefits.items.${key}.title`)}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#716a72]">{t(`benefits.items.${key}.description`)}</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2.5 border-t border-[#eee8df] pt-4">
                    {(["detail1", "detail2", "detail3"] as const).map((detailKey) => (
                      <li key={detailKey} className="flex items-center gap-2.5 text-sm text-[#625b62]">
                        <span className="material-symbols-outlined text-[17px] text-[#ca8d27]">check</span>
                        {t(`benefits.items.${key}.${detailKey}`)}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {confirmOpen && status && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#30291f]/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !purchasing) setConfirmOpen(false);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="premium-confirm-title" className="w-full max-w-md overflow-hidden rounded-[26px] border border-[#ddc894] bg-[#fffdfa] shadow-[0_35px_100px_rgba(50,37,16,.3)]">
            <div className="relative overflow-hidden border-b border-[#eadfca] bg-[#fff9e9] px-6 pb-6 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f0cc76] to-[#b87b17] text-white">
                  <span className="material-symbols-outlined text-2xl">crown</span>
                </div>
                <button type="button" aria-label={t("dialog.close")} disabled={purchasing} onClick={() => setConfirmOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#84796b] transition hover:bg-[#efe6d8] hover:text-[#312a21] disabled:opacity-40">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <h2 id="premium-confirm-title" className="mt-5 text-2xl font-bold text-[#29231b]">{status.premium ? t("dialog.renewTitle") : t("dialog.upgradeTitle")}</h2>
              <p className="mt-2 text-sm leading-6 text-[#756c61]">{t("dialog.description", { plan: selectedPlan === "YEARLY" ? t("dialog.yearlyPlan") : t("dialog.monthlyPlan") })}</p>
            </div>
            <div className="space-y-1 px-6 py-5 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-[#f8f4ed] px-4 py-3"><span className="text-[#81776b]">{t("dialog.price")}</span><strong className="text-[#9c6912]">{money(selectedPrice)}</strong></div>
              <div className="flex items-center justify-between px-4 py-3"><span className="text-[#81776b]">{t("dialog.currentBalance")}</span><strong>{money(status.remainingBalance)}</strong></div>
              <div className="flex items-center justify-between border-t border-[#e9e0d4] px-4 pt-4"><span className="font-semibold text-[#675e52]">{t("dialog.remainingBalance")}</span><strong>{money(status.remainingBalance - selectedPrice)}</strong></div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-[#e9e0d4] bg-[#faf7f1] p-5">
              <button type="button" disabled={purchasing} onClick={() => setConfirmOpen(false)} className="rounded-xl border border-[#ddd3c5] bg-white px-4 py-3 font-bold text-[#675e52] transition hover:bg-[#f3eee7] disabled:opacity-50">{t("dialog.back")}</button>
              <button type="button" disabled={purchasing} onClick={purchase} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#bd821b] to-[#e2ba61] px-4 py-3 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">
                <span className="material-symbols-outlined text-[19px]">lock</span>{purchasing ? t("dialog.processing") : t("dialog.pay")}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
