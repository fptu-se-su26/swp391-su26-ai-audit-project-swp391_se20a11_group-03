"use client";

import { useState } from "react";

const AUDIENCE_BREAKDOWN = [
  { label: "Tất cả", value: 8420 },
  { label: "Nhà sưu tầm", value: 6180 },
  { label: "Người bán", value: 1840 },
  { label: "Nhân viên", value: 400 },
];

const SENT_BROADCASTS = [
  { id: "1", title: "Phiên đấu giá đặc biệt cuối năm", audience: "Tất cả", type: "Sự kiện", sent: "01/07/2026" },
  { id: "2", title: "Cập nhật chính sách KYC", audience: "Nhà sưu tầm", type: "Tuân thủ", sent: "25/06/2026" },
  { id: "3", title: "Bảo trì hệ thống định kỳ", audience: "Tất cả", type: "Hệ thống", sent: "18/06/2026" },
];

const TYPE_CLASS: Record<string, string> = {
  "Sự kiện": "bg-blue-500/10 text-blue-300",
  "Tuân thủ": "bg-yellow-500/10 text-yellow-300",
  "Hệ thống": "bg-white/10 text-white/50",
};

export default function BroadcastsClient() {
  const [sent, setSent] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="font-display-lg text-3xl">Thông báo hệ thống</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form
          onSubmit={handleSend}
          className="glass-panel flex flex-col gap-4 rounded-2xl p-6 lg:col-span-2"
        >
          <p className="text-sm font-semibold">Soạn thông báo</p>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">
              Tiêu đề
            </label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">
              Nội dung
            </label>
            <textarea
              rows={4}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs text-white/50">
                Đối tượng
              </label>
              <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)]">
                {["Tất cả", "Nhà sưu tầm", "Người bán", "Nhân viên"].map((a) => (
                  <option key={a} className="bg-[var(--luxora-bg-elevated)]">
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">
                Gửi qua
              </label>
              <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)]">
                {["Trong ứng dụng", "Email + Trong ứng dụng", "Email"].map((v) => (
                  <option key={v} className="bg-[var(--luxora-bg-elevated)]">
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="gradient-cta mt-2 rounded-full py-3 text-sm font-semibold text-black"
          >
            Gửi thông báo
          </button>
          {sent && (
            <p className="rounded-xl bg-green-500/10 px-4 py-2.5 text-sm text-green-300">
              Đã gửi thông báo thành công.
            </p>
          )}
        </form>

        <div className="glass-panel rounded-2xl p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
            Phân bổ đối tượng
          </p>
          <div className="flex flex-col gap-3">
            {AUDIENCE_BREAKDOWN.map((a) => (
              <div key={a.label} className="flex justify-between text-sm">
                <span className="text-white/50">{a.label}</span>
                <span className="font-semibold">
                  {a.value.toLocaleString("en-US")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="font-headline-md mt-10 mb-4 text-lg">
        Thông báo đã gửi
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
              <th className="px-5 py-3 font-medium">Tiêu đề</th>
              <th className="px-5 py-3 font-medium">Đối tượng</th>
              <th className="px-5 py-3 font-medium">Loại</th>
              <th className="px-5 py-3 font-medium">Đã gửi</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {SENT_BROADCASTS.map((b) => (
              <tr key={b.id} className="border-b border-white/5">
                <td className="px-5 py-4 font-medium">{b.title}</td>
                <td className="px-5 py-4 text-white/60">{b.audience}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${TYPE_CLASS[b.type]}`}
                  >
                    {b.type}
                  </span>
                </td>
                <td className="px-5 py-4 text-white/60">{b.sent}</td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold hover:border-[var(--luxora-gold)]"
                  >
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
