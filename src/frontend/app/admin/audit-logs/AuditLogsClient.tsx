"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiError, type WalletTransaction } from "@/lib/api";

const VND = new Intl.NumberFormat("vi-VN");

function fmt(date: string | null) {
  return date
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "medium" }).format(new Date(date))
    : "—";
}

export default function AuditLogsClient() {
  const [rows, setRows] = useState<WalletTransaction[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (f = "", t = "", ty = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.balanceLedger({ from: f, to: t, type: ty });
      setRows(res.data ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể tải nhật ký.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const types = Array.from(new Set(rows.map((r) => r.transactionType))).sort();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
        QUẢN TRỊ HỆ THỐNG
      </p>
      <h1 className="font-display-lg mt-2 text-3xl">Nhật ký hệ thống</h1>
      <p className="mt-2 text-sm text-white/50">
        Toàn bộ biến động tài chính trên nền tảng: nạp/rút, khóa tiền đặt giá, hoàn cọc,
        thanh toán, hoa hồng, tịch thu.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load(from, to, type);
        }}
        className="mt-6 flex flex-wrap items-end gap-3"
      >
        <label className="text-xs text-white/50">
          Từ ngày
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--luxora-gold)]"
          />
        </label>
        <label className="text-xs text-white/50">
          Đến ngày
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--luxora-gold)]"
          />
        </label>
        <label className="text-xs text-white/50">
          Loại
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--luxora-gold)]"
          >
            <option value="" className="bg-[#111]">Tất cả</option>
            {types.map((t) => (
              <option key={t} value={t} className="bg-[#111]">
                {t}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-xl bg-[var(--luxora-gold)] px-5 py-2.5 text-sm font-semibold text-black"
        >
          Lọc
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="glass-panel mt-6 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-white/40">
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Người dùng</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3 text-right">Số tiền</th>
              <th className="px-4 py-3">Mã tham chiếu</th>
              <th className="px-4 py-3">Mô tả</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.slice(0, 200).map((r) => (
              <tr key={r.transactionId} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3 whitespace-nowrap text-white/50">{fmt(r.createdAt)}</td>
                <td className="px-4 py-3">{r.userName}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                    {r.transactionTypeLabel || r.transactionType}
                  </span>
                </td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    r.signedAmount >= 0 ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {r.signedAmount >= 0 ? "+" : ""}
                  {VND.format(r.signedAmount)} ₫
                </td>
                <td className="px-4 py-3 text-white/50">{r.referenceCode ?? "—"}</td>
                <td className="max-w-[280px] truncate px-4 py-3 text-white/50" title={r.description ?? ""}>
                  {r.description ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-6 text-center text-sm text-white/40">Đang tải...</p>}
        {!loading && rows.length === 0 && (
          <p className="p-6 text-center text-sm text-white/40">Không có bản ghi nào.</p>
        )}
        {!loading && rows.length > 200 && (
          <p className="p-3 text-center text-xs text-white/35">
            Hiển thị 200 bản ghi mới nhất trong {rows.length}. Dùng bộ lọc để thu hẹp.
          </p>
        )}
      </div>
    </div>
  );
}
