"use client";

import { useState } from "react";

const SESSIONS = [
  { device: "MacBook Pro", location: "Hồ Chí Minh, VN", current: true },
  { device: "iPhone 15 Pro", location: "Hồ Chí Minh, VN", current: false },
  { device: "Windows PC", location: "Hà Nội, VN", current: false },
];

export default function SecurityClient() {
  const [twoFA, setTwoFA] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display-lg text-3xl">Bảo mật</h1>

      <div className="glass-panel mt-8 rounded-2xl p-6">
        <p className="mb-4 text-sm font-semibold">Đổi mật khẩu</p>
        <div className="flex flex-col gap-3">
          {["Mật khẩu hiện tại", "Mật khẩu mới", "Xác nhận mật khẩu mới"].map(
            (label) => (
              <div key={label}>
                <label className="mb-1.5 block text-xs text-white/50">
                  {label}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
                />
              </div>
            ),
          )}
        </div>
        <button
          type="button"
          className="gradient-cta mt-4 rounded-full px-6 py-2.5 text-sm font-semibold text-black"
        >
          Cập nhật mật khẩu
        </button>
      </div>

      <div className="glass-panel mt-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Xác thực hai yếu tố</p>
            <p className="mt-1 text-xs text-white/50">
              {twoFA
                ? "2FA đang được bật cho tài khoản của bạn."
                : "Bật xác thực hai lớp để bảo vệ tài khoản tốt hơn."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTwoFA((v) => !v)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              twoFA ? "bg-[var(--luxora-gold)]" : "bg-white/15"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-black transition-transform ${
                twoFA ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="glass-panel mt-6 rounded-2xl p-6">
        <p className="mb-4 text-sm font-semibold">Phiên đăng nhập đang hoạt động</p>
        <div className="flex flex-col gap-3">
          {SESSIONS.map((s) => (
            <div
              key={s.device}
              className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {s.device}
                  {s.current && (
                    <span className="ml-2 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-300">
                      Hiện tại
                    </span>
                  )}
                </p>
                <p className="text-xs text-white/40">{s.location}</p>
              </div>
              {!s.current && (
                <button
                  type="button"
                  className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold hover:border-red-400 hover:text-red-300"
                >
                  Thu hồi
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
