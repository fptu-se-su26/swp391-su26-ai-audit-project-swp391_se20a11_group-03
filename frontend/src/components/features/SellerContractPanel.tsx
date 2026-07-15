"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import {
  SellerContract,
  acknowledgeSellerContract,
  fetchSellerContractPdfBlobUrl,
  fetchSellerContractPreviewBlobUrl,
  getMySellerContract,
  hasLocalSellerContractAck,
  openSellerContractPdf,
  setLocalSellerContractAck,
  submitSellerRegistration,
} from "@/lib/services/sellerContractService";

type Props = {
  userId?: number;
  identityVerified?: boolean;
  onSubmitted?: (contract: SellerContract) => void;
  showSteps?: boolean;
};

export default function SellerContractPanel({
  userId,
  identityVerified = false,
  onSubmitted,
  showSteps = true,
}: Props) {
  const t = useTranslations("kyc.sellerContract");
  const tReg = useTranslations("becomeSeller");
  const [contract, setContract] = useState<SellerContract | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMySellerContract()
      .then((c) => {
        if (!cancelled) {
          setContract(c);
          if (c?.signed) {
            setAcknowledged(true);
          } else if (hasLocalSellerContractAck(userId)) {
            setAcknowledged(true);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError(tReg("loadContractError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tReg, userId]);

  useEffect(() => {
    if (contract?.signed) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    setPreviewLoading(true);
    fetchSellerContractPreviewBlobUrl()
      .then((url) => {
        if (!cancelled) {
          objectUrl = url;
          setPreviewUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : tReg("previewError"));
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [contract?.signed, tReg]);

  useEffect(() => {
    if (!contract?.signed) {
      setSignedPdfUrl(null);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    fetchSellerContractPdfBlobUrl()
      .then((url) => {
        if (!cancelled) {
          objectUrl = url;
          setSignedPdfUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      })
      .catch(() => {
        if (!cancelled) setError(tReg("previewError"));
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [contract?.signed, tReg]);

  async function handleAcknowledge() {
    if (!agree) {
      setError(t("agreeRequired"));
      return;
    }
    setAcknowledging(true);
    setError("");
    try {
      await acknowledgeSellerContract();
      setLocalSellerContractAck(userId);
      setAcknowledged(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("signFailed"));
    } finally {
      setAcknowledging(false);
    }
  }

  async function handleSubmit() {
    if (!acknowledged) {
      setError(tReg("acknowledgeFirst"));
      return;
    }
    if (!identityVerified) {
      setError(tReg("kycRequiredBeforeSubmit"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await submitSellerRegistration();
      setContract(result);
      setAcknowledged(true);
      onSubmitted?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : tReg("submitFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  const contractPersisted = Boolean(contract?.signed);

  if (loading) {
    return <p className="text-sm text-on-surface-variant">{tReg("loading")}</p>;
  }

  return (
    <div className="space-y-md">
      {showSteps && (
        <ol className="grid gap-3 sm:grid-cols-3">
          {[
            tReg("step1"),
            tReg("step2"),
            tReg("step3"),
          ].map((label, index) => (
            <li
              key={label}
              className={`rounded-xl border px-4 py-3 text-sm ${
                index === 0 || acknowledged || contractPersisted
                  ? "border-[#d7c9a8] bg-[#fffdf8]"
                  : "border-outline-variant bg-surface-container-low"
              }`}
            >
              <span className="font-mono text-xs font-bold text-[#a17b2c]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-1 font-label-md text-label-md text-primary">{label}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="rounded-2xl border border-secondary/40 bg-secondary-container/10 p-md sm:p-lg">
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-secondary">contract</span>
          <h2 className="font-headline-sm text-headline-sm text-primary">{t("title")}</h2>
        </div>
        <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">{t("subtitle")}</p>

        <div className="mt-md max-h-44 overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest p-md text-sm text-on-surface-variant">
          <p className="font-label-md text-label-md text-primary">{t("termsTitle")}</p>
          <p className="mt-2">{t("term1")}</p>
          <p className="mt-1">{t("term2")}</p>
          <p className="mt-1">{t("term3")}</p>
          <p className="mt-1">{t("term4")}</p>
          <p className="mt-1">{t("term5")}</p>
        </div>

        <div className="mt-md">
          <p className="mb-2 font-label-md text-label-md text-on-surface-variant">{tReg("pdfPreviewTitle")}</p>
          {contractPersisted && signedPdfUrl ? (
            <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface">
              <iframe title="Seller contract PDF" src={signedPdfUrl} className="h-[min(70vh,520px)] w-full" />
            </div>
          ) : previewLoading ? (
            <p className="text-sm text-on-surface-variant">{tReg("previewLoading")}</p>
          ) : previewUrl ? (
            <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface">
              <iframe title="Seller contract preview" src={previewUrl} className="h-[min(70vh,520px)] w-full" />
            </div>
          ) : (
            <p className="text-sm text-error">{tReg("previewError")}</p>
          )}
          {!contractPersisted && previewUrl && (
            <a
              href={previewUrl}
              download="seller-agreement-preview.pdf"
              className="mt-2 inline-flex items-center gap-1 text-sm text-secondary hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              {tReg("downloadPreview")}
            </a>
          )}
        </div>

        {error && (
          <p className="mt-md rounded-lg border border-error/40 bg-error-container px-3 py-2 text-sm text-on-error-container">
            {error}
          </p>
        )}

        {contractPersisted ? (
          <div className="mt-md flex flex-wrap items-center gap-sm">
            <span className="flex items-center gap-xs text-on-tertiary-container">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <span className="font-label-md text-label-md">{t("signed")}</span>
            </span>
            {signedPdfUrl && (
              <button
                type="button"
                onClick={() => openSellerContractPdf().catch(() => setError(tReg("previewError")))}
                className="inline-flex items-center gap-xs rounded-lg border border-secondary/50 bg-surface px-3 py-1.5 font-label-md text-label-md text-secondary hover:bg-secondary-container/30"
              >
                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                {t("viewPdf")}
              </button>
            )}
          </div>
        ) : (
          <div className="mt-md space-y-sm">
            {!acknowledged ? (
              <>
                <label className="flex items-start gap-sm">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="font-body-md text-body-md text-on-surface-variant">{t("agreeLabel")}</span>
                </label>
                <button
                  type="button"
                  onClick={handleAcknowledge}
                  disabled={acknowledging || !agree}
                  className="inline-flex items-center justify-center gap-xs rounded-xl border border-secondary bg-surface px-lg py-sm font-label-md text-label-md text-secondary transition-colors hover:bg-secondary-container/30 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {acknowledging ? tReg("acknowledging") : tReg("acknowledgeContract")}
                </button>
              </>
            ) : (
              <p className="rounded-lg border border-tertiary/30 bg-tertiary-container/20 px-3 py-2 text-sm text-on-tertiary-container">
                {tReg("acknowledgedPendingSubmit")}
              </p>
            )}

            {acknowledged && (
              <>
                {identityVerified ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-xs rounded-xl bg-secondary px-lg py-sm font-label-md text-label-md text-on-secondary transition-colors hover:bg-secondary-fixed-dim disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    {submitting ? tReg("submitting") : tReg("submitSellerRegistration")}
                  </button>
                ) : (
                  <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm text-on-surface-variant">
                    <p>{tReg("kycRequiredBeforeSubmit")}</p>
                    <Link href="/kyc" className="mt-2 inline-flex items-center gap-1 font-label-md text-secondary hover:underline">
                      {tReg("goToKyc")}
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
