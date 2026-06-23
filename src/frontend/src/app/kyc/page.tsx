"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import CollectorShell from "@/components/layout/CollectorShell";
import { KycSubmission, getMyKyc, submitKyc } from "@/lib/services/kycService";
import ProtectedKycImage from "@/components/features/ProtectedKycImage";
import { StoredUser, getStoredUser, subscribeStoredUser } from "@/lib/userSession";
import { useTranslations } from "@/i18n/I18nProvider";
import { getMyProfile } from "@/lib/services/userProfileService";
import { getMySellerContract, signSellerContract } from "@/lib/services/sellerContractService";
import { resolveApiUrl } from "@/lib/apiClient";

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
  const [contractUrl, setContractUrl] = useState<string | null>(null);
  const [agreeContract, setAgreeContract] = useState(false);

  const isSeller = (currentUser?.roleName ?? "").toLowerCase().includes("seller");

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    syncUser();
    return subscribeStoredUser(syncUser);
  }, []);

  // Sellers must also sign the platform agreement. Load its current state.
  useEffect(() => {
    if (!isSeller) return;
    let cancelled = false;
    getMySellerContract()
      .then((c) => {
        if (!cancelled) {
          setContractSigned(Boolean(c?.signed));
          setContractUrl(c?.fileUrl ?? null);
        }
      })
      .catch(() => {
        // best-effort
      });
    return () => {
      cancelled = true;
    };
  }, [isSeller]);

  useEffect(() => {
    let cancelled = false;
    getMyKyc()
      .then((submission) => {
        if (!cancelled) {
          setExisting(submission);
          if (submission) {
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
      setFeedback({ tone: "error", message: "Chỉ chấp nhận ảnh JPEG hoặc PNG." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      event.target.value = "";
      setFeedback({ tone: "error", message: "Mỗi ảnh KYC không được vượt quá 8 MB." });
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

  const isReadOnly =
    existing?.status === "PENDING" ||
    existing?.status === "APPROVED" ||
    currentUser.identityVerified === true;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!frontDoc || !backDoc || !selfieDoc) {
      setFeedback({ tone: "error", message: t("errors.missingPhotos") });
      return;
    }

    if (isSeller && !contractSigned && !agreeContract) {
      setFeedback({ tone: "error", message: "Bạn cần đọc và đồng ý ký hợp đồng nền tảng dành cho người bán." });
      return;
    }

    setIsSubmitting(true);
    try {
      // Seller: sign the platform agreement first (idempotent). This is sent to staff
      // and reviewed together with the KYC submission.
      if (isSeller && !contractSigned) {
        const signed = await signSellerContract();
        setContractSigned(true);
        setContractUrl(signed?.fileUrl ?? null);
      }
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
      });
      if (result.success && result.data) {
        setExisting(result.data);
        setFeedback({ tone: "success", message: result.message || t("errors.submitted") });
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

        {currentUser.identityVerified && (
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
            <p className="mt-xs font-body-md text-body-md">{existing.rejectionReason}</p>
            <p className="mt-xs font-body-sm text-body-sm">{t("rejectedHelp")}</p>
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
          <h2 className="font-headline-sm text-headline-sm text-primary">{t("sectionPersonal")}</h2>
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

          <h2 className="pt-sm font-headline-sm text-headline-sm text-primary">{t("sectionPhotos")}</h2>
          {existing && !isReadOnly && (existing.frontImageUrl || existing.backImageUrl || existing.selfieImageUrl) && (
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-md">
              <p className="mb-sm font-label-md text-label-md text-on-surface-variant">
                {t("previousUploads")}
              </p>
              <div className="grid gap-sm md:grid-cols-3">
                <ExistingPhoto label={t("frontPhoto")} src={existing.frontImageUrl} />
                <ExistingPhoto label={t("backPhoto")} src={existing.backImageUrl} />
                <ExistingPhoto label={t("selfiePhoto")} src={existing.selfieImageUrl} />
              </div>
            </div>
          )}
          <div className="grid gap-md md:grid-cols-3">
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

          {isSeller && (
            <div className="rounded-lg border border-secondary/40 bg-secondary-container/20 p-md">
              <h2 className="font-headline-sm text-headline-sm text-primary">Hợp đồng nền tảng dành cho người bán</h2>
              <div className="mt-sm max-h-48 overflow-y-auto rounded-md border border-outline-variant bg-surface-container-lowest p-md font-body-sm text-body-sm text-on-surface-variant">
                <p className="font-label-md text-label-md text-primary">ĐIỀU KHOẢN HỢP ĐỒNG NGƯỜI BÁN</p>
                <p className="mt-xs">1. Người bán đồng ý niêm yết và bán sản phẩm qua nền tảng đấu giá.</p>
                <p className="mt-xs">2. Phí dịch vụ nền tảng là <strong>20%</strong> trên giá chốt (giá thắng) của mỗi phiên đấu giá thành công; 80% còn lại được chuyển cho người bán.</p>
                <p className="mt-xs">3. Người bán có trách nhiệm tự kê khai và nộp thuế thu nhập cá nhân (TNCN) theo quy định pháp luật đối với khoản thu nhập nhận được. Nền tảng chỉ thu phí dịch vụ và không khấu trừ thuế thay người bán.</p>
                <p className="mt-xs">4. Người bán cam kết thông tin định danh (KYC) là chính xác và sản phẩm hợp pháp.</p>
                <p className="mt-xs">5. Hợp đồng có hiệu lực sau khi người bán ký và được nhân viên (staff) duyệt KYC thành công.</p>
              </div>
              {contractSigned ? (
                <div className="mt-sm flex flex-wrap items-center gap-sm text-on-tertiary-container">
                  <span className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <span className="font-label-md text-label-md">Bạn đã ký hợp đồng này.</span>
                  </span>
                  {contractUrl && (
                    <a
                      href={resolveApiUrl(contractUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-xs rounded-lg border border-secondary/50 bg-surface px-3 py-1.5 font-label-md text-label-md text-secondary hover:bg-secondary-container/30"
                    >
                      <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                      Xem hợp đồng (PDF)
                    </a>
                  )}
                </div>
              ) : (
                <label className="mt-sm flex items-start gap-sm">
                  <input
                    type="checkbox"
                    checked={agreeContract}
                    onChange={(e) => setAgreeContract(e.target.checked)}
                    disabled={isReadOnly}
                    className="mt-1"
                  />
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Tôi đã đọc, hiểu và đồng ý ký hợp đồng nền tảng dành cho người bán (bao gồm phí dịch vụ 20% và trách nhiệm tự nộp thuế TNCN).
                  </span>
                </label>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isReadOnly || (isSeller && !contractSigned && !agreeContract)}
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
