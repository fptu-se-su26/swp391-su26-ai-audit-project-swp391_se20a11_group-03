"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, userApi, type UserProfile } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

async function loadProfile(): Promise<UserProfile> {
  return (await userApi.profile()).data;
}

const EMPTY_PROFILE: UserProfile = {
  userId: 0,
  fullName: "",
  email: "",
  emailVerified: false,
  phone: null,
  phoneVerified: false,
  phoneVerifiedAt: null,
  identityNumber: null,
  roleName: "",
  status: "",
  identityVerified: false,
  profileStatus: null,
  identityVerifiedAt: null,
  active: false,
  paymentStrikeCount: 0,
  lockedByPaymentStrikes: false,
};

function toVietnameseLocalPhone(value: string | null): string {
  if (!value) return "";
  const compact = value.trim();
  if (/^\+84\d{9}$/.test(compact)) return `0${compact.slice(3)}`;
  if (/^84\d{9}$/.test(compact)) return `0${compact.slice(2)}`;
  return compact;
}

export default function ProfileClient() {
  const t = useTranslations("profilePage");
  const { data: profile, setData, loading, error } = useApiData(
    loadProfile,
    EMPTY_PROFILE,
  );
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState<string | null>(null);
  const [changingPhone, setChangingPhone] = useState(false);
  const [channel, setChannel] = useState<"SMS" | "WHATSAPP">("SMS");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");

  function toggleEditing() {
    if (!editing) setFullName(profile.fullName);
    setEditing((value) => !value);
  }

  async function save() {
    setSaving(true);
    try {
      const response = await userApi.updateProfile(fullName);
      setData(response.data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function sendOtp() {
    const phone = toVietnameseLocalPhone(phoneDraft ?? profile.phone);
    setPhoneError("");
    setPhoneMessage("");
    if (!/^0\d{9}$/.test(phone)) {
      setPhoneError(t("phoneInvalid"));
      return;
    }
    setPhoneBusy(true);
    try {
      const response = await userApi.sendPhoneVerification(phone, channel);
      setData(response.data);
      setPhoneDraft(null);
      setChangingPhone(false);
      setOtpSent(true);
      setPhoneMessage(
        channel === "WHATSAPP"
          ? t("otpSentWhatsapp")
          : t("otpSentSms"),
      );
    } catch (err) {
      setPhoneError(
        err instanceof ApiError
          ? err.message
          : t("otpSendError"),
      );
    } finally {
      setPhoneBusy(false);
    }
  }

  async function verifyOtp() {
    setPhoneError("");
    setPhoneMessage("");
    setPhoneBusy(true);
    try {
      const response = await userApi.checkPhoneVerification(otp.trim());
      setData(response.data);
      setPhoneDraft(null);
      setOtp("");
      setOtpSent(false);
      setPhoneMessage(t("phoneVerifiedSuccess"));
    } catch (err) {
      setPhoneError(
        err instanceof ApiError
          ? err.message
          : t("otpVerifyError"),
      );
    } finally {
      setPhoneBusy(false);
    }
  }

  const initials = profile.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const currentPhone = toVietnameseLocalPhone(phoneDraft ?? profile.phone);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display-lg text-3xl">{t("title")}</h1>
        <button
          type="button"
          onClick={toggleEditing}
          disabled={loading || Boolean(error)}
          className={
            editing
              ? "rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold hover:border-white/30"
              : "gradient-cta rounded-full px-5 py-2.5 text-xs font-semibold text-black"
          }
        >
          {editing ? t("cancelBtn") : t("editBtn")}
        </button>
      </div>

      {error && <p className="mt-6 text-sm text-red-300">{error}</p>}

      {!loading && !profile.phoneVerified && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--luxora-gold)]/30 bg-[var(--luxora-gold)]/[0.07] p-4">
          <span className="material-symbols-outlined text-xl text-[var(--luxora-gold-light)]">
            mobile_friendly
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--luxora-gold-light)]">
              {t("phoneRequiredTitle")}
            </p>
            <p className="mt-1 text-xs leading-5 text-white/50">
              {t("phoneRequiredDesc")}
            </p>
          </div>
        </div>
      )}

      <div className="glass-panel mt-8 flex items-center gap-5 rounded-2xl p-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--luxora-gold)]/15 text-xl font-bold text-[var(--luxora-gold-light)]">
          {initials || "?"}
        </div>
        <div>
          <p className="text-lg font-semibold">
            {profile.fullName || t("loading")}
          </p>
          <p className="text-sm capitalize text-white/40">{profile.roleName}</p>
          <span
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
              profile.identityVerified
                ? "bg-green-500/10 text-green-300"
                : "bg-yellow-500/10 text-yellow-300"
            }`}
          >
            <span className="material-symbols-outlined text-sm">verified</span>
            {profile.identityVerified
              ? t("verifiedBadge")
              : t("notVerifiedBadge")}
          </span>
        </div>
      </div>

      <div className="glass-panel mt-6 rounded-2xl p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
          {t("accountInfoTitle")}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] text-white/40">
              {t("fullNameLabel")}
            </label>
            {editing ? (
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--luxora-gold)]"
              />
            ) : (
              <p className="text-sm font-medium">{profile.fullName || "—"}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/40">
              {t("emailLabel")}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{profile.email || "—"}</p>
              {profile.emailVerified && (
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-300">
                  {t("verifiedBadge")}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/40">
              {t("idNumberLabel")}
            </label>
            <p className="text-sm font-medium">
              {profile.identityNumber || t("noIdNumber")}
            </p>
          </div>
        </div>
        {editing && (
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="gradient-cta mt-6 rounded-full px-6 py-3 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving ? t("saving") : t("saveBtn")}
          </button>
        )}
      </div>

      <div className="glass-panel mt-6 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              {t("phoneVerificationTitle")}
            </p>
            <p className="mt-1 text-xs leading-5 text-white/40">
              {t("phoneVerificationDesc")}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
              profile.phoneVerified
                ? "bg-green-500/10 text-green-300"
                : "bg-yellow-500/10 text-yellow-300"
            }`}
          >
            {profile.phoneVerified ? t("verifiedBadge") : t("verificationRequired")}
          </span>
        </div>

        {profile.phoneVerified && !changingPhone ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-500/20 bg-green-500/[0.05] px-4 py-3">
            <div>
              <p className="text-sm font-semibold">
                {toVietnameseLocalPhone(profile.phone)}
              </p>
              <p className="mt-0.5 text-[11px] text-green-300">
                {t("phoneVerifiedLabel")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setChangingPhone(true);
                setPhoneDraft(toVietnameseLocalPhone(profile.phone));
                setPhoneMessage("");
                setPhoneError("");
              }}
              className="rounded-full border border-white/15 px-4 py-2 text-[11px] font-semibold text-white/60 transition hover:border-white/30 hover:text-white"
            >
              {t("changePhone")}
            </button>
          </div>
        ) : (
          <>
        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={currentPhone}
            onChange={(event) => {
              setPhoneDraft(
                event.target.value.replace(/\D/g, "").slice(0, 10),
              );
              setOtpSent(false);
              setOtp("");
              setPhoneMessage("");
              setPhoneError("");
            }}
            placeholder="0901234567"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm outline-none placeholder:text-white/25 focus:border-[var(--luxora-gold)]"
          />
          <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {(["SMS", "WHATSAPP"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setChannel(item)}
                className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                  channel === item
                    ? "bg-[var(--luxora-gold)] text-black"
                    : "text-white/45 hover:text-white/70"
                }`}
              >
                {item === "WHATSAPP" ? "WhatsApp" : "SMS"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void sendOtp()}
          disabled={phoneBusy || !/^0\d{9}$/.test(currentPhone)}
          className="mt-3 rounded-full border border-[var(--luxora-gold)]/40 px-5 py-2.5 text-xs font-semibold text-[var(--luxora-gold-light)] transition hover:bg-[var(--luxora-gold)]/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {phoneBusy
            ? t("sendingOtp")
            : t("sendOtp")}
        </button>

        {otpSent && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={10}
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder={t("otpPlaceholder")}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm tracking-[0.25em] outline-none placeholder:tracking-normal placeholder:text-white/25 focus:border-[var(--luxora-gold)]"
            />
            <button
              type="button"
              onClick={() => void verifyOtp()}
              disabled={phoneBusy || otp.length < 4}
              className="gradient-cta rounded-full px-6 py-2.5 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {phoneBusy ? t("checkingOtp") : t("confirmOtp")}
            </button>
          </div>
        )}
          </>
        )}

        {phoneError && (
          <p className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            {phoneError}
          </p>
        )}
        {phoneMessage && (
          <p className="mt-4 rounded-xl border border-green-500/25 bg-green-500/10 px-4 py-3 text-xs text-green-300">
            {phoneMessage}
          </p>
        )}
      </div>
    </div>
  );
}
