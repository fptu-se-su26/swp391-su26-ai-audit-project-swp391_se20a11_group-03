"use client";

import { useCallback, useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useTranslations } from "next-intl";
import {
  API_BASE_URL,
  adminApi,
  ApiError,
  getToken,
  type FraudAlert,
  type FraudAlertFilters,
} from "@/lib/api";

const RISK_STYLE: Record<FraudAlert["riskLevel"], string> = {
  LOW: "bg-slate-400/10 text-slate-300",
  MEDIUM: "bg-amber-400/10 text-amber-300",
  HIGH: "bg-orange-500/10 text-orange-300",
  CRITICAL: "bg-red-500/15 text-red-300",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

export default function FraudAlertsClient() {
  const t = useTranslations("fraudAdmin.alerts");
  const [rows, setRows] = useState<FraudAlert[]>([]);
  const [filters, setFilters] = useState<FraudAlertFilters>({});
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState<string | null>(null);

  const load = useCallback(async (nextFilters: FraudAlertFilters = {}) => {
    setError(null);
    try {
      const response = await adminApi.fraudAlerts(nextFilters);
      setRows(response.data ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const socketUrl = `${API_BASE_URL.replace(/\/api\/?$/, "")}/ws/chat`;
    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/admin/fraud-alerts", (message) => {
          try {
            const payload = JSON.parse(message.body) as { alert?: FraudAlert };
            setLiveMessage(payload.alert
              ? t("liveAlert", { score: payload.alert.riskScore, userId: payload.alert.suspectedUserId })
              : t("liveAlertGeneric"));
            void load();
          } catch {
            void load();
          }
        });
      },
    });
    client.activate();
    return () => void client.deactivate();
  }, [load, t]);

  async function act(
    row: FraudAlert,
    action: "review" | "confirm" | "dismiss" | "restore",
  ) {
    if (action === "confirm" && !window.confirm(t("confirmBan"))) return;
    setActingId(row.id);
    setError(null);
    try {
      if (action === "review") await adminApi.reviewFraudAlert(row.id, note);
      if (action === "confirm") await adminApi.confirmFraudAlert(row.id, note);
      if (action === "dismiss") await adminApi.dismissFraudAlert(row.id, note);
      if (action === "restore") await adminApi.restoreFraudUser(row.id, note);
      setNote("");
      await load(filters);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setActingId(null);
    }
  }

  const open = (row: FraudAlert) => row.status === "PENDING" || row.status === "REVIEWING";
  const restricted = (row: FraudAlert) =>
    row.automaticAction === "TEMPORARY_BID_RESTRICTION"
    || row.automaticAction === "TEMPORARY_ACCOUNT_SUSPENSION";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">{t("badge")}</p>
      <h1 className="font-display-lg mt-2 text-3xl">{t("title")}</h1>
      <p className="mt-2 text-sm text-white/50">{t("subtitle")}</p>

      {liveMessage ? (
        <button
          type="button"
          onClick={() => setLiveMessage(null)}
          className="mt-5 flex w-full items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-left text-sm text-red-200"
        >
          <span className="material-symbols-outlined">notification_important</span>
          <span className="flex-1">{liveMessage}</span>
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);
          void load(filters);
        }}
        className="mt-6 flex flex-wrap items-end gap-3"
      >
        <FilterSelect
          label={t("status")}
          value={filters.status ?? ""}
          options={["PENDING", "REVIEWING", "CONFIRMED", "DISMISSED"]}
          onChange={(value) => setFilters((current) => ({ ...current, status: value }))}
        />
        <FilterSelect
          label={t("risk")}
          value={filters.riskLevel ?? ""}
          options={["MEDIUM", "HIGH", "CRITICAL"]}
          onChange={(value) => setFilters((current) => ({ ...current, riskLevel: value }))}
        />
        <input
          type="number"
          min="1"
          value={filters.auctionId ?? ""}
          onChange={(event) => setFilters((current) => ({
            ...current,
            auctionId: event.target.value ? Number(event.target.value) : undefined,
          }))}
          placeholder={t("auctionPlaceholder")}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-[var(--luxora-gold)]"
        />
        <button className="rounded-xl bg-[var(--luxora-gold)] px-5 py-2.5 text-sm font-semibold text-black">
          {t("filter")}
        </button>
      </form>

      {error ? <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null}

      <div className="mt-6 space-y-3">
        {loading ? <p className="py-10 text-center text-white/45">{t("loading")}</p> : null}
        {!loading && rows.length === 0 ? <p className="py-10 text-center text-white/45">{t("empty")}</p> : null}
        {rows.map((row) => (
          <article key={row.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setExpandedId((current) => current === row.id ? null : row.id)}
              className="grid w-full grid-cols-2 items-center gap-4 p-5 text-left md:grid-cols-[100px_100px_1fr_140px_130px_24px]"
            >
              <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${RISK_STYLE[row.riskLevel]}`}>
                {row.riskLevel}
              </span>
              <span className="text-lg font-bold">{row.riskScore}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{row.fraudType.replaceAll("_", " ")}</span>
                <span className="mt-1 block text-xs text-white/40">#{row.id} · {t("occurrences", { count: row.occurrenceCount })}</span>
              </span>
              <span className="text-xs text-white/60">{t("auctionUser", { auctionId: row.auctionId, userId: row.suspectedUserId })}</span>
              <span className="text-xs text-white/45">{formatDate(row.lastDetectedAt)}</span>
              <span className="material-symbols-outlined text-lg text-white/40">
                {expandedId === row.id ? "expand_less" : "expand_more"}
              </span>
            </button>

            {expandedId === row.id ? (
              <div className="border-t border-white/10 p-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/35">{t("signals")}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {row.signals.map((signal) => (
                        <span key={signal} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70">
                          {signal.replaceAll("_", " ")}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/60">{row.description}</p>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-xs">
                    <div><dt className="text-white/35">{t("status")}</dt><dd className="mt-1 font-semibold">{row.status}</dd></div>
                    <div><dt className="text-white/35">{t("automaticAction")}</dt><dd className="mt-1 font-semibold">{row.automaticAction}</dd></div>
                    <div><dt className="text-white/35">{t("firstDetected")}</dt><dd className="mt-1">{formatDate(row.firstDetectedAt)}</dd></div>
                    <div><dt className="text-white/35">{t("reviewedBy")}</dt><dd className="mt-1">{row.reviewedBy ?? "—"}</dd></div>
                  </dl>
                </div>

                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={1000}
                  rows={2}
                  placeholder={row.adminNote || t("notePlaceholder")}
                  className="mt-5 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)]"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {open(row) ? (
                    <>
                      <ActionButton disabled={actingId === row.id} onClick={() => void act(row, "review")}>{t("review")}</ActionButton>
                      <ActionButton disabled={actingId === row.id} onClick={() => void act(row, "dismiss")}>{t("dismiss")}</ActionButton>
                      <ActionButton danger disabled={actingId === row.id} onClick={() => void act(row, "confirm")}>{t("confirm")}</ActionButton>
                    </>
                  ) : null}
                  {restricted(row) && row.status !== "CONFIRMED" ? (
                    <ActionButton disabled={actingId === row.id} onClick={() => void act(row, "restore")}>{t("restore")}</ActionButton>
                  ) : null}
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs text-white/50">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 block rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm outline-none"
      >
        <option value="">All</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ActionButton({ children, danger = false, disabled, onClick }: {
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border px-4 py-2 text-xs font-semibold disabled:opacity-50 ${
        danger ? "border-red-400/30 bg-red-500/10 text-red-200" : "border-white/10 bg-white/5 text-white/75"
      }`}
    >
      {children}
    </button>
  );
}
