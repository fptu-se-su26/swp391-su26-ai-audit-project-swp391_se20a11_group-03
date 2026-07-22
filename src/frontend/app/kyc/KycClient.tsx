"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, kycApi, sellerContractApi, updateRoleCookie, userApi } from "@/lib/api";
import LuxuryDatePicker from "@/components/ui/LuxuryDatePicker";

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
    <div className="rounded-xl border border-[#e8e1d7] bg-[#fffdfa] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
            value
              ? "bg-emerald-50 text-emerald-700"
              : "bg-[#f2f0ed] text-[#7a8190]"
          }`}
        >
          {value ? selectedLabel : notUploadedLabel}
        </span>
      </div>

      {!value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-4 rounded-xl border border-dashed border-[#d9d2c8] bg-white px-4 py-7 text-center transition hover:border-[#d3982c] hover:bg-[#fffaf0]"
        >
          <span className="material-symbols-outlined grid size-12 place-items-center rounded-full bg-[#f6f2eb] text-3xl text-[#757d89]">
            cloud_upload
          </span>
          <p className="text-sm text-[#667085]">{clickToSelectLabel}</p>
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-[#e6dfd5] bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.preview}
            alt={title}
            className="h-20 w-32 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={onClear}
            className="text-[#8a909b] hover:text-red-600"
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
  "w-full rounded-xl border border-[#ded8ce] bg-[#fffdfa] px-4 py-3 text-sm text-[#17151b] outline-none placeholder:text-[#a7aab1] focus:border-[#d3982c] focus:ring-2 focus:ring-[#dca642]/15";

// Họ tên trên CCCD in hoa toàn bộ: chỉ chữ hoa (kể cả có dấu) và khoảng trắng.
const NAME_PATTERN = /^[\p{Lu}][\p{Lu}\s]*$/u;
const CCCD_PATTERN = /^0\d{11}$/;

export default function KycClient({ embedded = false }: { embedded?: boolean }) {
  const t = useTranslations("kycPage");
  const [front, setFront] = useState<Picked>(null);
  const [back, setBack] = useState<Picked>(null);
  const [selfie, setSelfie] = useState<Picked>(null);

  const [fullName, setFullName] = useState("");
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
      if (d?.fullName) setFullName(d.fullName.toLocaleUpperCase("vi-VN"));
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
    if (!fullName.trim()) return setError(t("fullNameRequired"));
    if (!cccdNumber.trim()) return setError(t("cccdRequired"));
    if (!dob) return setError(t("dobRequired"));
    if (!issueDate) return setError(t("issueDateRequired"));
    if (!issuePlace.trim()) return setError(t("issuePlaceRequired"));
    if (!NAME_PATTERN.test(fullName.trim()))
      return setError(t("fullNameInvalid"));
    if (!CCCD_PATTERN.test(cccdNumber.trim()))
      return setError(t("cccdInvalid"));
    const today = new Date().toISOString().slice(0, 10);
    if (dob >= today) return setError(t("dobInvalid"));
    if (issueDate > today) return setError(t("issueDateFuture"));
    if (issueDate <= dob) return setError(t("issueDateBeforeDob"));
    if (!identityCommit)
      return setError(t("submitNeedCommit"));

    setSubmitting(true);
    try {
      await kycApi.submit({
        fullName: fullName.trim(),
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
      <div
        className={
          embedded
            ? "rounded-2xl border border-[#e7e0d6] bg-white px-5 py-8 text-sm text-[#667085]"
            : "mx-auto max-w-3xl px-6 py-10 text-sm text-[#667085]"
        }
      >
        {t("statusLoading")}
      </div>
    );
  }

  if (existingStatus === "APPROVED") {
    const isSeller = (roleName ?? "").toLowerCase() === "seller";
    const isBasicUser = (roleName ?? "").toLowerCase() === "user";
    return (
      <div
        className={
          embedded
            ? "rounded-2xl border border-[#e7e0d6] bg-white p-5 shadow-[0_10px_30px_rgba(74,55,28,0.05)] sm:p-6"
            : "mx-auto max-w-3xl px-6 py-10 text-[#17151b]"
        }
      >
        <h1 className={embedded ? "text-lg font-bold" : "text-3xl font-bold"}>
          {t("approvedTitle")}
        </h1>
        <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-emerald-600">verified</span>
          <p className="text-lg font-semibold text-emerald-700">{t("approvedBadge")}</p>
          <p className="text-sm text-[#667085]">
            {t("approvedDesc")}
          </p>
        </div>

        {isSeller || sellerSuccess ? (
          <div className="mt-5 flex flex-col items-center gap-2 rounded-2xl border border-[#ead3a7] bg-[#fff8e9] p-7 text-center">
            <span className="material-symbols-outlined text-4xl text-[#b77808]">
              storefront
            </span>
            <p className="text-base font-semibold text-[#8d5b06]">
              {sellerSuccess ?? t("sellerAlreadyTitle")}
            </p>
            <p className="text-sm text-[#667085]">
              {t("sellerAlreadyDesc")}
            </p>
          </div>
        ) : isBasicUser ? (
          <div className="mt-5 rounded-2xl border border-[#e7e0d6] bg-[#fffdfa] p-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#b77808]">
                storefront
              </span>
              <h2 className="text-base font-semibold">{t("registerSellerTitle")}</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              {t.rich("registerSellerDesc", {
                b: (chunks) => <b>{chunks}</b>,
              })}
            </p>

            <button
              type="button"
              onClick={handleViewContract}
              disabled={contractLoading}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#a66b06] hover:underline disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              {contractLoading ? t("openingContract") : t("viewContractBtn")}
            </button>

            <label className="mt-3 flex items-start gap-2 text-xs text-[#667085]">
              <input
                type="checkbox"
                checked={agreeSellerTerms}
                onChange={(e) => setAgreeSellerTerms(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                {t.rich("agreeSellerTerms", {
                  b: (chunks) => <b>{chunks}</b>,
                })}
              </span>
            </label>

            {sellerError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {sellerError}
              </div>
            )}

            <button
              type="button"
              disabled={registering || !agreeSellerTerms}
              onClick={() => void handleBecomeSeller()}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#d89a27] to-[#c98509] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
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
      <div
        className={
          embedded
            ? "rounded-2xl border border-[#e7e0d6] bg-white p-5 shadow-[0_10px_30px_rgba(74,55,28,0.05)] sm:p-6"
            : "mx-auto max-w-3xl px-6 py-10 text-[#17151b]"
        }
      >
        <h1 className={embedded ? "text-lg font-bold" : "text-3xl font-bold"}>
          {t("pendingTitle")}
        </h1>
        <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-amber-600">hourglass_top</span>
          <p className="text-lg font-semibold text-amber-700">{t("pendingBadge")}</p>
          <p className="text-sm text-[#667085]">
            {t("pendingDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        embedded
          ? "rounded-2xl border border-[#e7e0d6] bg-white p-5 text-[#17151b] shadow-[0_10px_30px_rgba(74,55,28,0.05)] sm:p-6"
          : "mx-auto max-w-3xl px-6 py-10 text-[#17151b]"
      }
    >
      <h1 className={embedded ? "text-lg font-bold" : "text-3xl font-bold"}>
        {t("formTitle")}
      </h1>
      {(existingStatus === "REJECTED" || existingStatus === "INFO_REQUIRED") && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {existingStatus === "REJECTED" ? t("rejectedNotice") : t("infoRequiredNotice")}
          {rejectionReason ? t("rejectionReasonSuffix", { reason: rejectionReason }) : ""}
          {t("resubmitSuffix")}
        </div>
      )}
      <p className="mt-2 text-sm text-[#667085]">
        {t("formSubtitle")}
      </p>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-[#667085]">
          <span>{t("uploadProgress")}</span>
          <span>{uploaded}/3</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#eee9e1]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#dda437] to-[#c98509] transition-all"
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
        className="mt-5 w-full rounded-xl border border-[#d8aa55] py-3 text-sm font-semibold text-[#9c6507] transition hover:bg-[#fff8e9] disabled:opacity-40"
      >
        {ocrLoading ? t("ocrLoading") : t("ocrBtn")}
      </button>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-[#4f5663]">{t("fullNameLabel")}</label>
          <input
            className={FIELD_CLASS}
            value={fullName}
            onChange={(e) => setFullName(e.target.value.toLocaleUpperCase("vi-VN"))}
            placeholder={t("fullNamePlaceholder")}
          />
          <p className="mt-1 text-[11px] text-[#8a909b]">{t("fullNameHint")}</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#4f5663]">{t("cccdLabel")}</label>
          <input
            className={FIELD_CLASS}
            value={cccdNumber}
            onChange={(e) => setCccdNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder="0xxxxxxxxxxx"
            inputMode="numeric"
            maxLength={12}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#4f5663]">{t("dobLabel")}</label>
          <LuxuryDatePicker
            ariaLabel={t("dobLabel")}
            value={dob}
            onChange={setDob}
            max={new Date().toISOString().slice(0, 10)}
            placeholder={t("dobPlaceholder")}
            variant="light"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#4f5663]">{t("genderLabel")}</label>
          <select className={FIELD_CLASS} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="MALE" className="bg-white">{t("genderMale")}</option>
            <option value="FEMALE" className="bg-white">{t("genderFemale")}</option>
            <option value="OTHER" className="bg-white">{t("genderOther")}</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#4f5663]">{t("issueDateLabel")}</label>
          <LuxuryDatePicker
            ariaLabel={t("issueDateLabel")}
            value={issueDate}
            onChange={setIssueDate}
            max={new Date().toISOString().slice(0, 10)}
            placeholder={t("issueDatePlaceholder")}
            variant="light"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#4f5663]">{t("issuePlaceLabel")}</label>
          <input className={FIELD_CLASS} value={issuePlace} onChange={(e) => setIssuePlace(e.target.value)} placeholder={t("issuePlacePlaceholder")} />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[#ead8b7] bg-[#fff8e9] p-4">
        <label className="flex items-start gap-2 text-xs text-[#67583d]">
          <input
            type="checkbox"
            checked={identityCommit}
            onChange={(e) => setIdentityCommit(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            {t.rich("identityCommit", {
              b: (chunks) => <b>{chunks}</b>,
            })}
          </span>
        </label>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {info && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {info}
        </div>
      )}
      {success && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || uploaded < 3}
        className="mt-8 w-full rounded-xl bg-gradient-to-r from-[#d89a27] to-[#c98509] py-3.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(199,132,12,0.18)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? t("submitting") : t("submitBtn")}
      </button>
    </form>
  );
}
