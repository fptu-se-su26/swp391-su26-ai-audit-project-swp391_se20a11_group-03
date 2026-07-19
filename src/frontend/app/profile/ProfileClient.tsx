"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { userApi, type UserProfile } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

async function loadProfile(): Promise<UserProfile> {
  return (await userApi.profile()).data;
}

const EMPTY_PROFILE: UserProfile = {
  userId: 0,
  fullName: "",
  email: "",
  phone: "",
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

export default function ProfileClient() {
  const t = useTranslations("profilePage");
  const { data: profile, setData, loading, error } = useApiData(loadProfile, EMPTY_PROFILE);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleEditing() {
    if (!editing) {
      setFullName(profile.fullName);
      setPhone(profile.phone);
    }
    setEditing((value) => !value);
  }

  async function save() {
    setSaving(true);
    try {
      const response = await userApi.updateProfile(fullName, phone);
      setData(response.data);
      setEditing(false);
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

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display-lg text-3xl">{t("title")}</h1>
        <button
          type="button"
          onClick={toggleEditing}
          disabled={loading || Boolean(error)}
          className={editing
            ? "rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold hover:border-white/30"
            : "gradient-cta rounded-full px-5 py-2.5 text-xs font-semibold text-black"}
        >
          {editing ? t("cancelBtn") : t("editBtn")}
        </button>
      </div>

      {error && <p className="mt-6 text-sm text-red-300">{error}</p>}

      <div className="glass-panel mt-8 flex items-center gap-5 rounded-2xl p-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--luxora-gold)]/15 text-xl font-bold text-[var(--luxora-gold-light)]">
          {initials || "?"}
        </div>
        <div>
          <p className="text-lg font-semibold">{profile.fullName || t("loading")}</p>
          <p className="text-sm capitalize text-white/40">{profile.roleName}</p>
          <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${profile.identityVerified ? "bg-green-500/10 text-green-300" : "bg-yellow-500/10 text-yellow-300"}`}>
            <span className="material-symbols-outlined text-sm">verified</span>
            {profile.identityVerified ? t("verifiedBadge") : t("notVerifiedBadge")}
          </span>
        </div>
      </div>

      <div className="glass-panel mt-6 rounded-2xl p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">{t("accountInfoTitle")}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] text-white/40">{t("fullNameLabel")}</label>
            {editing ? (
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--luxora-gold)]" />
            ) : <p className="text-sm font-medium">{profile.fullName || "—"}</p>}
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/40">{t("emailLabel")}</label>
            <p className="text-sm font-medium">{profile.email || "—"}</p>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/40">{t("phoneLabel")}</label>
            {editing ? (
              <input value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--luxora-gold)]" />
            ) : <p className="text-sm font-medium">{profile.phone || "—"}</p>}
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-white/40">{t("idNumberLabel")}</label>
            <p className="text-sm font-medium">{profile.identityNumber || t("noIdNumber")}</p>
          </div>
        </div>
        {editing && (
          <button type="button" onClick={() => void save()} disabled={saving} className="gradient-cta mt-6 rounded-full px-6 py-3 text-sm font-semibold text-black disabled:opacity-50">
            {saving ? t("saving") : t("saveBtn")}
          </button>
        )}
      </div>
    </div>
  );
}
