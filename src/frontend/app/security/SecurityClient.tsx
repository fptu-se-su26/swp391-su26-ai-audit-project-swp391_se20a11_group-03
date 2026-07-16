"use client";

import { useState } from "react";
import { ApiError, userApi } from "@/lib/api";

export default function SecurityClient() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      setError("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await userApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSuccess(res.message || "Đổi mật khẩu thành công.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Không kết nối được máy chủ. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const fields = [
    {
      label: "Mật khẩu hiện tại",
      value: currentPassword,
      set: setCurrentPassword,
      autoComplete: "current-password",
    },
    {
      label: "Mật khẩu mới",
      value: newPassword,
      set: setNewPassword,
      autoComplete: "new-password",
    },
    {
      label: "Xác nhận mật khẩu mới",
      value: confirmPassword,
      set: setConfirmPassword,
      autoComplete: "new-password",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display-lg text-3xl">Bảo mật</h1>

      <form
        onSubmit={handleChangePassword}
        className="glass-panel mt-8 rounded-2xl p-6"
      >
        <p className="mb-4 text-sm font-semibold">Đổi mật khẩu</p>

        {error ? (
          <p className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mb-3 rounded-lg border border-green-400/30 bg-green-500/10 px-3 py-2 text-xs text-green-200">
            {success}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {fields.map((field) => (
            <div key={field.label}>
              <label className="mb-1.5 block text-xs text-white/50">
                {field.label}
              </label>
              <input
                type="password"
                required
                value={field.value}
                autoComplete={field.autoComplete}
                onChange={(event) => field.set(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="gradient-cta mt-4 rounded-full px-6 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
        </button>
      </form>

      <div className="glass-panel mt-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Xác thực hai yếu tố</p>
            <p className="mt-1 text-xs text-white/50">
              Tính năng đang được phát triển, sẽ sớm ra mắt.
            </p>
          </div>
          <button
            type="button"
            disabled
            aria-label="2FA chưa khả dụng"
            className="relative h-7 w-12 cursor-not-allowed rounded-full bg-white/10 opacity-50"
          >
            <span className="absolute top-0.5 h-6 w-6 translate-x-0.5 rounded-full bg-black" />
          </button>
        </div>
      </div>

      <div className="glass-panel mt-6 rounded-2xl p-6">
        <p className="mb-4 text-sm font-semibold">
          Phiên đăng nhập đang hoạt động
        </p>
        <div className="rounded-xl border border-white/10 px-4 py-3">
          <p className="text-sm font-medium">
            Thiết bị này
            <span className="ml-2 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-300">
              Hiện tại
            </span>
          </p>
          <p className="text-xs text-white/40">
            Phiên đăng nhập hiện tại trên trình duyệt của bạn. Quản lý nhiều
            thiết bị sẽ sớm ra mắt.
          </p>
        </div>
      </div>
    </div>
  );
}
