"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiError, type Withdrawal } from "@/lib/api";

const VND = new Intl.NumberFormat("vi-VN");

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-300",
  APPROVED: "bg-green-500/10 text-green-300",
  REJECTED: "bg-red-500/10 text-red-300",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

const FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
] as const;

function fmt(date: string | null) {
  return date
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(date))
    : "—";
}

export default function WithdrawalsClient() {
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [filter, setFilter] = useState<string>("PENDING");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      setItems(await adminApi.withdrawals(status));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể tải danh sách rút tiền.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(filter), 0);
    return () => window.clearTimeout(timer);
  }, [filter, load]);

  async function act(item: Withdrawal, status: "APPROVED" | "REJECTED") {
    let note = "";
    if (status === "REJECTED") {
      const input = window.prompt(`Lý do từ chối yêu cầu của ${item.userName ?? `#${item.userId}`}:`, "");
      if (input === null) return;
      note = input;
    }
    setBusyId(item.id);
    setNotice(null);
    setError(null);
    try {
      await adminApi.updateWithdrawal(item.id, status, note);
      setNotice(
        status === "APPROVED"
          ? `Đã duyệt rút ${VND.format(item.amount)} ₫ cho ${item.userName ?? `#${item.userId}`}.`
          : "Đã từ chối yêu cầu rút tiền.",
      );
      void load(filter);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể cập nhật yêu cầu.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
        VẬN HÀNH
      </p>
      <h1 className="font-display-lg mt-2 text-3xl">Duyệt rút tiền</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              filter === f.value
                ? "bg-[var(--luxora-gold)] text-black"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {notice && (
        <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {notice}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {items.map((item) => {
          const busy = busyId === item.id;
          const pending = item.status === "PENDING";
          return (
            <div
              key={item.id}
              className="glass-panel flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{item.userName ?? `Người dùng #${item.userId}`}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[item.status] ?? "bg-white/10 text-white/50"}`}
                  >
                    {STATUS_LABEL[item.status] ?? item.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/45">
                  {item.bankName ?? "—"} · {item.accountNumber ?? "—"} · {item.accountName ?? "—"}
                </p>
                <p className="mt-0.5 text-[11px] text-white/35">
                  Tạo lúc {fmt(item.createdAt)}
                  {item.staffNote ? ` · Ghi chú: ${item.staffNote}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-lg font-bold text-[var(--luxora-gold-light)]">
                  {VND.format(item.amount)} ₫
                </span>
                {pending && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void act(item, "APPROVED")}
                      className="rounded-full bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300 hover:bg-green-500/20 disabled:opacity-50"
                    >
                      {busy ? "..." : "Duyệt"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void act(item, "REJECTED")}
                      className="rounded-full bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {loading && <p className="py-10 text-center text-sm text-white/40">Đang tải...</p>}
        {!loading && items.length === 0 && (
          <p className="py-10 text-center text-sm text-white/40">Không có yêu cầu nào.</p>
        )}
      </div>
    </div>
  );
}
