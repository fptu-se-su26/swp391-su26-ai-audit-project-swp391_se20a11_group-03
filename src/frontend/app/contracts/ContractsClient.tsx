"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ApiError, userApi, type UserContract } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

type Filter = "ALL" | "PURCHASE_AGREEMENT" | "LISTING" | "SELLER_AGREEMENT";

async function loadContracts() {
  return (await userApi.contracts()).data;
}

const FILTERS: Filter[] = ["ALL", "PURCHASE_AGREEMENT", "LISTING", "SELLER_AGREEMENT"];

export default function ContractsClient() {
  const t = useTranslations("contractsPage");
  const locale = useLocale();
  const { data, loading, error, reload } = useApiData<UserContract[]>(loadContracts, []);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const contracts = useMemo(
    () => data.filter((contract) => filter === "ALL" || contract.contractType === filter),
    [data, filter],
  );

  function typeLabel(type: string) {
    if (type === "PURCHASE_AGREEMENT") return t("types.purchase");
    if (type === "LISTING") return t("types.listing");
    if (type === "SELLER_AGREEMENT") return t("types.seller");
    return type;
  }

  function roleLabel(role: string) {
    if (role === "BUYER") return t("roles.buyer");
    if (role === "SELLER") return t("roles.seller");
    return t("roles.accountHolder");
  }

  function typeIcon(type: string) {
    if (type === "PURCHASE_AGREEMENT") return "shopping_bag";
    if (type === "LISTING") return "inventory_2";
    return "draw";
  }

  async function openPdf(contract: UserContract, download: boolean) {
    const key = `${contract.contractId}:${download ? "download" : "view"}`;
    const previewWindow = download ? null : window.open("", "_blank", "noopener,noreferrer");
    setActionId(key);
    setActionError("");
    try {
      const blob = await userApi.contractPdf(contract.contractId);
      const url = URL.createObjectURL(blob);
      if (download) {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `bidzone-contract-${contract.contractId}.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
      } else if (previewWindow) {
        previewWindow.location.href = url;
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
    } catch (reason: unknown) {
      previewWindow?.close();
      setActionError(
        reason instanceof ApiError || reason instanceof Error
          ? reason.message
          : t("openError"),
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--luxora-gold)]">
        {t("eyebrow")}
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-3xl">{t("title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--luxora-text-muted)] opacity-70">
            {t("description")}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-[var(--luxora-text-muted)]">
          {t("count", { count: data.length })}
        </span>
      </div>

      <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label={t("filterLabel")}>
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            aria-pressed={filter === item}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
              filter === item
                ? "border-[var(--luxora-gold)] bg-[var(--luxora-gold)] text-black"
                : "border-white/10 bg-white/5 text-[var(--luxora-text-muted)] hover:border-[var(--luxora-gold)]"
            }`}
          >
            {item === "ALL" ? t("filters.all") : typeLabel(item)}
          </button>
        ))}
      </div>

      {(error || actionError) && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">
          <span>{actionError || error}</span>
          {error && (
            <button type="button" onClick={() => void reload()} className="font-bold underline">
              {t("retry")}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="glass-panel h-40 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <div className="glass-panel mt-6 rounded-2xl px-6 py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-[var(--luxora-gold)] opacity-70">contract_delete</span>
          <h2 className="mt-4 text-lg font-semibold">{t("emptyTitle")}</h2>
          <p className="mt-2 text-sm text-[var(--luxora-text-muted)] opacity-70">{t("emptyDescription")}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {contracts.map((contract) => (
            <article key={contract.contractId} className="glass-panel rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--luxora-gold)]/12 text-[var(--luxora-gold-light)]">
                  {typeIcon(contract.contractType)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{typeLabel(contract.contractType)}</h2>
                    <span className="rounded-full border border-[var(--luxora-gold)]/25 bg-[var(--luxora-gold)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--luxora-gold-light)]">
                      {roleLabel(contract.partyRole)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-[var(--luxora-text-muted)] opacity-75">
                    {contract.referenceName}
                  </p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-white/5 p-3 text-xs">
                <div>
                  <dt className="text-[var(--luxora-text-muted)] opacity-60">{t("contractCode")}</dt>
                  <dd className="mt-1 font-semibold">BZ-{contract.contractId}</dd>
                </div>
                <div>
                  <dt className="text-[var(--luxora-text-muted)] opacity-60">{t("createdAt")}</dt>
                  <dd className="mt-1 font-semibold">
                    {contract.createdAt
                      ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(contract.createdAt))
                      : "—"}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void openPdf(contract, false)}
                  disabled={actionId !== null}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold transition hover:border-[var(--luxora-gold)] disabled:opacity-50"
                >
                  {actionId === `${contract.contractId}:view` ? t("opening") : t("viewPdf")}
                </button>
                <button
                  type="button"
                  onClick={() => void openPdf(contract, true)}
                  disabled={actionId !== null}
                  className="gradient-cta rounded-xl px-4 py-2.5 text-xs font-bold text-black disabled:opacity-50"
                >
                  {actionId === `${contract.contractId}:download` ? t("downloading") : t("downloadPdf")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
