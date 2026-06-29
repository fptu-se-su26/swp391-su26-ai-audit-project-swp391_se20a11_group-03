"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CollectorShell from "@/components/layout/CollectorShell";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";
import EmptyState from "@/components/dashboard/EmptyState";
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
import { selectRole } from "@/lib/services/authService";
import { ApiError, clearStoredAuth, getStoredToken } from "@/lib/apiClient";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tRoles = useTranslations("roles");
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upgradingSeller, setUpgradingSeller] = useState(false);
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

  async function handleUpgradeSeller() {
    if (!currentUser?.userId) {
      return;
    }
    setUpgradingSeller(true);
    setFeedback(null);
    try {
      const response = await selectRole({
        userId: currentUser.userId,
        role: "Seller",
      });
      if (!response.success) {
        throw new Error(response.message || t("sellerUpgradeError"));
      }
      const updatedUser: StoredUser = {
        ...currentUser,
        roleName: response.roleName ?? "Seller",
      };
      saveStoredUser(updatedUser);
      setCurrentUser(updatedUser);
      setFeedback({ type: "ok", text: t("sellerUpgradeSuccess") });
      const nextPath =
        profile?.identityVerified || updatedUser.identityVerified ? "/post-item" : "/kyc";
      window.setTimeout(() => router.push(nextPath), 600);
    } catch (err) {
      setFeedback({
        type: "err",
        text: err instanceof Error ? err.message : t("sellerUpgradeError"),
      });
    } finally {
      setUpgradingSeller(false);
    }
  }

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
              className="flex items-center gap-2 rounded-full border border-[#d4ccbe] bg-white px-5 py-2.5 text-xs font-bold text-[#4f5b65] transition hover:border-[#b9974f]"
            >
              <span className="material-symbols-outlined text-[18px]">{editing ? "close" : "edit"}</span>
              {editing ? t("cancel") : t("editProfile")}
            </button>
          )}
        </div>

        <div className="relative flex items-center gap-6 overflow-hidden rounded-3xl border border-white/10 bg-[#071626] p-7 text-white shadow-[0_20px_55px_rgba(7,22,38,.18)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_15%,rgba(212,180,99,.25),transparent_26%)]" />
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#d6b969] bg-[#10283d] text-[28px] font-bold uppercase text-[#e6cc85] shadow-lg">
              {initials}
            </div>
          </div>
          <div className="relative">
            <h2 className="font-display-lg text-2xl font-semibold">{displayName}</h2>
            <p className="mt-1 text-xs font-semibold text-[#d6b969]">{roleLabel}</p>
            {profile?.email && <p className="mt-2 text-sm text-[#9dabb7]">{profile.email}</p>}
            <div className="mt-sm flex items-center gap-xs">
              {profile?.identityVerified ? (
                <>
                  <span
                    className="material-symbols-outlined text-[16px] text-on-tertiary-container"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span className="font-label-sm text-label-sm text-on-tertiary-container">
                    {t("identityVerified")}
                  </span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                    verified_user
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {t("identityNotVerified")}
                  </span>
                  <Link
                    href="/kyc"
                    className="ml-xs font-label-sm text-label-sm text-secondary hover:underline"
                  >
                    {t("verifyNow")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

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
          <div className="rounded-2xl border border-[#e0d9ce] bg-white/80 p-6 shadow-[0_8px_28px_rgba(18,31,44,.05)]">
            <h3 className="mb-lg border-b border-surface-variant pb-sm font-headline-sm text-headline-sm text-primary">
              {t("accountDetails")}
            </h3>

            {feedback && (
              <div
                className={`mb-md rounded-lg border px-md py-sm text-sm ${
                  feedback.type === "ok"
                    ? "border-tertiary/40 bg-tertiary-container text-on-tertiary-container"
                    : "border-error/40 bg-error-container text-on-error-container"
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
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-outline-variant px-lg py-sm font-label-md text-label-md transition-colors hover:bg-surface-container-low"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-secondary px-lg py-sm font-label-md text-label-md text-on-secondary transition-colors hover:bg-secondary-fixed-dim disabled:opacity-60"
                >
                  {saving ? t("saving") : t("saveChanges")}
                </button>
              </div>
            )}

            {!profile.identityVerified && !editing && (
              <div className="mt-lg rounded-lg border border-secondary/30 bg-secondary-container p-md">
                <p className="font-label-md text-label-md text-on-secondary-container">
                  {t("kycHint")}
                </p>
                <Link
                  href="/kyc"
                  className="mt-sm inline-flex items-center gap-xs rounded-lg bg-secondary px-md py-sm font-label-md text-label-md text-on-secondary hover:bg-secondary-fixed-dim"
                >
                  {t("verifyNow")}
                </Link>
              </div>
            )}
          </div>
        )}

        {!loading && profile && canUpgradeToSeller && (
          <div
            id="seller-upgrade"
            className="scroll-mt-24 rounded-2xl border border-[#d7c9a8] bg-[#071626] p-6 text-white shadow-[0_20px_55px_rgba(7,22,38,.18)] sm:p-8"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d7ba70]">
                  {t("sellerUpgradeEyebrow")}
                </p>
                <h3 className="mt-2 font-display-lg text-2xl font-semibold">{t("sellerUpgradeTitle")}</h3>
                <p className="mt-3 text-sm leading-6 text-[#aebbc6]">{t("sellerUpgradeDesc")}</p>
                <ul className="mt-4 space-y-2 text-sm text-[#c5d0d9]">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 text-[18px] text-[#d7ba70]">check_circle</span>
                    {t("sellerUpgradeBenefit1")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 text-[18px] text-[#d7ba70]">check_circle</span>
                    {t("sellerUpgradeBenefit2")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined mt-0.5 text-[18px] text-[#d7ba70]">check_circle</span>
                    {t("sellerUpgradeBenefit3")}
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleUpgradeSeller}
                disabled={upgradingSeller}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#dfbf70] px-6 py-3.5 text-sm font-bold text-[#071626] transition hover:bg-[#efd694] disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                {upgradingSeller ? t("sellerUpgrading") : t("sellerUpgradeCta")}
              </button>
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
      <label className="mb-xs block font-label-md text-label-md text-on-surface-variant">{label}</label>
      {editing && !readOnly ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
        />
      ) : (
        <p className="rounded-lg border border-surface-variant bg-surface-container-low px-4 py-2.5 font-body-md text-body-md text-on-surface">
          {value}
        </p>
      )}
      {hint && !editing && (
        <p className="mt-xs text-xs text-on-surface-variant">{hint}</p>
      )}
    </div>
  );
}
