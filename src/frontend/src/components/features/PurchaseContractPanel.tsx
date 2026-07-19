"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import {
  PurchaseContract,
  getPurchaseContract,
  openPurchaseContractPdf,
} from "@/lib/services/purchaseContractService";
import PurchaseContractSignModal from "@/components/features/PurchaseContractSignModal";

type Props = {
  auctionId: number;
  onSigned?: () => void;
  compact?: boolean;
};

export default function PurchaseContractPanel({ auctionId, onSigned, compact }: Props) {
  const t = useTranslations("contracts");
  const tCommon = useTranslations("common");
  const [contract, setContract] = useState<PurchaseContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingPdf, setOpeningPdf] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getPurchaseContract(auctionId)
      .then((c) => {
        if (!cancelled) setContract(c);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t("loadFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auctionId]);

  async function handleOpenPdf() {
    setOpeningPdf(true);
    setError("");
    try {
      await openPurchaseContractPdf(auctionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("openPdfFailed"));
    } finally {
      setOpeningPdf(false);
    }
  }

  function handleSigned() {
    getPurchaseContract(auctionId)
      .then((c) => {
        setContract(c);
        onSigned?.();
      })
      .catch(() => {});
  }

  if (loading) {
    return <p className="text-sm text-on-surface-variant">{t("loadingPurchase")}</p>;
  }

  return (
    <>
      <div className={`rounded-lg border border-secondary/40 bg-secondary-container/15 ${compact ? "p-sm" : "p-md"}`}>
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-secondary">contract</span>
          <h3 className="font-label-md text-label-md text-primary">{t("purchaseTitle")}</h3>
        </div>

        {!compact && (
          <p className="mt-sm text-xs text-on-surface-variant">{t("purchaseDesc")}</p>
        )}

        {contract?.signed || contract?.acknowledged ? (
          <div className="mt-sm flex flex-wrap items-center gap-sm">
            <span className="flex items-center gap-xs text-on-tertiary-container">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="font-label-md text-label-md">
                {contract.signed ? t("signed") : t("acknowledged")}
              </span>
            </span>
            {contract.signed && (
              <button
                type="button"
                onClick={() => void handleOpenPdf()}
                disabled={openingPdf}
                className="inline-flex items-center gap-xs rounded-lg border border-secondary/50 bg-surface px-3 py-1.5 font-label-md text-label-md text-secondary hover:bg-secondary-container/30 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                {openingPdf ? tCommon("opening") : tCommon("viewPdf")}
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-sm inline-flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 font-label-md text-label-md text-on-secondary hover:bg-secondary-fixed-dim"
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            {tCommon("readAndSign")}
          </button>
        )}

        {error && <p className="mt-sm text-sm text-error">{error}</p>}
      </div>

      <PurchaseContractSignModal
        auctionId={auctionId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSigned={handleSigned}
      />
    </>
  );
}
