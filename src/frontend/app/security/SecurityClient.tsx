"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, userApi } from "@/lib/api";
import KycClient from "@/app/kyc/KycClient";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  autoComplete: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  className?: string;
};

function PasswordField({
  id,
  label,
  value,
  autoComplete,
  visible,
  onChange,
  onToggle,
  className = "",
}: PasswordFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-[#4f5663]">
        {label}
      </label>
      <div className="flex h-11 items-center rounded-xl border border-[#ded8ce] bg-[#fffdfa] px-3.5 transition focus-within:border-[#d3982c] focus-within:ring-2 focus-within:ring-[#dca642]/15">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          placeholder={label}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#17151b] outline-none placeholder:text-[#a7aab1]"
        />
        <button
          type="button"
          onClick={onToggle}
          className="ml-2 grid size-8 place-items-center rounded-lg text-[#7c8491] transition hover:bg-[#f5efe5] hover:text-[#a66b06]"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {visible ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function SecurityClient() {
  const t = useTranslations("security");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function toggleVisibility(field: string) {
    setVisibleFields((current) => ({ ...current, [field]: !current[field] }));
  }

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      setError(t("passwordWeak"));
      return;
    }

    setSubmitting(true);
    try {
      const response = await userApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSuccess(response.message || t("changeSuccess"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setVisibleFields({});
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t("serverError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f4] text-[#17151b]">
      <div className="mx-auto max-w-[1120px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b5790a]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1.5 text-sm text-[#667085]">{t("subtitle")}</p>
        </header>

        <section
          className="mt-5 overflow-hidden rounded-2xl border border-[#e7e0d6] bg-white shadow-[0_12px_40px_rgba(74,55,28,0.06)]"
        >
          <div className="grid lg:grid-cols-[minmax(0,1fr)_330px]">
            <form onSubmit={handleChangePassword} className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined grid size-11 place-items-center rounded-full bg-[#fbf0da] text-[#b77808]">
                  lock
                </span>
                <div>
                  <h2 className="text-lg font-bold">{t("changePassword")}</h2>
                  <p className="mt-0.5 text-xs text-[#7a8190]">{t("changePasswordDesc")}</p>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <PasswordField
                  id="current-password"
                  label={t("currentPassword")}
                  value={currentPassword}
                  autoComplete="current-password"
                  visible={Boolean(visibleFields.current)}
                  onChange={setCurrentPassword}
                  onToggle={() => toggleVisibility("current")}
                  className="sm:col-span-2"
                />
                <PasswordField
                  id="new-password"
                  label={t("newPassword")}
                  value={newPassword}
                  autoComplete="new-password"
                  visible={Boolean(visibleFields.new)}
                  onChange={setNewPassword}
                  onToggle={() => toggleVisibility("new")}
                />
                <PasswordField
                  id="confirm-password"
                  label={t("confirmNewPassword")}
                  value={confirmPassword}
                  autoComplete="new-password"
                  visible={Boolean(visibleFields.confirm)}
                  onChange={setConfirmPassword}
                  onToggle={() => toggleVisibility("confirm")}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 inline-flex min-w-48 items-center justify-center rounded-xl bg-gradient-to-r from-[#d89a27] to-[#c98509] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(199,132,12,0.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? t("updating") : t("updatePassword")}
              </button>
            </form>

            <aside className="relative hidden min-h-full flex-col justify-between overflow-hidden border-l border-[#f0ebe3] bg-gradient-to-br from-[#fffdfa] to-[#fbf3e5] p-5 lg:flex">
              <span className="absolute left-10 top-16 size-2 rounded-full bg-[#e8bd69]/30" />
              <span className="absolute right-12 top-24 size-3 rotate-45 border border-[#e2b75e]/35" />
              <div className="relative z-10 flex flex-1 items-center justify-center py-4">
                <div className="relative grid size-28 place-items-center rounded-[42%] border border-[#eddbb8] bg-white/80 shadow-[0_20px_38px_rgba(183,121,10,0.12)]">
                  <span className="material-symbols-outlined text-[62px] leading-none text-[#c7840d] [font-variation-settings:'FILL'_1,'wght'_500]">
                    lock
                  </span>
                  <div className="absolute -bottom-3 rounded-lg border border-[#dfbd7d] bg-white px-4 py-1.5 text-sm font-black tracking-[0.25em] text-[#68420a] shadow-md">
                    •••••
                  </div>
                </div>
              </div>

              <div className="relative z-10 rounded-xl border border-[#eadfcf] bg-white/90 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined grid size-10 shrink-0 place-items-center rounded-full bg-[#fbf0da] text-[#b77808]">
                    security
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold">{t("twoFactor")}</h2>
                    <p className="mt-0.5 text-[11px] leading-4 text-[#7a8190]">
                      {t("twoFactorDesc")}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    aria-label={t("twoFactorUnavailable")}
                    className="relative h-6 w-11 shrink-0 cursor-not-allowed rounded-full bg-[#ddd9d4]"
                  >
                    <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-[#e7e0d6] bg-white p-4 shadow-[0_10px_30px_rgba(74,55,28,0.05)] lg:hidden">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined grid size-11 shrink-0 place-items-center rounded-full bg-[#fbf0da] text-[#b77808]">
              security
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold">{t("twoFactor")}</h2>
              <p className="mt-1 text-xs text-[#7a8190]">{t("twoFactorDesc")}</p>
            </div>
            <button
              type="button"
              disabled
              aria-label={t("twoFactorUnavailable")}
              className="relative h-7 w-12 shrink-0 cursor-not-allowed rounded-full bg-[#ddd9d4] opacity-80"
            >
              <span className="absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </section>

        <div className="mt-4">
          <KycClient embedded />
        </div>

        <section className="mt-4 rounded-2xl border border-[#e7e0d6] bg-white p-4 shadow-[0_10px_30px_rgba(74,55,28,0.05)] sm:p-5">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined grid size-10 shrink-0 place-items-center rounded-full bg-[#fbf0da] text-[#b77808]">
              desktop_windows
            </span>
            <div>
              <h2 className="font-bold">{t("activeSessions")}</h2>
              <p className="mt-1 text-xs text-[#7a8190]">{t("activeSessionsDesc")}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[#e9e2d8] bg-[#fffdfa] p-4 sm:flex-row sm:items-center">
            <span className="material-symbols-outlined text-3xl text-[#737b88]">
              computer
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{t("thisDevice")}</p>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  {t("current")}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#7a8190]">{t("sessionDesc")}</p>
            </div>
            <button
              type="button"
              disabled
              title={t("sessionManagementUnavailable")}
              className="rounded-xl border border-[#e1d8cb] px-4 py-2.5 text-xs font-bold text-[#a66b06] opacity-60"
            >
              {t("logoutOtherDevices")}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
