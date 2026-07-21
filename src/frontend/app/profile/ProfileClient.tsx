"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ApiError,
  premiumApi,
  userApi,
  type PremiumStatus,
  type UserProfile,
} from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

async function loadProfile(): Promise<UserProfile> {
  return (await userApi.profile()).data;
}

async function loadPremium(): Promise<PremiumStatus> {
  return premiumApi.status();
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

function maskIdentityNumber(value: string | null) {
  if (!value) return null;
  if (value.length <= 4) return value;
  return `${"•".repeat(Math.min(8, value.length - 4))}${value.slice(-4)}`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

export default function ProfileClient() {
  const t = useTranslations("profilePage");
  const { data: profile, setData, loading, error } = useApiData(
    loadProfile,
    EMPTY_PROFILE,
  );
  const { data: premium } = useApiData<PremiumStatus | null>(
    loadPremium,
    null,
  );
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  function toggleEditing() {
    setSaveError("");
    setSaveSuccess("");
    if (!editing) setFullName(profile.fullName);
    setEditing((value) => !value);
  }

  async function save() {
    const normalizedName = fullName.trim();
    if (!normalizedName) {
      setSaveError(t("nameRequired"));
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const response = await userApi.updateProfile(normalizedName);
      setData(response.data);
      setEditing(false);
      setSaveSuccess(t("saveSuccess"));
    } catch (reason: unknown) {
      setSaveError(
        reason instanceof ApiError || reason instanceof Error
          ? reason.message
          : t("saveError"),
      );
    } finally {
      setSaving(false);
    }
  }

  const initials = profile.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const muted = "text-[var(--luxora-text-muted)] opacity-70";
  const accountHealthy = profile.active && !profile.lockedByPaymentStrikes;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--luxora-gold)]">
            {t("eyebrow")}
          </p>
          <h1 className="font-display-lg mt-2 text-3xl">{t("title")}</h1>
        </div>
        <button
          type="button"
          onClick={toggleEditing}
          disabled={loading || Boolean(error)}
          className={
            editing
              ? "rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold hover:border-[var(--luxora-gold)]"
              : "gradient-cta rounded-full px-5 py-2.5 text-xs font-semibold text-black"
          }
        >
          {editing ? t("cancelBtn") : t("editBtn")}
        </button>
      </div>

      {error && <p className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
      {saveError && <p className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">{saveError}</p>}
      {saveSuccess && <p className="mt-6 rounded-xl border border-green-500/25 bg-green-500/10 p-4 text-sm text-green-300">{saveSuccess}</p>}

      <section className="glass-panel mt-8 flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--luxora-gold)]/15 text-xl font-bold text-[var(--luxora-gold-light)]">
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-xl font-semibold">
              {profile.fullName || t("loading")}
            </p>
            {premium?.premium && (
              <span className="rounded-full bg-[var(--luxora-gold)] px-2.5 py-1 text-[10px] font-extrabold text-black">
                PREMIUM
              </span>
            )}
          </div>
          <p className={`mt-1 text-sm capitalize ${muted}`}>{profile.roleName}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
              profile.identityVerified
                ? "bg-green-500/10 text-green-300"
                : "bg-yellow-500/10 text-yellow-300"
            }`}>
              <span className="material-symbols-outlined text-sm">verified</span>
              {profile.identityVerified ? t("verifiedBadge") : t("notVerifiedBadge")}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
              accountHealthy ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"
            }`}>
              <span className="material-symbols-outlined text-sm">
                {accountHealthy ? "check_circle" : "lock"}
              </span>
              {accountHealthy ? t("activeStatus") : t("restrictedStatus")}
            </span>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <section className="glass-panel rounded-2xl p-6">
          <p className={`mb-5 text-xs font-semibold uppercase tracking-wider ${muted}`}>
            {t("accountInfoTitle")}
          </p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <label className={`mb-1 block text-[11px] ${muted}`}>{t("fullNameLabel")}</label>
              {editing ? (
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  maxLength={150}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-[var(--luxora-text)] outline-none focus:border-[var(--luxora-gold)]"
                />
              ) : (
                <p className="text-sm font-medium">{profile.fullName || "—"}</p>
              )}
            </div>
            <div>
              <p className={`mb-1 text-[11px] ${muted}`}>{t("emailLabel")}</p>
              <p className="break-all text-sm font-medium">{profile.email || "—"}</p>
              <p className={`mt-1 text-[11px] ${profile.emailVerified ? "text-green-300" : muted}`}>
                {profile.emailVerified ? t("emailVerified") : t("emailNotVerified")}
              </p>
            </div>
            <div>
              <p className={`mb-1 text-[11px] ${muted}`}>{t("phoneLabel")}</p>
              <p className="text-sm font-medium">{profile.phone || t("notUpdated")}</p>
              <p className={`mt-1 text-[11px] ${profile.phoneVerified ? "text-green-300" : muted}`}>
                {profile.phoneVerified ? t("phoneVerified") : t("phoneNotVerified")}
              </p>
            </div>
            <div>
              <p className={`mb-1 text-[11px] ${muted}`}>{t("idNumberLabel")}</p>
              <p className="text-sm font-medium">
                {maskIdentityNumber(profile.identityNumber) || t("noIdNumber")}
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
        </section>

        <section className="glass-panel rounded-2xl p-6">
          <p className={`mb-5 text-xs font-semibold uppercase tracking-wider ${muted}`}>
            {t("accountStatusTitle")}
          </p>
          <dl className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
              <dt className={muted}>{t("roleLabel")}</dt>
              <dd className="font-semibold">{profile.roleName || "—"}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
              <dt className={muted}>{t("kycStatusLabel")}</dt>
              <dd className="text-right font-semibold">
                {profile.identityVerified ? t("verifiedBadge") : t("notVerifiedBadge")}
                {profile.identityVerifiedAt && <span className={`mt-1 block text-[11px] font-normal ${muted}`}>{formatDate(profile.identityVerifiedAt)}</span>}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
              <dt className={muted}>{t("paymentStrikesLabel")}</dt>
              <dd className={profile.paymentStrikeCount > 0 ? "font-bold text-yellow-300" : "font-semibold"}>
                {profile.paymentStrikeCount}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className={muted}>{t("premiumLabel")}</dt>
              <dd className="text-right font-semibold text-[var(--luxora-gold-light)]">
                {premium?.premium ? t("premiumActive") : t("standardPlan")}
                {premium?.expiresAt && <span className={`mt-1 block text-[11px] font-normal ${muted}`}>{t("expiresAt", { date: formatDate(premium.expiresAt) })}</span>}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">{t("quickActionsTitle")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["verified_user", t("kycAction"), "/kyc"],
            ["lock", t("securityAction"), "/security"],
            ["contract", t("contractsAction"), "/contracts"],
            ["workspace_premium", t("premiumAction"), "/premium"],
          ].map(([icon, label, href]) => (
            <Link
              key={href}
              href={href}
              className="glass-panel group flex items-center gap-3 rounded-xl p-4 transition hover:border-[var(--luxora-gold)]"
            >
              <span className="material-symbols-outlined text-[var(--luxora-gold)]">{icon}</span>
              <span className="text-sm font-semibold">{label}</span>
              <span className="material-symbols-outlined ml-auto text-base opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100">arrow_forward</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
