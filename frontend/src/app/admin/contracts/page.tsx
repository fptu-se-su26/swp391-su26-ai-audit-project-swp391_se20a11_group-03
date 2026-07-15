"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { ContractRow, getContracts, openContractPdf } from "@/lib/services/dashboardService";
import { useTranslations } from "@/i18n/I18nProvider";

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

type Filter = "all" | "SELLER_AGREEMENT" | "LISTING" | "PURCHASE_AGREEMENT";

export default function AdminContractsPage() {
  const t = useTranslations("adminContracts");
  const tc = useTranslations("common");
  const [rows, setRows] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [cccdQuery, setCccdQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  async function loadContracts(cccd?: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await getContracts(cccd);
      setRows(data);
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenPdf(contractId: number) {
    setOpeningId(contractId);
    setPdfError(null);
    try {
      await openContractPdf(contractId);
    } catch {
      setPdfError(t("pdfError"));
    } finally {
      setOpeningId(null);
    }
  }

  useEffect(() => {
    void loadContracts(cccdQuery || undefined);
  }, [cccdQuery]);

  function handleSearchCccd(event: React.FormEvent) {
    event.preventDefault();
    setCccdQuery(searchInput.trim());
  }

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.contractType === filter)),
    [rows, filter],
  );

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: t("tabAll", { count: rows.length }) },
    { id: "SELLER_AGREEMENT", label: t("tabSeller") },
    { id: "PURCHASE_AGREEMENT", label: t("tabPurchase") },
    { id: "LISTING", label: t("tabListing") },
  ];

  if (loading) {
    return (
      <AdminShell>
        <div className="flex h-64 items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-[1400px] space-y-lg p-margin-mobile md:p-margin-desktop">
        <div>
          <h1 className="font-display-lg-mobile text-primary md:font-display-lg">{t("pageTitle")}</h1>
          <p className="mt-xs font-body-lg text-on-surface-variant">{t("pageSubtitle")}</p>
        </div>

        {error && <div className="rounded-xl bg-error-container p-md text-on-error-container">{error}</div>}
        {pdfError && <div className="rounded-xl bg-error-container p-md text-on-error-container">{pdfError}</div>}

        <form onSubmit={handleSearchCccd} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
              badge
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-xl border border-surface-variant bg-surface py-3 pl-11 pr-4 font-body-md text-body-md outline-none focus:border-secondary"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-label-md text-label-md text-on-primary"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            {t("search")}
          </button>
          {cccdQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setCccdQuery("");
              }}
              className="rounded-xl border border-surface-variant px-5 py-3 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low"
            >
              {t("clearFilter")}
            </button>
          )}
        </form>

        <div className="flex flex-wrap gap-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-full px-4 py-1.5 font-label-md text-label-md transition-all ${
                filter === tab.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl bg-surface p-xl text-center">
            <span className="material-symbols-outlined mb-sm block text-4xl text-on-surface-variant">contract</span>
            <p className="text-on-surface-variant">{t("noContracts")}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-surface-variant bg-surface soft-shadow">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-surface-variant bg-surface-container-low">
                    {[t("tableId"), t("tableType"), t("tableParty"), t("tableIdNumber"), t("tableSignedAt"), t("tableDocument")].map((h) => (
                      <th key={h} className="whitespace-nowrap p-md font-label-sm text-label-sm text-on-surface-variant">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.contractId} className="border-b border-surface-variant hover:bg-surface-container-lowest">
                      <td className="p-md font-label-md text-label-md text-primary">#{c.contractId}</td>
                      <td className="p-md">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                            c.contractType === "SELLER_AGREEMENT"
                              ? "bg-secondary-container text-on-secondary-container"
                              : "bg-tertiary-container text-on-tertiary-container"
                          }`}
                        >
                          {c.typeLabel}
                        </span>
                      </td>
                      <td className="p-md font-label-md text-label-md text-on-surface">{c.referenceName}</td>
                      <td className="whitespace-nowrap p-md font-mono text-sm text-on-surface-variant">
                        {c.identityNumber || "—"}
                      </td>
                      <td className="whitespace-nowrap p-md text-sm text-on-surface-variant">{formatDateTime(c.createdAt)}</td>
                      <td className="p-md">
                        {c.fileUrl ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPdf(c.contractId)}
                            disabled={openingId === c.contractId}
                            className="inline-flex items-center gap-xs rounded-lg border border-secondary/50 px-3 py-1.5 font-label-md text-label-md text-secondary hover:bg-secondary-container/30 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                            {openingId === c.contractId ? tc("opening") : tc("viewPdf")}
                          </button>
                        ) : (
                          <span className="text-sm text-on-surface-variant">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
