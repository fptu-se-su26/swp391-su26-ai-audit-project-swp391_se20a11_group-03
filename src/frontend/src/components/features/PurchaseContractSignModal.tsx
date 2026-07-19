"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import {
  PurchaseContractPreview,
  getPurchaseContract,
  openPurchaseContractPdf,
  signPurchaseContract,
} from "@/lib/services/purchaseContractService";

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
}

type Props = {
  auctionId: number;
  open: boolean;
  onClose: () => void;
  onSigned?: () => void;
};

export default function PurchaseContractSignModal({ auctionId, open, onClose, onSigned }: Props) {
  const t = useTranslations("contracts");
  const tCommon = useTranslations("common");
  const [preview, setPreview] = useState<PurchaseContractPreview | null>(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [openingPdf, setOpeningPdf] = useState(false);
  const [error, setError] = useState("");
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setAgree(false);
    setSigned(false);

    getPurchaseContract(auctionId)
      .then((data) => {
        if (cancelled) return;
        setPreview(data);
        if (data.signed || data.acknowledged) setSigned(true);
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
  }, [auctionId, open]);

  async function handleSign() {
    if (!agree) {
      setError(t("mustAgree"));
      return;
    }
    setSigning(true);
    setError("");
    try {
      await signPurchaseContract(auctionId);
      const refreshed = await getPurchaseContract(auctionId);
      setPreview(refreshed);
      setSigned(Boolean(refreshed.signed || refreshed.acknowledged));
      onSigned?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("signFailed"));
    } finally {
      setSigning(false);
    }
  }

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/55" aria-label={t("close")} onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">contract</span>
            <h2 className="font-headline-sm text-headline-sm text-primary">{t("purchaseTitle")}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface-variant/40">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
              {t("modalLoading")}
            </div>
          ) : preview ? (
            <div className="space-y-4 text-sm text-on-surface">
              <p className="text-center text-xs text-on-surface-variant">
                LuxeAuction · {t("contractCode")}: PUR-{preview.auctionId ?? auctionId}
              </p>
              <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
                <p><strong>{t("productLabel")}:</strong> {preview.productName} (#{preview.productId ?? "—"})</p>
                <p className="mt-1"><strong>{t("paymentPrice")}:</strong> {formatCurrency(preview.finalPrice)}</p>
                <p className="mt-1"><strong>{t("auctionSession")}:</strong> #{preview.auctionId}</p>
              </div>

              <section>
                <h3 className="font-label-md text-label-md text-primary">{t("article1")}</h3>
                <p className="mt-2"><strong>{t("sellerParty")}:</strong> {preview.sellerName ?? "—"} — {preview.sellerEmail ?? "—"}</p>
                <p className="mt-1"><strong>{t("buyerParty")}:</strong> {preview.buyerName ?? "—"} — {preview.buyerEmail ?? "—"}</p>
                <p className="mt-1"><strong>{t("platformParty")}:</strong> LUXEAUCTION ({preview.adminName ?? "LuxeAuction Admin"})</p>
              </section>

              <section>
                <h3 className="font-label-md text-label-md text-primary">{t("article2")}</h3>
                <p className="mt-2 text-on-surface-variant">
                  {t("article2Body", { price: formatCurrency(preview.finalPrice) })}
                </p>
              </section>

              <section>
                <h3 className="font-label-md text-label-md text-primary">{t("article3")}</h3>
                <p className="mt-2 text-on-surface-variant">{t("article3Body")}</p>
              </section>

              <section>
                <h3 className="font-label-md text-label-md text-primary">{t("article4")}</h3>
                <p className="mt-2 text-on-surface-variant">{t("article4Body")}</p>
              </section>

              <div className="grid gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:grid-cols-2">
                <div>
                  <p className="font-label-md text-label-md text-primary">{t("sellerPlatformSign")}</p>
                  <p className="mt-1">{preview.adminName}</p>
                  <p className="text-tertiary text-xs mt-1">✔ {t("preSigned")}</p>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-primary">{t("buyerSign")}</p>
                  <p className="mt-1">{preview.buyerName}</p>
                  <p className={`text-xs mt-1 ${signed ? "text-tertiary" : "text-on-surface-variant"}`}>
                    {signed ? `✔ ${t("signedElectronic")}` : t("notSignedYet")}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-10 text-center text-error">{error || t("loadFailed")}</p>
          )}
        </div>

        <div className="border-t border-outline-variant px-5 py-4">
          {signed ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-1 text-sm text-tertiary">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                {preview?.signed ? t("signedPdfSaved") : t("ackPdfOnPay")}
              </p>
              <div className="flex gap-2">
                {preview?.signed && (
                  <button
                    type="button"
                    onClick={() => void handleOpenPdf()}
                    disabled={openingPdf}
                    className="inline-flex items-center gap-1 rounded-lg border border-secondary/50 px-4 py-2 text-sm text-secondary hover:bg-secondary-container/20 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                    {openingPdf ? tCommon("opening") : tCommon("downloadPdf")}
                  </button>
                )}
                <button type="button" onClick={onClose} className="rounded-lg bg-primary px-4 py-2 text-sm text-on-primary">
                  {t("close")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
                <span className="text-sm text-on-surface-variant">{t("agreeFullContract")}</span>
              </label>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-outline-variant px-4 py-2 text-sm">
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSign()}
                  disabled={signing || !agree || loading || !preview}
                  className="rounded-lg bg-secondary px-4 py-2 text-sm text-on-secondary disabled:opacity-60"
                >
                  {signing ? t("signing") : t("signButton")}
                </button>
              </div>
            </>
          )}
          {error && !loading && <p className="mt-2 text-sm text-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
