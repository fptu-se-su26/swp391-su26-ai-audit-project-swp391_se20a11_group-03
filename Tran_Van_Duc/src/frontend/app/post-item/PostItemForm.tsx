"use client";

import { useState } from "react";

const CATEGORIES = ["Đồng hồ", "Túi xách", "Nghệ thuật", "Rượu vang", "Trang sức"];

export default function PostItemForm() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  function handleGetValuation() {
    setAiLoading(true);
    setAiResult(null);
    setTimeout(() => {
      setAiLoading(false);
      setAiResult("Estimated $175,000 – $220,000 dựa trên tình trạng và độ hiếm của sản phẩm.");
    }, 1800);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Form (2/3) */}
      <form className="glass-panel flex flex-col gap-5 rounded-2xl p-6 lg:col-span-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            Tên sản phẩm
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Rolex Daytona 116500LN"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            Danh mục
          </label>
          <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)]">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[var(--luxora-bg-elevated)]">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            Giá khởi điểm
          </label>
          <input
            type="number"
            placeholder="$0"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            Mô tả &amp; Tình trạng sản phẩm
          </label>
          <textarea
            rows={5}
            placeholder="Mô tả chi tiết tình trạng, xuất xứ, giấy tờ đi kèm..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            Tải ảnh lên
          </label>
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-10 text-center">
            <span className="material-symbols-outlined text-3xl text-white/30">
              cloud_upload
            </span>
            <p className="text-sm text-white/50">
              Kéo thả ảnh vào đây hoặc bấm để chọn file
            </p>
            <p className="text-xs text-white/30">JPG, PNG, TIFF · tối đa 20MB</p>
          </div>
        </div>

        <button
          type="button"
          className="gradient-cta mt-2 rounded-full py-3.5 text-sm font-semibold text-black"
        >
          Gửi để duyệt
        </button>
      </form>

      {/* AI Valuation Assistant */}
      <aside className="glass-panel sticky top-24 h-fit rounded-2xl p-6 lg:col-span-1">
        <p className="text-sm font-semibold">Trợ lý định giá AI</p>
        <p className="mt-1 text-xs text-white/50">
          Nhận định giá tức thì dựa trên dữ liệu thị trường của BidZone.
        </p>

        <button
          type="button"
          onClick={handleGetValuation}
          disabled={aiLoading}
          className="gradient-cta mt-5 w-full rounded-full py-3 text-sm font-semibold text-black disabled:opacity-60"
        >
          {aiLoading ? "Đang phân tích..." : "Nhận định giá AI"}
        </button>

        {aiResult && (
          <div className="mt-4 rounded-xl border border-[var(--luxora-gold)]/30 bg-[var(--luxora-gold)]/5 p-4 text-sm text-[var(--luxora-gold-light)]">
            {aiResult}
          </div>
        )}

        <p className="mt-4 text-[11px] text-white/30">
          Lượt xử lý còn lại: 12
        </p>
      </aside>
    </div>
  );
}
