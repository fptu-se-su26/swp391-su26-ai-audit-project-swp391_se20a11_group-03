"use client";

import { useState } from "react";
import CollectorShell from "@/components/layout/CollectorShell";
import { useTranslations } from "@/i18n/I18nProvider";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SettingsForm from "@/components/dashboard/SettingsForm";

export default function SecurityPage() {
  const t = useTranslations("security");
  const [twoFA, setTwoFA] = useState(true);

  const sessions = [
    { device: 'MacBook Pro 16" (Chrome)', location: "New York, USA", time: "Now", current: true },
    { device: "iPhone 15 Pro (Safari)", location: "New York, USA", time: "2 hours ago", current: false },
    { device: "Windows PC (Edge)", location: "London, UK", time: "3 days ago", current: false },
  ];

  return (
    <CollectorShell>
      <div className="mx-auto max-w-[1000px] space-y-5 px-4 py-10 sm:px-7 lg:px-10 lg:py-14">
        <DashboardHeader eyebrow="Account protection" title={t("title")} subtitle={t("subtitle")} />
        <div className="grid gap-4 pt-2 lg:grid-cols-2">

        {/* Change Password */}
        <SettingsForm icon="password" title={t("changePassword")} description="Sử dụng mật khẩu mạnh và không trùng với dịch vụ khác.">
          <div className="space-y-md max-w-md">
            {[t("currentPassword"), t("newPassword"), t("confirmNewPassword")].map((label) => (
              <div key={label}>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">{label}</label>
                <input
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  className="w-full rounded-xl border border-[#d8d1c5] bg-[#fffdf9] px-4 py-3 text-sm outline-none transition focus:border-[#b9974f] focus:ring-2 focus:ring-[#b9974f]/15"
                />
              </div>
            ))}
            <button className="rounded-full bg-[#071626] px-5 py-3 text-xs font-bold text-[#e3c67a] hover:bg-[#102a42]">
              {t("updatePassword")}
            </button>
          </div>
        </SettingsForm>

        {/* 2FA */}
        <SettingsForm icon="shield_lock" title={t("twoFactorAuth")} description={t("twoFactorDesc")}>
          <div className="flex justify-between items-start">
            <p className="text-xs font-semibold text-[#5e6972]">Authenticator security</p>
            <button
              onClick={() => setTwoFA((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFA ? "bg-secondary" : "bg-outline-variant"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${twoFA ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
          {twoFA && (
            <div className="mt-md p-md bg-tertiary-fixed/20 rounded-lg border border-tertiary-fixed-dim/30 flex items-center gap-sm">
              <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label-md text-label-md text-on-tertiary-container">{t("twoFactorActive")}</span>
            </div>
          )}
        </SettingsForm>
        </div>

        {/* Active Sessions */}
        <SettingsForm icon="devices" title={t("activeSessions")} description="Theo dõi và thu hồi các phiên đăng nhập không nhận ra.">
          <div className="space-y-md">
            {sessions.map((session, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-[#e6e0d5] bg-[#faf7f0] p-4">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-on-surface-variant">devices</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">{session.device}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {session.location} · {session.time}
                    </p>
                  </div>
                </div>
                {session.current ? (
                  <span className="px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full font-label-sm text-[10px] font-bold uppercase">
                    {t("current")}
                  </span>
                ) : (
                  <button className="text-error font-label-sm text-label-sm hover:underline">{t("revoke")}</button>
                )}
              </div>
            ))}
          </div>
        </SettingsForm>
      </div>
    </CollectorShell>
  );
}
