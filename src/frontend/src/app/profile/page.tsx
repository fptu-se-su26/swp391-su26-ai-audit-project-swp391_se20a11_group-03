"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CollectorShell from "@/components/layout/CollectorShell";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import { GoldButton, OutlineButton } from "@/components/luxe/primitives";
import { displayFont } from "@/components/luxe/theme";
import {
  StoredUser,
  getRoleLabelKey,
  getStoredUser,
  getUserDisplayName,
  getUserInitials,
  isAdmin,
  isSeller,
  saveStoredUser,
  subscribeStoredUser,
} from "@/lib/userSession";
import { useTranslations } from "@/i18n/I18nProvider";
import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "@/lib/services/userProfileService";
import { ApiError, clearStoredAuth, getStoredToken } from "@/lib/apiClient";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tRoles = useTranslations("roles");
  const [editing, setEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loadErrorCode, setLoadErrorCode] = useState<"unauthorized" | "network" | null>(null);

  // Editable form state
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
      setLoadErrorCode(null);
      setEditFullName(data.fullName ?? "");
      setEditPhone(data.phone ?? "");
      // Keep StoredUser in sync so nav / dashboard see the latest,
      // but avoid dispatching the storage event when nothing changed.
      const storedUser = getStoredUser();
      if (
        storedUser &&
        (storedUser.email !== data.email || storedUser.username !== (data.fullName || storedUser.username))
      ) {
        saveStoredUser({
          ...storedUser,
          email: data.email,
          username: data.fullName || storedUser.username,
        });
      }
    } catch (err) {
      setProfile(null);
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setLoadErrorCode("unauthorized");
        // Token is invalid/expired; clear it so the rest of the app
        // (nav, dashboard) doesn't keep showing a phantom session.
        clearStoredAuth();
        setCurrentUser(null);
      } else {
        setLoadErrorCode("network");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    syncUser();
    return subscribeStoredUser(syncUser);
  }, []);

  useEffect(() => {
    if (!getStoredToken()) {
      setLoading(false);
      setLoadErrorCode("unauthorized");
      return;
    }
    if (currentUser?.token) {
      void loadProfile();
    } else {
      setLoading(false);
    }
  }, [currentUser?.token, loadProfile]);

  const displayName = profile?.fullName || getUserDisplayName(currentUser);
  const initials = getUserInitials({ ...currentUser, username: displayName });
  const roleLabel = tRoles(getRoleLabelKey(currentUser));
  const canUpgradeToSeller =
    Boolean(currentUser) && !isSeller(currentUser) && !isAdmin(currentUser);

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await updateMyProfile({
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
      });
      setProfile(updated);
      setFeedback({ type: "ok", text: t("saveSuccess") });
      setEditing(false);
    } catch (err) {
      setFeedback({
        type: "err",
        text: err instanceof Error ? err.message : t("saveError"),
      });
    } finally {
      setSaving(false);
    }
  }

  function handleStartEdit() {
    setEditFullName(profile?.fullName ?? "");
    setEditPhone(profile?.phone ?? "");
    setFeedback(null);
    setEditing(true);
  }

  return (
    <CollectorShell>
      <div className="mx-auto max-w-[1100px] space-y-6 px-4 py-10 sm:px-7 lg:px-10 lg:py-14">
        <div className="flex items-start justify-between gap-4">
          <DashboardHeader eyebrow="Account & verification" title={t("pageTitle")} subtitle={t("pageSubtitle")} />
          {!loading && profile && (
            <button
              onClick={() => (editing ? setEditing(false) : handleStartEdit())}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[.04] px-5 py-2.5 text-xs font-bold text-[#e7c57c] transition hover:border-[#d4aa61]/50 hover:bg-[#d4aa61]/10"
            >
              <span className="material-symbols-outlined text-[18px]">{editing ? "close" : "edit"}</span>
              {editing ? t("cancel") : t("editProfile")}
            </button>
          )}
        </div>

        <div className="relative flex items-center gap-6 overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0b09] p-7 text-white shadow-[0_22px_70px_rgba(0,0,0,.45)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_15%,rgba(212,170,97,.22),transparent_28%)]" />
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[#d4aa61]/30 bg-[#d4aa61]/10 text-[28px] font-bold uppercase text-[#f0d98b] shadow-lg">
              {initials}
            </div>
          </div>
          <div className="relative">
            <h2 className={`${displayFont} text-2xl font-semibold text-white`}>{displayName}</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#d4aa61]">{roleLabel}</p>
            {profile?.email && <p className="mt-2 text-sm text-[#b7aea3]">{profile.email}</p>}
            <div className="mt-sm flex flex-wrap items-center gap-xs">
              {profile?.identityVerified ? (
                <>
                  <span
                    className="material-symbols-outlined text-[16px] text-emerald-400"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span className="text-sm text-emerald-300">{t("identityVerified")}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px] text-[#9d948a]">verified_user</span>
                  <span className="text-sm text-[#b7aea3]">{t("identityNotVerified")}</span>
                  <Link href="/kyc" className="ml-1 text-sm font-semibold text-[#f0d98b] hover:underline">
                    {t("verifyNow")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {!loading && profile && (
          <div className="rounded-[28px] border border-white/10 bg-[#0e0d0b] p-6 shadow-[0_18px_50px_rgba(0,0,0,.35)]">
            <h3 className="mb-4 border-b border-white/10 pb-3 text-lg font-semibold text-[#f5ead9]">
              {t("accountStatusTitle")}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9d948a]">{t("accountStatus")}</p>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      profile.active !== false && profile.status !== "LOCKED"
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border border-red-500/30 bg-red-500/10 text-red-300"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {profile.active !== false && profile.status !== "LOCKED" ? "check_circle" : "lock"}
                    </span>
                    {profile.active !== false && profile.status !== "LOCKED" ? t("accountActive") : t("accountLocked")}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9d948a]">{t("paymentStrikes")}</p>
                <p className="mt-1 text-lg font-semibold text-[#f0d98b]">
                  {t("paymentStrikesCount").replace("{count}", String(profile.paymentStrikeCount ?? 0))}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (profile.paymentStrikeCount ?? 0) >= 3
                        ? "bg-red-500"
                        : (profile.paymentStrikeCount ?? 0) >= 1
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, ((profile.paymentStrikeCount ?? 0) / 3) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            {profile.lockedByPaymentStrikes && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {t("accountLockedByStrikes")}
              </div>
            )}
            {!profile.lockedByPaymentStrikes && (profile.paymentStrikeCount ?? 0) > 0 && (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                <p>{t("strikesWarning").replace("{count}", String(profile.paymentStrikeCount ?? 0))}</p>
                <p className="mt-1 text-amber-200/80">{t("strikesClearedOnPayment")}</p>
                <Link href="/won-items" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#f0d98b] hover:underline">
                  {t("viewWonItems")}
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton cards={2} />
        ) : !profile ? (
          <div>
            {loadErrorCode === "unauthorized" ? (
              <EmptyState icon="lock" title={t("loadError")} description="Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để quản lý hồ sơ." actionLabel={t("loginAgain")} actionHref="/auth" />
            ) : (
              <EmptyState icon="person_off" title={t("loadError")} description="Chúng tôi chưa thể tải hồ sơ của bạn. Hãy thử lại sau ít phút." />
            )}
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-[#0e0d0b] p-6 shadow-[0_18px_50px_rgba(0,0,0,.35)]">
            <h3 className="mb-lg border-b border-white/10 pb-sm text-lg font-semibold text-[#f5ead9]">
              {t("accountDetails")}
            </h3>

            {feedback && (
              <div
                className={`mb-md rounded-lg border px-md py-sm text-sm ${
                  feedback.type === "ok"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : "border-red-500/30 bg-red-500/10 text-red-200"
                }`}
              >
                {feedback.text}
              </div>
            )}

            <div className="grid grid-cols-1 gap-md md:grid-cols-2">
              <Field
                label={t("fullName")}
                value={editing ? editFullName : profile.fullName || t("notProvided")}
                type="text"
                editing={editing}
                onChange={setEditFullName}
              />
              <Field
                label={t("emailAddress")}
                value={profile.email || t("notProvided")}
                type="email"
                editing={false}
                readOnly
              />
              <Field
                label={t("phoneNumber")}
                value={editing ? editPhone : profile.phone || t("notProvided")}
                type="tel"
                editing={editing}
                onChange={setEditPhone}
              />
              <Field
                label={t("identityNumber")}
                value={profile.identityNumber || t("notProvided")}
                type="text"
                editing={false}
                readOnly
                hint={!profile.identityNumber ? t("addInKyc") : undefined}
              />
              <Field
                label={t("membership")}
                value={roleLabel}
                type="text"
                editing={false}
                readOnly
              />
              <Field
                label={t("profileStatus")}
                value={profile.profileStatus || t("notProvided")}
                type="text"
                editing={false}
                readOnly
              />
            </div>

            {editing && (
              <div className="mt-lg flex justify-end gap-sm">
                <OutlineButton onClick={() => setEditing(false)}>{t("cancel")}</OutlineButton>
                <GoldButton onClick={handleSave} disabled={saving}>
                  {saving ? t("saving") : t("saveChanges")}
                </GoldButton>
              </div>
            )}

            {!profile.identityVerified && !editing && (
              <div className="mt-lg rounded-xl border border-[#d4aa61]/25 bg-[#14120f] p-5">
                <p className="text-sm leading-6 text-[#e8dcc8]">{t("kycHint")}</p>
                <GoldButton href="/kyc" className="mt-4 inline-flex">
                  {t("verifyNow")}
                </GoldButton>
              </div>
            )}
          </div>
        )}

        {!loading && profile && canUpgradeToSeller && (
          <div
            id="seller-upgrade"
            className="scroll-mt-24 rounded-[28px] border border-[#d4aa61]/20 bg-[#0c0b09] p-6 text-white shadow-[0_22px_70px_rgba(0,0,0,.45)] sm:p-8"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d4aa61]">
                  {t("sellerUpgradeEyebrow")}
                </p>
                <h3 className={`mt-2 ${displayFont} text-2xl font-semibold text-[#f5ead9]`}>
                  {t("sellerUpgradeTitle")}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#b7aea3]">{t("sellerUpgradeDesc")}</p>
                <ul className="mt-4 space-y-2 text-sm text-[#e8dcc8]">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 text-[18px] text-[#d4aa61]">check_circle</span>
                    {t("sellerUpgradeBenefit1")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 text-[18px] text-[#d4aa61]">check_circle</span>
                    {t("sellerUpgradeBenefit2")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 text-[18px] text-[#d4aa61]">check_circle</span>
                    {t("sellerUpgradeBenefit3")}
                  </li>
                </ul>
              </div>
              <GoldButton href="/become-seller" className="inline-flex shrink-0 items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                {t("sellerUpgradeCta")}
              </GoldButton>
            </div>
          </div>
        )}
      </div>
    </CollectorShell>
  );
}

function Field({
  label,
  value,
  type,
  editing,
  onChange,
  readOnly,
  hint,
}: {
  label: string;
  value: string;
  type: "text" | "email" | "tel";
  editing: boolean;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-xs block text-xs font-semibold uppercase tracking-[0.12em] text-[#9d948a]">{label}</label>
      {editing && !readOnly ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="luxe-input w-full"
        />
      ) : (
        <p className="rounded-xl border border-white/10 bg-[#14120f] px-4 py-3 text-sm text-[#f5ead9]">
          {value}
        </p>
      )}
      {hint && !editing && (
        <p className="mt-xs text-xs text-[#9d948a]">{hint}</p>
      )}
    </div>
  );
}
