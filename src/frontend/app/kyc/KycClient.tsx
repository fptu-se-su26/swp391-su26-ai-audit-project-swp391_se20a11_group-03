"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, kycApi, sellerContractApi, updateRoleCookie, userApi } from "@/lib/api";

type Picked = { file: File; preview: string } | null;

function ImagePicker({
  title,
  value,
  onPick,
  onClear,
  selectedLabel,
  notUploadedLabel,
  clickToSelectLabel,
  deleteAriaLabel,
}: {
  title: string;
  value: Picked;
  onPick: (file: File) => void;
  onClear: () => void;
  selectedLabel: string;
  notUploadedLabel: string;
  clickToSelectLabel: string;
  deleteAriaLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
            value ? "bg-green-500/10 text-green-300" : "bg-white/10 text-white/50"
          }`}
        >
          {value ? selectedLabel : notUploadedLabel}
        </span>
      </div>

      {!value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-10 text-center hover:border-[var(--luxora-gold)]"
        >
          <span className="material-symbols-outlined text-3xl text-white/30">
            cloud_upload
          </span>
          <p className="text-sm text-white/50">{clickToSelectLabel}</p>
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-white/10 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.preview}
            alt={title}
            className="h-20 w-32 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="text-white/40 hover:text-red-300"
            aria-label={deleteAriaLabel}
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

const FIELD_CLASS =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]";

export default function KycClient() {
  const t = useTranslations("kycPage");
  const [front, setFront] = useState<Picked>(null);
  const [back, setBack] = useState<Picked>(null);
  const [selfie, setSelfie] = useState<Picked>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("MALE");
  const [issueDate, setIssueDate] = useState("");
  const [issuePlace, setIssuePlace] = useState("");
  const [identityCommit, setIdentityCommit] = useState(false);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [agreeSellerTerms, setAgreeSellerTerms] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [sellerSuccess, setSellerSuccess] = useState<string | null>(null);
  const [sellerError, setSellerError] = useState<string | null>(null);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [contractLoading, setContractLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [statusLoading, setStatusLoading] = useState(true);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  useEffect(() => {
    kycApi
      .mine()
      .then((res) => {
        setExistingStatus(res.data?.status ?? null);
        setRejectionReason(res.data?.rejectionReason ?? null);
      })
      .catch(() => setExistingStatus(null))
      .finally(() => setStatusLoading(false));
    userApi
      .profile()
      .then((res) => setRoleName(res.data.roleName))
      .catch(() => setRoleName(null));
  }, [success, sellerSuccess]);

  async function handleBecomeSeller() {
    setSellerError(null);
    if (!agreeSellerTerms) {
      setSellerError(t("agreeSellerError"));
      return;
    }
    setRegistering(true);
    try {
      const res = await sellerContractApi.submit();
      updateRoleCookie(res.data?.roleName ?? "Seller");
      setSellerSuccess(t("sellerAlreadyTitle"));
    } catch (err) {
      setSellerError(
        err instanceof ApiError ? err.message : t("registerSellerError"),
      );
    } finally {
      setRegistering(false);
    }
  }

  function pick(setter: (v: Picked) => void, current: Picked) {
    return (file: File) => {
      if (current) URL.revokeObjectURL(current.preview);
      setter({ file, preview: URL.createObjectURL(file) });
    };
  }
  function clear(setter: (v: Picked) => void, current: Picked) {
    return () => {
      if (current) URL.revokeObjectURL(current.preview);
      setter(null);
    };
  }

  const uploaded = [front, back, selfie].filter(Boolean).length;

  async function handleViewContract() {
    setError(null);
    setContractLoading(true);
    try {
      const blob = await sellerContractApi.previewPdf();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      setError(t("contractOpenError"));
    } finally {
      setContractLoading(false);
    }
  }

  async function handleOcr() {
    setError(null);
    setInfo(null);
    if (!front || !back) {
      setError(t("ocrNeedImages"));
      return;
    }
    setOcrLoading(true);
    try {
      const res = await kycApi.ocr(front.file, back.file);
      const d = res.data;
      if (d?.fullName) setFullName(d.fullName);
      if (d?.cccdNumber) setCccdNumber(d.cccdNumber);
      if (d?.dob) setDob(d.dob);
      if (d?.gender) setGender(d.gender);
      if (d?.issueDate) setIssueDate(d.issueDate);
      if (d?.issuePlace) setIssuePlace(d.issuePlace);
      setInfo(d?.message ?? t("ocrDefaultMessage"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("ocrScanError"));
    } finally {
      setOcrLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSuccess(null);

    if (!front || !back || !selfie)
      return setError(t("submitMissingImages"));
    if (!fullName.trim() || !phone.trim() || !cccdNumber.trim() || !dob || !issueDate || !issuePlace.trim())
      return setError(t("submitMissingFields"));
    if (!identityCommit)
      return setError(t("submitNeedCommit"));

    setSubmitting(true);
    try {
      await kycApi.submit({
        fullName: fullName.trim(),
        phone: phone.trim(),
        cccdNumber: cccdNumber.trim(),
        dob,
        gender,
        issueDate,
        issuePlace: issuePlace.trim(),
        frontImage: front.file,
        backImage: back.file,
        selfieImage: selfie.file,
        signSellerAgreement: false,
      });
      setSuccess(t("submitSuccess"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (statusLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-white/50">
        {t("statusLoading")}
      </div>
    );
  }

  if (existingStatus === "APPROVED") {
    const isSeller = (roleName ?? "").toLowerCase() === "seller";
    const isBasicUser = (roleName ?? "").toLowerCase() === "user";
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">{t("approvedTitle")}</h1>
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-10 text-center">
          <span className="material-symbols-outlined text-5xl text-green-300">verified</span>
          <p className="text-lg font-semibold text-green-300">{t("approvedBadge")}</p>
          <p className="text-sm text-white/50">
            {t("approvedDesc")}
          </p>
        </div>

        {isSeller || sellerSuccess ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-[var(--luxora-gold)]/30 bg-[var(--luxora-gold)]/5 p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[var(--luxora-gold-light)]">
              storefront
            </span>
            <p className="text-base font-semibold text-[var(--luxora-gold-light)]">
              {sellerSuccess ?? t("sellerAlreadyTitle")}
            </p>
            <p className="text-sm text-white/50">
              {t("sellerAlreadyDesc")}
            </p>
          </div>
        ) : isBasicUser ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[var(--luxora-gold-light)]">
                storefront
              </span>
              <h2 className="text-base font-semibold">{t("registerSellerTitle")}</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/55">
              {t("registerSellerDesc")}
            </p>

            <button
              type="button"
              onClick={handleViewContract}
              disabled={contractLoading}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--luxora-gold-light)] hover:underline disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              {contractLoading ? t("openingContract") : t("viewContractBtn")}
            </button>

            <label className="mt-3 flex items-start gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={agreeSellerTerms}
                onChange={(e) => setAgreeSellerTerms(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                {t("agreeSellerTerms")}
              </span>
            </label>

            {sellerError && (
              <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {sellerError}
              </div>
            )}

            <button
              type="button"
              disabled={registering || !agreeSellerTerms}
              onClick={() => void handleBecomeSeller()}
              className="gradient-cta mt-5 w-full rounded-full py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {registering ? t("signingContract") : t("signAndRegisterBtn")}
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (existingStatus === "PENDING") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">{t("pendingTitle")}</h1>
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-10 text-center">
          <span className="material-symbols-outlined text-5xl text-yellow-300">hourglass_top</span>
          <p className="text-lg font-semibold text-yellow-300">{t("pendingBadge")}</p>
          <p className="text-sm text-white/50">
            {t("pendingDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display-lg text-3xl">{t("formTitle")}</h1>
      {(existingStatus === "REJECTED" || existingStatus === "INFO_REQUIRED") && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {existingStatus === "REJECTED" ? t("rejectedNotice") : t("infoRequiredNotice")}
          {rejectionReason ? t("rejectionReasonSuffix", { reason: rejectionReason }) : ""}
          {t("resubmitSuffix")}
        </div>
      )}
      <p className="mt-2 text-sm text-white/50">
        {t("formSubtitle")}
      </p>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-white/50">
          <span>{t("uploadProgress")}</span>
          <span>{uploaded}/3</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-[var(--luxora-gold)] transition-all"
            style={{ width: `${(uploaded / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5">
        <ImagePicker
          title={t("frontImageTitle")}
          value={front}
          onPick={pick(setFront, front)}
          onClear={clear(setFront, front)}
          selectedLabel={t("imageSelected")}
          notUploadedLabel={t("imageNotUploaded")}
          clickToSelectLabel={t("clickToSelect")}
          deleteAriaLabel={t("deleteImageAriaLabel")}
        />
        <ImagePicker
          title={t("backImageTitle")}
          value={back}
          onPick={pick(setBack, back)}
          onClear={clear(setBack, back)}
          selectedLabel={t("imageSelected")}
          notUploadedLabel={t("imageNotUploaded")}
          clickToSelectLabel={t("clickToSelect")}
          deleteAriaLabel={t("deleteImageAriaLabel")}
        />
        <ImagePicker
          title={t("selfieImageTitle")}
          value={selfie}
          onPick={pick(setSelfie, selfie)}
          onClear={clear(setSelfie, selfie)}
          selectedLabel={t("imageSelected")}
          notUploadedLabel={t("imageNotUploaded")}
          clickToSelectLabel={t("clickToSelect")}
          deleteAriaLabel={t("deleteImageAriaLabel")}
        />
      </div>

      <button
        type="button"
        onClick={handleOcr}
        disabled={ocrLoading || !front || !back}
        className="mt-5 w-full rounded-full border border-[var(--luxora-gold)]/40 py-3 text-sm font-semibold text-[var(--luxora-gold-light)] hover:bg-[var(--luxora-gold)]/10 disabled:opacity-40"
      >
        {ocrLoading ? t("ocrLoading") : t("ocrBtn")}
      </button>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-white/50">{t("fullNameLabel")}</label>
          <input className={FIELD_CLASS} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="NGUYEN VAN A" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">{t("phoneLabel")}</label>
          <input className={FIELD_CLASS} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxx" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">{t("cccdLabel")}</label>
          <input className={FIELD_CLASS} value={cccdNumber} onChange={(e) => setCccdNumber(e.target.value)} placeholder="0xxxxxxxxxxx" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">{t("dobLabel")}</label>
          <input type="date" className={FIELD_CLASS} value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">{t("genderLabel")}</label>
          <select className={FIELD_CLASS} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="MALE" className="bg-[var(--luxora-bg-elevated)]">{t("genderMale")}</option>
            <option value="FEMALE" className="bg-[var(--luxora-bg-elevated)]">{t("genderFemale")}</option>
            <option value="OTHER" className="bg-[var(--luxora-bg-elevated)]">{t("genderOther")}</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">{t("issueDateLabel")}</label>
          <input type="date" className={FIELD_CLASS} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">{t("issuePlaceLabel")}</label>
          <input className={FIELD_CLASS} value={issuePlace} onChange={(e) => setIssuePlace(e.target.value)} placeholder={t("issuePlacePlaceholder")} />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <label className="flex items-start gap-2 text-xs text-white/60">
          <input
            type="checkbox"
            checked={identityCommit}
            onChange={(e) => setIdentityCommit(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            {t("identityCommit")}
          </span>
        </label>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {info && (
        <div className="mt-5 rounded-xl border border-[var(--luxora-gold)]/30 bg-[var(--luxora-gold)]/5 px-4 py-3 text-sm text-[var(--luxora-gold-light)]">
          {info}
        </div>
      )}
      {success && (
        <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || uploaded < 3}
        className="gradient-cta mt-8 w-full rounded-full py-3.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? t("submitting") : t("submitBtn")}
      </button>
    </form>
  );
}
