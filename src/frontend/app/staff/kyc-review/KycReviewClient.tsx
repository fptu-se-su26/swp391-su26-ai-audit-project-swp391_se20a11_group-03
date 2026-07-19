"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { adminApi, ApiError, kycApi, type KycReview } from "@/lib/api";

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-300",
  APPROVED: "bg-green-500/10 text-green-300",
  REJECTED: "bg-red-500/10 text-red-300",
  INFO_REQUIRED: "bg-blue-500/10 text-blue-300",
};

const SEVERITY_CLASS: Record<string, string> = {
  HIGH: "text-red-300",
  MEDIUM: "text-yellow-300",
  LOW: "text-white/50",
};

function fmt(date: string | null, locale: string) {
  return date ? new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(date)) : "—";
}

export default function KycReviewClient() {
  const t = useTranslations("staffKycReviewPage");
  const locale = useLocale();
  const [items, setItems] = useState<KycReview[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await adminApi.kycList("PENDING");
      setItems(list);
      setSelectedId((prev) => (prev && list.some((k) => k.kycId === prev) ? prev : list[0]?.kycId ?? null));
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

  const current = items.find((k) => k.kycId === selectedId) ?? null;

  async function act(kind: "approve" | "reject" | "info") {
    if (!current) return;
    if ((kind === "reject" || kind === "info") && !note.trim()) {
      setError(t("noteRequired"));
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (kind === "approve") await adminApi.approveKyc(current.kycId);
      else if (kind === "reject") await adminApi.rejectKyc(current.kycId, note.trim());
      else await adminApi.requestInfoKyc(current.kycId, note.trim());
      setNotice(
        kind === "approve"
          ? t("approveNotice", { name: current.fullName ?? current.email ?? `KYC #${current.kycId}` })
          : kind === "reject"
            ? t("rejectNotice")
            : t("infoNotice"),
      );
      setNote("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("actionError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="m-4 flex h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-white/10">
      {/* Queue */}
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-white/10">
        <div className="border-b border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            {t("queueTitle", { count: items.length })}
          </p>
        </div>
        {loading && <p className="p-4 text-sm text-white/40">{t("loading")}</p>}
        {!loading && items.length === 0 && (
          <p className="p-4 text-sm text-white/40">{t("emptyQueue")}</p>
        )}
        {items.map((s) => (
          <button
            key={s.kycId}
            type="button"
            onClick={() => {
              setSelectedId(s.kycId);
              setNote("");
              setError(null);
              setNotice(null);
            }}
            className={`flex w-full flex-col gap-1 border-b border-white/5 px-4 py-3 text-left transition-colors ${
              selectedId === s.kycId ? "bg-white/5" : "hover:bg-white/[0.03]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">{s.fullName ?? s.email ?? `KYC #${s.kycId}`}</p>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[s.status] ?? "bg-white/10 text-white/50"}`}>
                {s.status}
              </span>
            </div>
            <p className="text-[11px] text-white/40">{fmt(s.submittedAt, locale)}</p>
          </button>
        ))}
      </aside>

      {/* Detail */}
      <div className="flex flex-1 flex-col overflow-y-auto p-6">
        {!current ? (
          <div className="flex flex-1 items-center justify-center text-sm text-white/40">
            {error ?? t("chooseProfile")}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
              <div>
                <p className="text-lg font-semibold">{current.fullName ?? "—"}</p>
                <p className="text-sm text-white/40">{current.email} · {fmt(current.submittedAt, locale)}</p>
              </div>
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_CLASS[current.status] ?? "bg-white/10 text-white/50"}`}>
                {current.status}
              </span>
            </div>

            {current.cccdDuplicate && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {t("duplicateWarning")}
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Info label={t("identityNumber")} value={current.cccdNumber} />
              <Info label={t("phone")} value={current.phone} />
              <Info label={t("dob")} value={current.dob} />
              <Info label={t("gender")} value={current.gender} />
              <Info label={t("issueDate")} value={current.issueDate} />
              <Info label={t("issuePlace")} value={current.issuePlace} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <DocCard title={t("frontDoc")} kycId={current.kycId} which="front" exists={!!current.frontImageUrl} analysis={current.frontImageAnalysis} />
              <DocCard title={t("backDoc")} kycId={current.kycId} which="back" exists={!!current.backImageUrl} analysis={current.backImageAnalysis} />
              <DocCard title={t("selfieDoc")} kycId={current.kycId} which="selfie" exists={!!current.selfieImageUrl} analysis={current.selfieImageAnalysis} />
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-xs font-medium text-white/50">
                {t("noteLabel")}
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("notePlaceholder")}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
              />
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
            )}
            {notice && (
              <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">{notice}</div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" disabled={busy} onClick={() => act("approve")}
                className="rounded-full bg-green-500/10 px-5 py-2.5 text-sm font-semibold text-green-300 hover:bg-green-500/20 disabled:opacity-50">
                {busy ? "..." : t("approve")}
              </button>
              <button type="button" disabled={busy} onClick={() => act("info")}
                className="rounded-full bg-blue-500/10 px-5 py-2.5 text-sm font-semibold text-blue-300 hover:bg-blue-500/20 disabled:opacity-50">
                {t("requestInfo")}
              </button>
              <button type="button" disabled={busy} onClick={() => act("reject")}
                className="rounded-full bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50">
                {t("reject")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="glass-panel rounded-xl px-4 py-3">
      <p className="text-[11px] text-white/40">{label}</p>
      <p className="mt-0.5 text-sm">{value || "—"}</p>
    </div>
  );
}

function DocCard({
  title,
  kycId,
  which,
  exists,
  analysis,
}: {
  title: string;
  kycId: number;
  which: "front" | "back" | "selfie";
  exists: boolean;
  analysis?: { riskScore: number; severity: string; signals: Array<{ severity: string; message: string }> } | null;
}) {
  const t = useTranslations("staffKycReviewPage");
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!exists) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    kycApi
      .imageBlob(kycId, which)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [kycId, which, exists]);

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        {analysis && (
          <span className={`text-[11px] font-semibold ${SEVERITY_CLASS[analysis.severity] ?? "text-white/50"}`}>
            {t("risk", { score: analysis.riskScore })}
          </span>
        )}
      </div>
      {exists && src ? (
        <a href={src} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={title} className="h-36 w-full rounded-xl object-cover" />
        </a>
      ) : (
        <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-white/30">
          {!exists ? t("noImage") : failed ? t("imageError") : t("imageLoading")}
        </div>
      )}
      {analysis?.signals?.length ? (
        <ul className="mt-2 space-y-1">
          {analysis.signals.slice(0, 3).map((sig, i) => (
            <li key={i} className={`text-[11px] ${SEVERITY_CLASS[sig.severity] ?? "text-white/50"}`}>
              • {sig.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
