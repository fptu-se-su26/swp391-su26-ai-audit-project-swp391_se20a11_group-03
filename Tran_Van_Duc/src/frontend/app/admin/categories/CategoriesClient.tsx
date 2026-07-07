"use client";

import { useState } from "react";
import { mockCategories } from "@/lib/mock-data";

export default function CategoriesClient() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display-lg text-3xl">Quản lý sản phẩm</h1>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="gradient-cta rounded-full px-5 py-2.5 text-sm font-semibold text-black"
        >
          Thêm sản phẩm
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {mockCategories.map((cat) => (
          <div key={cat.id} className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold)]">
                <span className="material-symbols-outlined">{cat.icon}</span>
              </span>
              <div>
                <p className="font-semibold">{cat.name}</p>
                <p className="text-xs text-white/40">{cat.count} tin đăng</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {cat.subcategories.map((sub) => (
                <span
                  key={sub}
                  className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/60"
                >
                  {sub}
                </span>
              ))}
              <button
                type="button"
                className="rounded-full border border-dashed border-white/20 px-2.5 py-1 text-[11px] text-white/40 hover:border-[var(--luxora-gold)]"
              >
                + Thêm
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-full border border-white/15 py-2 text-xs font-semibold hover:border-[var(--luxora-gold)]"
              >
                Sửa
              </button>
              <button
                type="button"
                className="flex-1 rounded-full border border-white/15 py-2 text-xs font-semibold hover:border-red-400 hover:text-red-300"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--luxora-bg-elevated)] p-6">
            <h2 className="font-headline-md text-lg">Sản phẩm mới</h2>
            <div className="mt-4 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Tên"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
              />
              <input
                type="text"
                placeholder="Biểu tượng (tên Material Symbols)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
              />
              <input
                type="text"
                placeholder="Subcategories (phân cách bằng dấu phẩy)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-full border border-white/15 py-2.5 text-sm font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="gradient-cta flex-1 rounded-full py-2.5 text-sm font-semibold text-black"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
