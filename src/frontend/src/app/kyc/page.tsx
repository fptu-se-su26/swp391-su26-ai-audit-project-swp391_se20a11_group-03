"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import CollectorShell from "@/components/layout/CollectorShell";
import { KycSubmission, getMyKyc, scanCccdOcr, submitKyc } from "@/lib/services/kycService";
import ProtectedKycImage from "@/components/features/ProtectedKycImage";
import { StoredUser, getStoredUser, saveStoredUser, subscribeStoredUser } from "@/lib/userSession";
import { useTranslations } from "@/i18n/I18nProvider";
import { getMyProfile } from "@/lib/services/userProfileService";
import {
  acknowledgeSellerContract,
  fetchSellerContractPreviewBlobUrl,
  getMySellerContract,
  hasLocalSellerContractAck,
  openSellerContractPdf,
  setLocalSellerContractAck,
} from "@/lib/services/sellerContractService";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });

type UploadedDoc = { file: File; preview: string };

export default function KYCPage() {
  const t = useTranslations("kyc");
  const tCommon = useTranslations("common");
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [existing, setExisting] = useState<KycSubmission | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("MALE");
  const [issueDate, setIssueDate] = useState("");
  const [issuePlace, setIssuePlace] = useState("");

  const [frontDoc, setFrontDoc] = useState<UploadedDoc | null>(null);
  const [backDoc, setBackDoc] = useState<UploadedDoc | null>(null);
  const [selfieDoc, setSelfieDoc] = useState<UploadedDoc | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const [contractSigned, setContractSigned] = useState(false);
  const [contractAcknowledged, setContractAcknowledged] = useState(false);
  const [contractUrl, setContractUrl] = useState<string | null>(null);
  const [agreeContract, setAgreeContract] = useState(false);
  const [signingContract, setSigningContract] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState<string | null>(null);
  const [ocrReady, setOcrReady] = useState(false);

  const isSeller = (currentUser?.roleName ?? "").trim().toLowerCase().includes("seller");
  const contractReady = contractSigned || (isSeller && (agreeContract || contractAcknowledged));
  const formLocked =
    existing?.status === "PENDING" ||
    existing?.status === "APPROVED" ||
    identityVerified;

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    syncUser();
    return subscribeStoredUser(syncUser);
  }, []);

  useEffect(() => {
    if (!isSeller) {
      setContractSigned(false);
      setContractAcknowledged(false);
      setContractUrl(null);
      return;
    }
    if (hasLocalSellerContractAck(currentUser?.userId)) {
      setContractAcknowledged(true);
    }
    let cancelled = false;
    getMySellerContract()
      .then((c) => {
        if (!cancelled) {
          const persisted = Boolean(c?.signed);
          setContractSigned(persisted);
          setContractAcknowledged(persisted || Boolean(c?.acknowledged) || hasLocalSellerContractAck(currentUser?.userId));
          setContractUrl(c?.fileUrl ?? null);
        }
      })
      .catch(() => {
        // best-effort
      });
    return () => {
      cancelled = true;
    };
  }, [isSeller, currentUser?.userId]);

  useEffect(() => {
    let cancelled = false;
    getMyKyc()
      .then((submission) => {
        if (!cancelled) {
          setExisting(submission);
          if (submission && (submission.status === "PENDING" || submission.status === "APPROVED")) {
            setFullName(submission.fullName);
            setPhone(submission.phone);
            setCccdNumber(submission.cccdNumber);
            setDob(submission.dob ?? "");
            setGender(submission.gender?.toUpperCase() || "MALE");
            setIssueDate(submission.issueDate ?? "");
            setIssuePlace(submission.issuePlace);
          }
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setFeedback({ tone: "error", message: error instanceof Error ? error.message : t("errors.loadFailed") });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Prefill fullName / phone from the current profile so the form matches
  // the user's verified identity information before submission.
  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((p) => {
        if (cancelled) return;
        setFullName((current) => current || p.fullName || "");
        setPhone((current) => current || p.phone || "");
      })
      .catch(() => {
        // ignore - profile is best-effort
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((p) => {
        if (!cancelled) setIdentityVerified(Boolean(p.identityVerified));
      })
      .catch(() => {
        if (!cancelled) setIdentityVerified(Boolean(currentUser?.identityVerified));
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.userId, currentUser?.identityVerified]);

  function friendlyOcrError(message: string) {
    const lower = message.toLowerCase();
    if (lower.includes("429") || lower.includes("quota") || lower.includes("resource_exhausted")) {
      return t("errors.ocrBusy");
    }
    if (lower.includes("gemini api http")) {
      return t("errors.ocrFailed");
    }
    return message;
  }

  async function handleRunOcr() {
    if (formLocked || !frontDoc?.file || !backDoc?.file) {
      setOcrMessage(t("errors.ocrNeedBothSides"));
      setOcrReady(false);
      return;
    }

    setOcrLoading(true);
    setOcrMessage(null);
    setOcrReady(false);
    try {
      const result = await scanCccdOcr(frontDoc.file, backDoc.file);
      setOcrMessage(result.message);
      setOcrReady(result.success);
      if (result.fullName) setFullName(result.fullName);
      if (result.cccdNumber) setCccdNumber(result.cccdNumber);
      if (result.dob) setDob(result.dob);
      if (result.gender) setGender(result.gender);
      if (result.issueDate) setIssueDate(result.issueDate);
      if (result.issuePlace) setIssuePlace(result.issuePlace);
    } catch (error) {
      setOcrMessage(
        friendlyOcrError(error instanceof Error ? error.message : t("errors.ocrFailed")),
      );
      setOcrReady(false);
    } finally {
      setOcrLoading(false);
    }
  }

  // Revoke object URLs when the component unmounts to avoid leaking memory.
  useEffect(() => {
    return () => {
      [frontDoc, backDoc, selfieDoc].forEach((doc) => {
        if (doc?.preview) URL.revokeObjectURL(doc.preview);
      });
    };
  }, [frontDoc, backDoc, selfieDoc]);

  const handleFile = (setter: (doc: UploadedDoc | null) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setter(null);
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      event.target.value = "";
      setFeedback({ tone: "error", message: t("errors.invalidImageType") });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      event.target.value = "";
      setFeedback({ tone: "error", message: t("errors.imageTooLarge") });
      return;
    }
    setter({ file, preview: URL.createObjectURL(file) });
  };

  if (!currentUser) {
    return (
      <CollectorShell>
        <div className="mx-auto max-w-[800px] p-margin-mobile md:p-margin-desktop">
          <div className="rounded-xl border border-dashed border-outline-variant bg-surface p-xl text-center">
            <h1 className="font-headline-md text-headline-md text-primary">{t("signedOutTitle")}</h1>
            <p className="mt-sm font-body-md text-body-md text-on-surface-variant">
              {t("signedOutDesc")}
            </p>
            <Link
              href="/auth"
              className="mt-md inline-flex items-center gap-xs rounded-lg bg-primary px-lg py-sm font-label-md text-label-md text-on-primary"
            >
              {t("signedOutCta")}
            </Link>
          </div>
        </div>
      </CollectorShell>
    );
  }

  const isReadOnly = formLocked;

  const handleSignContract = async () => {
    if (!agreeContract) {
      setFeedback({ tone: "error", message: t("sellerContract.agreeRequired") });
      return;
    }
    setSigningContract(true);
    setFeedback(null);
    try {
      await acknowledgeSellerContract();
      setLocalSellerContractAck(currentUser?.userId);
      setContractAcknowledged(true);
      setFeedback({
        tone: "success",
        message: t("errors.contractConfirmedPending"),
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : t("sellerContract.signFailed"),
      });
    } finally {
      setSigningContract(false);
    }
  };

  const handleOpenContractPdf = async () => {
    try {
      if (contractSigned) {
        await openSellerContractPdf();
        return;
      }
      const url = await fetchSellerContractPreviewBlobUrl();
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) {
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setFeedback({ tone: "error", message: t("sellerContract.signFailed") });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!frontDoc || !backDoc || !selfieDoc) {
      setFeedback({ tone: "error", message: t("errors.missingPhotos") });
      document.getElementById("kyc-photos")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (isSeller && !contractReady) {
      setFeedback({ tone: "error", message: t("sellerContract.signBeforeSubmit") });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitKyc({
        fullName: fullName.trim(),
        phone: phone.trim(),
        cccdNumber: cccdNumber.trim(),
        dob,
        gender,
        issueDate,
        issuePlace: issuePlace.trim(),
        frontImage: frontDoc.file,
        backImage: backDoc.file,
        selfieImage: selfieDoc.file,
        signSellerAgreement: isSeller && contractReady,
      });
      if (result.success && result.data) {
        setExisting(result.data);
        if (isSeller && contractReady) {
          setContractSigned(true);
          const user = getStoredUser();
          if (user) {
            saveStoredUser({ ...user, roleName: "Seller" });
          }
        }
        if (currentUser?.userId) {
          sessionStorage.removeItem(`bz_seller_contract_ack_${currentUser.userId}`);
        }
        setFeedback({ tone: "success", message: result.message || t("errors.submitted") });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setFeedback({ tone: "error", message: result.message || t("errors.submissionFailed") });
      }
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : t("errors.submissionFailed") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CollectorShell>
      <div className="mx-auto max-w-[800px] space-y-lg p-margin-mobile md:p-margin-desktop">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display-lg-mobile text-primary md:font-display-lg">{t("pageTitle")}</h1>
            <p className="mt-xs font-body-lg text-on-surface-variant">
              {t("pageSubtitle")}
            </p>
          </div>
          {existing && <StatusBadge status={existing.status} labelApproved={t("status.approved")} labelRejected={t("status.rejected")} labelActionNeeded={t("status.actionNeeded")} labelUnderReview={t("status.underReview")} />}
        </div>

        {identityVerified && (
          <div className="flex items-center gap-sm rounded-lg border border-tertiary/40 bg-tertiary-container/40 px-md py-sm text-on-tertiary-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <p className="font-body-md text-body-md">
              {t("verified")}
            </p>
          </div>
        )}

        {existing?.status === "REJECTED" && existing.rejectionReason && (
          <div className="rounded-lg border border-error/40 bg-error-container px-md py-sm text-on-error-container">
            <p className="font-label-md text-label-md">{t("rejectedTitle")}</p>
            <p className="mt-xs font-body-md text-body-md">
              <span className="font-semibold">{t("rejectionReasonLabel")}: </span>
              {existing.rejectionReason}
            </p>
            <p className="mt-xs font-body-sm text-body-sm">{t("rejectedHelp")}</p>
          </div>
        )}

        {existing?.status === "INFO_REQUIRED" && existing.rejectionReason && (
          <div className="rounded-lg border border-secondary/40 bg-secondary-container/40 px-md py-sm text-on-secondary-container">
            <p className="font-label-md text-label-md">{t("infoRequiredTitle")}</p>
            <p className="mt-xs font-body-md text-body-md">
              <span className="font-semibold">{t("rejectionReasonLabel")}: </span>
              {existing.rejectionReason}
            </p>
            <p className="mt-xs font-body-sm text-body-sm">{t("infoRequiredHelp")}</p>
          </div>
        )}

        {existing?.status === "PENDING" && (
          <div className="rounded-lg border border-secondary/40 bg-secondary-container/40 px-md py-sm text-on-secondary-container">
            <p className="font-label-md text-label-md">{t("pendingTitle")}</p>
            <p className="mt-xs font-body-md text-body-md">{t("pendingSubmittedOn", { date: existing.submittedAt ? dateFormatter.format(new Date(existing.submittedAt)) : t("pendingDash") })}</p>
          </div>
        )}

        {feedback && (
          <div
            className={`rounded-lg border px-4 py-3 font-body-md text-body-md ${
              feedback.tone === "success"
                ? "border-tertiary/40 bg-tertiary-container text-on-tertiary-container"
                : "border-error/40 bg-error-container text-error"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-md rounded-xl border border-surface-variant bg-surface p-lg soft-shadow">
          <div id="kyc-photos">
            <h2 className="font-headline-sm text-headline-sm text-primary">{t("sectionPhotos")}</h2>
            <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">{t("ocrFlowHint")}</p>
            {!isReadOnly && (!frontDoc || !backDoc || !selfieDoc) && (
              <p className="mt-sm rounded-lg border border-secondary/30 bg-secondary-container/20 px-3 py-2 text-sm text-on-secondary-container">
                {t("errors.submitNeedThreePhotos")}
              </p>
            )}
          </div>

          {isReadOnly && existing && (existing.frontImageUrl || existing.backImageUrl || existing.selfieImageUrl) && (
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-md">
              <p className="mb-sm font-label-md text-label-md text-on-surface-variant">{t("submittedPhotos")}</p>
              <div className="grid gap-sm md:grid-cols-3">
                <ExistingPhoto label={t("frontPhoto")} src={existing.frontImageUrl} />
                <ExistingPhoto label={t("backPhoto")} src={existing.backImageUrl} />
                <ExistingPhoto label={t("selfiePhoto")} src={existing.selfieImageUrl} />
              </div>
            </div>
          )}

          <div className={`grid gap-md md:grid-cols-2 ${isReadOnly ? "hidden" : ""}`}>
            <UploadField
              title={t("uploadFront")}
              doc={frontDoc}
              onChange={handleFile(setFrontDoc)}
              disabled={isReadOnly}
              labelUpload={t("clickToUpload")}
              labelFormat={t("fileFormat")}
              labelRemove={t("remove")}
            />
            <UploadField
              title={t("uploadBack")}
              doc={backDoc}
              onChange={handleFile(setBackDoc)}
              disabled={isReadOnly}
              labelUpload={t("clickToUpload")}
              labelFormat={t("fileFormat")}
              labelRemove={t("remove")}
            />
          </div>

          {!isReadOnly && (
            <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => void handleRunOcr()}
                disabled={ocrLoading || !frontDoc?.file || !backDoc?.file}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-secondary/50 bg-surface px-md py-sm font-label-md text-label-md text-secondary transition hover:bg-secondary-container/30 disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[18px] ${ocrLoading ? "animate-spin" : ""}`}>
                  {ocrLoading ? "progress_activity" : "document_scanner"}
                </span>
                {ocrLoading ? t("ocrScanning") : t("errors.scanCccdAi")}
              </button>
              <p className="text-sm text-on-surface-variant">
                OCR không bắt buộc — bạn có thể điền thủ công và gửi hồ sơ.
              </p>
            </div>
          )}

          {!isReadOnly && (ocrLoading || ocrMessage) && (
            <div className={`rounded-lg border px-md py-sm ${ocrLoading ? "border-secondary/40 bg-secondary-container/30 text-on-secondary-container" : ocrReady ? "border-tertiary/40 bg-tertiary-container/40 text-on-tertiary-container" : "border-outline-variant bg-surface-container-low text-on-surface-variant"}`}>
              <p className="flex items-center gap-sm font-label-md text-label-md">
                <span className={`material-symbols-outlined text-[18px] ${ocrLoading ? "animate-spin" : ""}`}>
                  {ocrLoading ? "progress_activity" : ocrReady ? "auto_awesome" : "info"}
                </span>
                {ocrLoading ? t("ocrScanning") : ocrMessage}
              </p>
            </div>
          )}

          <div className={`grid gap-md md:grid-cols-1 ${isReadOnly ? "hidden" : ""}`}>
            <UploadField
              title={t("uploadSelfie")}
              doc={selfieDoc}
              onChange={handleFile(setSelfieDoc)}
              disabled={isReadOnly}
              labelUpload={t("clickToUpload")}
              labelFormat={t("fileFormat")}
              labelRemove={t("remove")}
            />
          </div>

          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary">{t("sectionReview")}</h2>
            <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">{t("sectionReviewHint")}</p>
          </div>
          <div className="grid gap-md md:grid-cols-2">
            <Field label={t("fieldFullName")} required>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                disabled={isReadOnly}
                required
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-body-md text-body-md outline-none focus:border-secondary disabled:opacity-60"
              />
            </Field>
            <Field label={t("fieldPhone")} required>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={isReadOnly}
                required
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-body-md text-body-md outline-none focus:border-secondary disabled:opacity-60"
              />
            </Field>
            <Field label={t("fieldIdNumber")} required>
              <input
                value={cccdNumber}
                onChange={(event) => setCccdNumber(event.target.value)}
                disabled={isReadOnly}
                required
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-body-md text-body-md outline-none focus:border-secondary disabled:opacity-60"
              />
            </Field>
            <Field label={t("fieldDob")} required>
              <input
                type="date"
                value={dob}
                onChange={(event) => setDob(event.target.value)}
                disabled={isReadOnly}
                required
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-body-md text-body-md outline-none focus:border-secondary disabled:opacity-60"
              />
            </Field>
            <Field label={t("fieldGender")} required>
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                disabled={isReadOnly}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-body-md text-body-md outline-none focus:border-secondary disabled:opacity-60"
              >
                <option value="MALE">{t("genderMale")}</option>
                <option value="FEMALE">{t("genderFemale")}</option>
                <option value="OTHER">{t("genderOther")}</option>
              </select>
            </Field>
            <Field label={t("fieldIssueDate")} required>
              <input
                type="date"
                value={issueDate}
                onChange={(event) => setIssueDate(event.target.value)}
                disabled={isReadOnly}
                required
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-body-md text-body-md outline-none focus:border-secondary disabled:opacity-60"
              />
            </Field>
            <Field label={t("fieldIssuePlace")} required className="md:col-span-2">
              <input
                value={issuePlace}
                onChange={(event) => setIssuePlace(event.target.value)}
                disabled={isReadOnly}
                required
                placeholder={t("fieldIssuePlacePlaceholder")}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 font-body-md text-body-md outline-none focus:border-secondary disabled:opacity-60"
              />
            </Field>
          </div>

          {isSeller && (
            <div className="rounded-lg border border-secondary/40 bg-secondary-container/20 p-md">
              <h2 className="font-headline-sm text-headline-sm text-primary">{t("sellerContract.title")}</h2>
              <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">{t("sellerContract.subtitle")}</p>
              <div className="mt-sm max-h-48 overflow-y-auto rounded-md border border-outline-variant bg-surface-container-lowest p-md font-body-sm text-body-sm text-on-surface-variant">
                <p className="font-label-md text-label-md text-primary">{t("sellerContract.termsTitle")}</p>
                <p className="mt-xs">{t("sellerContract.term1")}</p>
                <p className="mt-xs">{t("sellerContract.term2")}</p>
                <p className="mt-xs">{t("sellerContract.term3")}</p>
                <p className="mt-xs">{t("sellerContract.term4")}</p>
                <p className="mt-xs">{t("sellerContract.term5")}</p>
              </div>
              {contractReady ? (
                <div className="mt-sm flex flex-wrap items-center gap-sm text-on-tertiary-container">
                  <span className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <span className="font-label-md text-label-md">
                      {contractSigned ? t("sellerContract.signed") : t("errors.contractConfirmedOnSubmit")}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleOpenContractPdf()}
                    className="inline-flex items-center gap-xs rounded-lg border border-secondary/50 bg-surface px-3 py-1.5 font-label-md text-label-md text-secondary hover:bg-secondary-container/30"
                  >
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                    {t("sellerContract.viewPdf")}
                  </button>
                </div>
              ) : (
                <div className="mt-sm space-y-sm">
                  <label className="flex items-start gap-sm">
                    <input
                      type="checkbox"
                      checked={agreeContract}
                      onChange={(e) => setAgreeContract(e.target.checked)}
                      disabled={contractSigned}
                      className="mt-1"
                    />
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      {t("sellerContract.agreeLabel")}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSignContract}
                    disabled={!agreeContract || signingContract}
                    className="inline-flex items-center justify-center gap-xs rounded-xl border-2 border-secondary bg-surface px-lg py-sm font-label-md text-label-md text-secondary transition-colors hover:bg-secondary-container/30 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">draw</span>
                    {signingContract ? t("sellerContract.signing") : t("sellerContract.signButton")}
                  </button>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t("sellerContract.signHint")}</p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isReadOnly || (isSeller && !contractReady)}
            className="flex w-full items-center justify-center gap-xs rounded-xl bg-secondary py-md font-headline-sm text-headline-sm text-on-secondary transition-colors hover:bg-secondary-fixed-dim disabled:opacity-50"
          >
            <span className="material-symbols-outlined">send</span>
            {isSubmitting
              ? t("submitting")
              : existing
                ? t("resubmit")
                : t("submit")}
          </button>
        </form>
      </div>
    </CollectorShell>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block font-label-md text-label-md text-on-surface-variant">
        {label}
        {required && <span className="ml-1 text-error">*</span>}
      </span>
      {children}
    </label>
  );
}

function UploadField({
  title,
  doc,
  onChange,
  disabled,
  labelUpload,
  labelFormat,
  labelRemove,
}: {
  title: string;
  doc: UploadedDoc | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  labelUpload: string;
  labelFormat: string;
  labelRemove: string;
}) {
  return (
    <div className="rounded-xl border border-surface-variant bg-surface p-md">
      <p className="mb-sm font-label-md text-label-md text-on-surface-variant">{title}</p>
      {doc?.preview ? (
        <div className="space-y-sm">
          <img src={doc.preview} alt={title} className="aspect-[4/3] w-full rounded-md object-cover" />
          <p className="truncate font-body-sm text-body-sm text-on-surface-variant">{doc.file.name}</p>
          {!disabled && (
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(doc.preview);
                onChange({ target: { files: [] } } as unknown as React.ChangeEvent<HTMLInputElement>);
              }}
              className="flex items-center gap-1 font-label-sm text-label-sm text-error hover:text-error/80"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              {labelRemove}
            </button>
          )}
        </div>
      ) : (
        <label className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-xs rounded-md border-2 border-dashed border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors hover:border-secondary hover:text-secondary ${disabled ? "pointer-events-none opacity-50" : ""}`}>
          <span className="material-symbols-outlined text-3xl">upload_file</span>
          <span className="font-label-sm text-label-sm">{labelUpload}</span>
          <span className="font-body-sm text-body-sm">{labelFormat}</span>
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={onChange}
            disabled={disabled}
          />
        </label>
      )}
    </div>
  );
}

function ExistingPhoto({ label, src }: { label: string; src: string }) {
  return (
    <div className="rounded-md border border-outline-variant bg-surface p-sm">
      <p className="mb-xs font-label-sm text-label-sm text-on-surface-variant">{label}</p>
      <ProtectedKycImage src={src} alt={label} className="aspect-[4/3] w-full rounded-sm object-cover" />
    </div>
  );
}

function StatusBadge({ status, labelApproved, labelRejected, labelActionNeeded, labelUnderReview }: { status: string; labelApproved: string; labelRejected: string; labelActionNeeded: string; labelUnderReview: string }) {
  if (status === "APPROVED") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-tertiary-fixed px-3 py-1 text-[10px] font-bold uppercase text-on-tertiary-fixed-variant">
        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        {labelApproved}
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-error-container px-3 py-1 text-[10px] font-bold uppercase text-on-error-container">
        <span className="material-symbols-outlined text-[14px]">close</span>
        {labelRejected}
      </span>
    );
  }
  if (status === "INFO_REQUIRED") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase text-on-secondary-container">
        <span className="material-symbols-outlined text-[14px]">help</span>
        {labelActionNeeded}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase text-on-secondary-container">
      <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
      {labelUnderReview}
    </span>
  );
}
