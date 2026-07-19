"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { adminApi, ApiError, type FraudSettings } from "@/lib/api";

const EMPTY: FraudSettings = {
  detectionEnabled: true,
  autoRestrictionEnabled: false,
  alertEnabled: true,
  updatedAt: null,
};

type SettingKey = "detectionEnabled" | "autoRestrictionEnabled" | "alertEnabled";

export default function FraudSettingsClient() {
  const t = useTranslations("fraudAdmin.settings");
  const [settings, setSettings] = useState(EMPTY);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await adminApi.fraudSettings();
      setSettings(response.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function toggle(key: SettingKey) {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
    setMessage(null);
  }

  async function save() {
    if (!reason.trim()) {
      setError(t("reasonRequired"));
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await adminApi.updateFraudSettings({
        detectionEnabled: settings.detectionEnabled,
        autoRestrictionEnabled: settings.autoRestrictionEnabled,
        alertEnabled: settings.alertEnabled,
        reason: reason.trim(),
      });
      setSettings(response.data);
      setReason("");
      setMessage(t("saved"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  const rows: Array<{ key: SettingKey; icon: string }> = [
    { key: "detectionEnabled", icon: "shield" },
    { key: "autoRestrictionEnabled", icon: "lock_clock" },
    { key: "alertEnabled", icon: "notifications_active" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">{t("badge")}</p>
      <h1 className="font-display-lg mt-2 text-3xl">{t("title")}</h1>
      <p className="mt-2 text-sm text-white/50">{t("subtitle")}</p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        {rows.map(({ key, icon }) => (
          <div key={key} className="flex items-center gap-4 border-b border-white/10 p-5 last:border-b-0">
            <span className="material-symbols-outlined text-2xl text-[var(--luxora-gold)]">{icon}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{t(`${key}.title`)}</p>
              <p className="mt-1 text-xs leading-5 text-white/45">{t(`${key}.description`)}</p>
            </div>
            <button
              type="button"
              disabled={loading || saving}
              onClick={() => toggle(key)}
              aria-pressed={settings[key]}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                settings[key] ? "bg-[var(--luxora-gold)]" : "bg-white/15"
              }`}
            >
              <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                settings[key] ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--luxora-gold)]/30 bg-[var(--luxora-gold)]/10 p-4 text-sm leading-6 text-[var(--luxora-gold-darker)]">
        <span
          aria-hidden="true"
          className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-[var(--luxora-gold-dark)]"
        >
          shield_lock
        </span>
        <p>{t("selfBidNotice")}</p>
      </div>

      <label className="mt-6 block text-sm font-semibold text-[var(--luxora-text)]">
        <span>{t("reason")}</span>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={500}
          rows={3}
          className="mt-2 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--luxora-bg-elevated)] px-4 py-3 text-sm font-normal text-[var(--luxora-text)] shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-[var(--luxora-text-muted)] focus:border-[var(--luxora-gold)] focus:shadow-[0_0_0_3px_rgba(180,122,32,0.14)]"
          placeholder={t("reasonPlaceholder")}
        />
      </label>

      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-green-300">{message}</p> : null}

      <button
        type="button"
        disabled={loading || saving}
        onClick={() => void save()}
        className="mt-5 rounded-xl bg-[var(--luxora-gold)] px-6 py-3 text-sm font-semibold text-black disabled:opacity-50"
      >
        {saving ? t("saving") : t("save")}
      </button>
    </div>
  );
}
