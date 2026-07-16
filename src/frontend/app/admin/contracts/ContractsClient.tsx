"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiError, type ContractRow } from "@/lib/api";

const TYPE_CLASS: Record<string, string> = {
  SELLER_AGREEMENT: "bg-blue-500/10 text-blue-300",
  LISTING: "bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold-light)]",
  PURCHASE_AGREEMENT: "bg-green-500/10 text-green-300",
};

function fmt(date: string | null) {
  return date
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(date))
    : "—";
}

export default function ContractsClient() {
  const [rows, setRows] = useState<ContractRow[]>([]);
  const [cccd, setCccd] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (filter = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.contracts(filter);
      setRows(res.data ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể tải danh sách hợp đồng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function openPdf(row: ContractRow) {
    setBusyId(row.contractId);
    setError(null);
    try {
      const blob = await adminApi.contractPdfBlob(row.contractId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      setError("Không mở được PDF của hợp đồng #" + row.contractId + ".");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
        TÀI CHÍNH &amp; PHÁP LÝ
      </p>
      <h1 className="font-display-lg mt-2 text-3xl">Hợp đồng điện tử</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load(cccd.trim());
        }}
        className="mt-6 flex gap-3"
      >
        <input
          value={cccd}
          onChange={(e) => setCccd(e.target.value)}
          placeholder="Lọc theo số CCCD..."
          className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
        />
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
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-white/40">
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Loại hợp đồng</th>
              <th className="px-4 py-3">Đối tượng</th>
              <th className="px-4 py-3">CCCD</th>
              <th className="px-4 py-3">Ngày tạo</th>
              <th className="px-4 py-3 text-right">PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.contractId} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-white/60">#{r.contractId}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${TYPE_CLASS[r.contractType ?? ""] ?? "bg-white/10 text-white/60"}`}
                  >
                    {r.typeLabel ?? r.contractType ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">{r.referenceName ?? "—"}</td>
                <td className="px-4 py-3 text-white/60">{r.identityNumber ?? "—"}</td>
                <td className="px-4 py-3 text-white/50">{fmt(r.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={busyId === r.contractId}
                    onClick={() => void openPdf(r)}
                    className="inline-flex items-center gap-1 rounded-full bg-white/5 px-4 py-1.5 text-[11px] font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                    {busyId === r.contractId ? "Đang mở..." : "Xem"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-6 text-center text-sm text-white/40">Đang tải...</p>}
        {!loading && rows.length === 0 && (
          <p className="p-6 text-center text-sm text-white/40">Chưa có hợp đồng nào.</p>
        )}
      </div>
    </div>
  );
}
