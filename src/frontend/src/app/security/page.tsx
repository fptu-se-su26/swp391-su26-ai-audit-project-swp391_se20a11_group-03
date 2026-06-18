"use client";

import { useState } from "react";
import CollectorShell from "@/components/layout/CollectorShell";
import { useTranslations } from "@/i18n/I18nProvider";

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
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{t("title")}</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">{t("subtitle")}</p>
        </div>

        {/* Change Password */}
        <div className="bg-surface rounded-xl p-lg soft-shadow border border-surface-variant">
          <h3 className="font-headline-sm text-headline-sm text-primary mb-lg border-b border-surface-variant pb-sm">{t("changePassword")}</h3>
          <div className="space-y-md max-w-md">
            {[t("currentPassword"), t("newPassword"), t("confirmNewPassword")].map((label) => (
              <div key={label}>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">{label}</label>
                <input
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                />
              </div>
            ))}
            <button className="bg-primary-container text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity">
              {t("updatePassword")}
            </button>
          </div>
        </div>

        {/* 2FA */}
        <div className="bg-surface rounded-xl p-lg soft-shadow border border-surface-variant">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary">{t("twoFactorAuth")}</h3>
              <p className="font-body-md text-on-surface-variant mt-xs">{t("twoFactorDesc")}</p>
            </div>
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
        </div>

        {/* Active Sessions */}
        <div className="bg-surface rounded-xl p-lg soft-shadow border border-surface-variant">
          <h3 className="font-headline-sm text-headline-sm text-primary mb-lg border-b border-surface-variant pb-sm">
            {t("activeSessions")}
          </h3>
          <div className="space-y-md">
            {sessions.map((session, i) => (
              <div key={i} className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-surface-variant">
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
        </div>
      </div>
    </CollectorShell>
  );
}
