"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { adminApi, ApiError, type Withdrawal } from "@/lib/api";

const VND = new Intl.NumberFormat("vi-VN");

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-300",
  APPROVED: "bg-green-500/10 text-green-300",
  REJECTED: "bg-red-500/10 text-red-300",
};

const FILTERS = ["", "PENDING", "APPROVED", "REJECTED"] as const;

function fmt(date: string | null, locale: string) {
  return date
    ? new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(date))
    : "—";
}

export default function WithdrawalsClient() {
  const t = useTranslations("adminWithdrawalsPage");
  const locale = useLocale();
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
      setError(err instanceof ApiError ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load(filter);
    });
    return () => {
      cancelled = true;
    };
  }, [filter, load]);

  async function act(item: Withdrawal, status: "APPROVED" | "REJECTED") {
    let note = "";
    if (status === "REJECTED") {
      const input = window.prompt(t("rejectPrompt", { user: item.userName ?? `#${item.userId}` }), "");
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
          ? t("approvedNotice", { amount: VND.format(item.amount), user: item.userName ?? `#${item.userId}` })
          : t("rejectedNotice"),
      );
      void load(filter);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("updateError"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
        {t("badge")}
      </p>
      <h1 className="font-display-lg mt-2 text-3xl">{t("title")}</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f || "ALL"}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              filter === f
                ? "bg-[var(--luxora-gold)] text-black"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {f ? t(`status.${f}`) : t("all")}
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
                  <p className="font-semibold">{item.userName ?? t("userFallback", { id: item.userId })}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[item.status] ?? "bg-white/10 text-white/50"}`}
                  >
                    {item.status in STATUS_CLASS ? t(`status.${item.status}`) : item.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/45">
                  {item.bankName ?? "—"} · {item.accountNumber ?? "—"} · {item.accountName ?? "—"}
                </p>
                <p className="mt-0.5 text-[11px] text-white/35">
                  {t("createdAt", { date: fmt(item.createdAt, locale) })}
                  {item.staffNote ? ` · ${t("staffNote", { note: item.staffNote })}` : ""}
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
                      {busy ? "..." : t("approve")}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void act(item, "REJECTED")}
                      className="rounded-full bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {t("reject")}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {loading && <p className="py-10 text-center text-sm text-white/40">{t("loading")}</p>}
        {!loading && items.length === 0 && (
          <p className="py-10 text-center text-sm text-white/40">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
