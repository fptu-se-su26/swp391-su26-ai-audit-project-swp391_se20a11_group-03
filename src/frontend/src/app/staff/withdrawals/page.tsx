"use client";

import { useEffect, useState } from "react";
import PortalShell from "@/components/layout/PortalShell";
import {
  getWithdrawals,
  updateWithdrawalStatus,
  Withdrawal,
} from "@/lib/services/walletService";
import { useTranslations } from "@/i18n/I18nProvider";

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export default function StaffWithdrawalsPage() {
  const t = useTranslations("staffWithdrawals");
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadWithdrawals = async () => {
    const data = await getWithdrawals("PENDING");
    setItems(data);
  };

  useEffect(() => {
    loadWithdrawals()
      .catch((err) => setError(err instanceof Error ? err.message : t("loadError")))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: "COMPLETED" | "REJECTED") => {
    setError("");
    setUpdatingId(id);
    try {
      await updateWithdrawalStatus(id, status);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("updateError"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <PortalShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{t("pageTitle")}</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">{t("pageSubtitle")}</p>
        </div>

        {error && (
          <div className="rounded-lg bg-error-container text-on-error-container px-md py-sm font-body-md">
            {error}
          </div>
        )}

        <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-variant">
                {[t("tableUser"), t("tableAmount"), t("tableBank"), t("tableAccountNo"), t("tableAccountName"), t("tableRequested"), t("tableActions")].map((h) => (
                  <th key={h} className="p-md font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="p-md text-on-surface-variant" colSpan={7}>{t("loading")}</td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td className="p-md text-on-surface-variant" colSpan={7}>{t("noWithdrawals")}</td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                  <td className="p-md font-label-md text-label-md text-on-surface">{item.userName || `User #${item.userId}`}</td>
                  <td className="p-md font-bold text-primary whitespace-nowrap">{formatVnd(item.amount)}</td>
                  <td className="p-md font-body-md text-sm text-on-surface-variant">{item.bankName}</td>
                  <td className="p-md font-body-md text-sm text-on-surface-variant">{item.accountNumber}</td>
                  <td className="p-md font-body-md text-sm text-on-surface-variant">{item.accountName}</td>
                  <td className="p-md font-body-md text-sm text-on-surface-variant whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="p-md">
                    <div className="flex items-center gap-xs">
                      <button
                        onClick={() => updateStatus(item.id, "COMPLETED")}
                        disabled={updatingId === item.id}
                        className="px-3 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-[10px] uppercase font-bold hover:opacity-80 disabled:opacity-50"
                      >
                        {t("markTransferred")}
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, "REJECTED")}
                        disabled={updatingId === item.id}
                        className="px-3 py-1 rounded bg-error-container text-on-error-container font-label-sm text-[10px] uppercase font-bold hover:opacity-80 disabled:opacity-50"
                      >
                        {t("reject")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
