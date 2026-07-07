"use client";

import { useState } from "react";
import { mockUser } from "@/lib/mock-data";

const FIELDS = [
  { label: "Họ", value: "Nguyễn" },
  { label: "Tên", value: "Minh Anh" },
  { label: "Email", value: mockUser.email },
  { label: "Số điện thoại", value: mockUser.phone },
  { label: "Ngày sinh", value: "12/05/1992" },
  { label: "Quốc tịch", value: "Việt Nam" },
  { label: "Địa chỉ", value: "12 Nguyễn Huệ" },
  { label: "Thành phố", value: "Hồ Chí Minh" },
  { label: "Mã bưu điện", value: "700000" },
  { label: "Quốc gia", value: "Việt Nam" },
];

export default function ProfileClient() {
  const [editing, setEditing] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display-lg text-3xl">Hồ sơ cá nhân</h1>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className={
            editing
              ? "rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold hover:border-white/30"
              : "gradient-cta rounded-full px-5 py-2.5 text-xs font-semibold text-black"
          }
        >
          {editing ? "Hủy" : "Chỉnh sửa hồ sơ"}
        </button>
      </div>

      <div className="glass-panel mt-8 flex items-center gap-5 rounded-2xl p-6">
        <div
          className="h-20 w-20 shrink-0 rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url(${mockUser.avatar})` }}
        />
        <div>
          <p className="text-lg font-semibold">{mockUser.name}</p>
          <p className="text-sm capitalize text-white/40">{mockUser.role}</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-[11px] font-semibold text-green-300">
            <span className="material-symbols-outlined text-sm">
              verified
            </span>
            Đã xác minh danh tính
          </span>
          {editing && (
            <button
              type="button"
              className="mt-3 block text-xs font-semibold text-[var(--luxora-gold)] hover:underline"
            >
              Đổi ảnh đại diện
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel mt-6 rounded-2xl p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
          Thông tin tài khoản
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.label}>
              <label className="mb-1 block text-[11px] text-white/40">
                {field.label}
              </label>
              {editing ? (
                <input
                  type="text"
                  defaultValue={field.value}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--luxora-gold)]"
                />
              ) : (
                <p className="text-sm font-medium">{field.value}</p>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="gradient-cta mt-6 rounded-full px-6 py-3 text-sm font-semibold text-black"
          >
            Lưu thay đổi
          </button>
        )}
      </div>
    </div>
  );
}
