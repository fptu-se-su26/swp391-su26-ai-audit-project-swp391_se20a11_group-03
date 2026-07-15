"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { formatVnd } from "@/lib/money";
import {
  AdminFeaturedProductsResponse,
  FeaturedPeriodType,
  FeaturedProductSlot,
  getAdminFeaturedProducts,
  updateAdminFeaturedProducts,
} from "@/lib/services/featuredProductService";
import { ProductSummary, searchProducts } from "@/lib/services/productService";
import { useTranslations } from "@/i18n/I18nProvider";

const PERIODS: FeaturedPeriodType[] = ["DAILY", "WEEKLY", "MONTHLY"];
const SLOT_COUNT = 4;

function slotsToSelection(slots: FeaturedProductSlot[]): (number | null)[] {
  const selection: (number | null)[] = Array.from({ length: SLOT_COUNT }, () => null);
  for (const slot of slots) {
    const index = slot.displayOrder - 1;
    if (index >= 0 && index < SLOT_COUNT) {
      selection[index] = slot.productId;
    }
  }
  return selection;
}

function emptySelections(): Record<FeaturedPeriodType, (number | null)[]> {
  return {
    DAILY: Array.from({ length: SLOT_COUNT }, () => null),
    WEEKLY: Array.from({ length: SLOT_COUNT }, () => null),
    MONTHLY: Array.from({ length: SLOT_COUNT }, () => null),
  };
}

export default function AdminFeaturedProductsPage() {
  const t = useTranslations("adminFeatured");
  const [activePeriod, setActivePeriod] = useState<FeaturedPeriodType>("DAILY");
  const [selections, setSelections] = useState(emptySelections);
  const [catalog, setCatalog] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const applyAdminData = useCallback((data: AdminFeaturedProductsResponse) => {
    setSelections({
      DAILY: slotsToSelection(data.daily),
      WEEKLY: slotsToSelection(data.weekly),
      MONTHLY: slotsToSelection(data.monthly),
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [featured, products] = await Promise.all([
        getAdminFeaturedProducts(),
        searchProducts({ status: "APPROVED", size: 100 }),
      ]);
      applyAdminData(featured);
      setCatalog(products.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [applyAdminData, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateSlot = (period: FeaturedPeriodType, slotIndex: number, value: string) => {
    const productId = value ? Number(value) : null;
    setSelections((current) => {
      const next = { ...current };
      const row = [...current[period]];
      row[slotIndex] = productId && productId > 0 ? productId : null;
      next[period] = row;
      return next;
    });
    setMessage("");
    setError("");
  };

  const savePeriod = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateAdminFeaturedProducts(activePeriod, selections[activePeriod]);
      setMessage(t("saved"));
      const refreshed = await getAdminFeaturedProducts();
      applyAdminData(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const periodLabel = (period: FeaturedPeriodType) => {
    if (period === "DAILY") return t("periodDaily");
    if (period === "WEEKLY") return t("periodWeekly");
    return t("periodMonthly");
  };

  return (
    <AdminShell>
      <div className="mx-auto max-w-[1200px] space-y-lg p-margin-mobile md:p-margin-desktop">
        <div>
          <h1 className="font-display-lg-mobile text-primary md:font-display-lg">{t("title")}</h1>
          <p className="mt-xs font-body-lg text-on-surface-variant">{t("subtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-sm border-b border-outline-variant pb-md">
          {PERIODS.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setActivePeriod(period)}
              className={`rounded-lg px-md py-sm font-label-md text-label-md transition ${
                activePeriod === period
                  ? "bg-secondary text-on-secondary"
                  : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {periodLabel(period)}
            </button>
          ))}
        </div>

        <section className="rounded-xl border border-surface-variant bg-surface p-lg soft-shadow">
          <div className="mb-md flex flex-wrap items-center justify-between gap-sm">
            <h2 className="font-headline-sm text-headline-sm text-primary">
              {t("slotsTitle", { period: periodLabel(activePeriod) })}
            </h2>
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-lg border border-outline-variant px-md py-sm font-label-md text-label-md hover:bg-surface-container-low"
            >
              {t("refresh")}
            </button>
          </div>

          {error && <div className="mb-md rounded-lg bg-error-container px-md py-sm text-on-error-container">{error}</div>}
          {message && <div className="mb-md rounded-lg bg-secondary-container px-md py-sm text-on-secondary-container">{message}</div>}

          {loading ? (
            <p className="font-body-md text-on-surface-variant">{t("loading")}</p>
          ) : (
            <div className="space-y-md">
              {selections[activePeriod].map((selectedId, index) => (
                <div key={`${activePeriod}-${index}`} className="grid gap-sm md:grid-cols-[120px_1fr] md:items-center">
                  <label className="font-label-md text-label-md text-on-surface-variant">
                    {t("slotLabel", { n: index + 1 })}
                  </label>
                  <select
                    value={selectedId ?? ""}
                    onChange={(event) => updateSlot(activePeriod, index, event.target.value)}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm font-body-md outline-none focus:border-secondary"
                  >
                    <option value="">{t("slotEmpty")}</option>
                    {catalog.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.productName}
                        {product.auctionStatus ? ` · ${product.auctionStatus}` : ""}
                        {` · ${formatVnd(product.currentBid ?? product.startingPrice)}`}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <button
                type="button"
                disabled={saving}
                onClick={() => void savePeriod()}
                className="mt-md rounded-lg bg-secondary px-lg py-sm font-label-md text-label-md text-on-secondary hover:opacity-90 disabled:opacity-60"
              >
                {saving ? t("saving") : t("savePeriod")}
              </button>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
