"use client";

import { useEffect, useState } from "react";
import CollectorShell from "@/components/shells/CollectorShell";
import {
  ApiError,
  productApi,
  sellerApi,
  type AdminEvent,
  type EventProduct,
  type EventProductApprovalStatus,
  type SellerProduct,
} from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

const statusLabel: Record<EventProductApprovalStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
};

const statusClass: Record<EventProductApprovalStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-300",
  APPROVED: "bg-green-500/10 text-green-300",
  REJECTED: "bg-red-500/10 text-red-300",
};

async function loadOpenEvents(): Promise<AdminEvent[]> {
  return (await sellerApi.openEvents()).data ?? [];
}

async function loadMyProducts(): Promise<SellerProduct[]> {
  return (await productApi.mine()).data ?? [];
}

export default function SellerEventsPage() {
  const { data: events, loading: loadingEvents } = useApiData(loadOpenEvents, []);
  const { data: myProducts, loading: loadingProducts } = useApiData(loadMyProducts, []);

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [submissions, setSubmissions] = useState<EventProduct[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const approvedProducts = myProducts.filter((p) => p.status.toUpperCase() === "APPROVED");

  useEffect(() => {
    if (selectedEventId == null) return;
    let cancelled = false;
    sellerApi
      .mySubmissions(selectedEventId)
      .then((response) => {
        if (!cancelled) setSubmissions(response.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setSubmissions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSubmissions(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedEventId]);

  function handleEventChange(value: string) {
    const eventId = value ? Number(value) : null;
    setSelectedEventId(eventId);
    setSubmissions([]);
    setLoadingSubmissions(eventId != null);
  }

  async function handleSubmit() {
    if (selectedEventId == null || !selectedProductId) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await sellerApi.submitExistingProductToEvent(
        selectedEventId,
        Number(selectedProductId),
      );
      setSubmissions((current) => [...current, response.data]);
      setSelectedProductId("");
      setMessage({ kind: "success", text: "Đã nộp sản phẩm, chờ admin duyệt." });
    } catch (cause) {
      setMessage({
        kind: "error",
        text: cause instanceof ApiError ? cause.message : "Không thể nộp sản phẩm",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWithdraw(eventProductId: number) {
    if (!window.confirm("Rút đơn nộp này?")) return;
    try {
      await sellerApi.withdrawSubmission(eventProductId);
      setSubmissions((current) => current.filter((s) => s.eventProductId !== eventProductId));
    } catch (cause) {
      setMessage({
        kind: "error",
        text: cause instanceof ApiError ? cause.message : "Không thể rút đơn",
      });
    }
  }

  return (
    <CollectorShell>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">Nộp sản phẩm vào sự kiện</h1>
        <p className="mt-2 text-sm text-white/55">
          Chọn một sự kiện đang mở và một sản phẩm đã được duyệt của bạn để nộp cho admin xét duyệt.
        </p>

        <div className="glass-panel mt-6 rounded-2xl p-6">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Sự kiện đang mở
            </span>
            <select
              value={selectedEventId ?? ""}
              onChange={(e) => handleEventChange(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-[var(--luxora-bg-soft)] px-4 text-sm text-white outline-none focus:border-[var(--luxora-gold)]"
            >
              <option value="">
                {loadingEvents ? "Đang tải..." : "Chọn sự kiện..."}
              </option>
              {events.map((ev) => (
                <option key={ev.eventId} value={ev.eventId}>
                  {ev.name}
                </option>
              ))}
            </select>
          </label>

          {selectedEventId != null && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="min-w-[240px] flex-1 h-12 rounded-xl border border-white/15 bg-[var(--luxora-bg-soft)] px-4 text-sm text-white outline-none focus:border-[var(--luxora-gold)]"
              >
                <option value="">
                  {loadingProducts
                    ? "Đang tải sản phẩm..."
                    : approvedProducts.length === 0
                      ? "Bạn chưa có sản phẩm đã duyệt"
                      : "Chọn sản phẩm của bạn..."}
                </option>
                {approvedProducts.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedProductId || submitting}
                onClick={() => void handleSubmit()}
                className="gradient-cta rounded-full px-5 py-3 text-sm font-semibold text-black disabled:opacity-50"
              >
                {submitting ? "Đang nộp..." : "Nộp sản phẩm"}
              </button>
            </div>
          )}

          {message && (
            <p
              className={`mt-3 text-sm ${message.kind === "success" ? "text-green-300" : "text-red-300"}`}
            >
              {message.text}
            </p>
          )}
        </div>

        {selectedEventId != null && (
          <div className="mt-8">
            <h2 className="font-headline-md text-lg">Đơn đã nộp cho sự kiện này</h2>
            <div className="mt-3 space-y-2">
              {loadingSubmissions && <p className="text-sm text-white/45">Đang tải...</p>}
              {!loadingSubmissions && submissions.length === 0 && (
                <p className="text-sm text-white/45">Bạn chưa nộp sản phẩm nào cho sự kiện này.</p>
              )}
              {submissions.map((s) => (
                <div
                  key={s.eventProductId}
                  className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-xl p-4"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      Sản phẩm #{s.productId} — {s.startingPrice?.toLocaleString("vi-VN")} ₫
                    </p>
                    {s.approvalStatus === "REJECTED" && s.rejectReason && (
                      <p className="mt-1 text-xs text-red-300">Lý do từ chối: {s.rejectReason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass[s.approvalStatus]}`}
                    >
                      {statusLabel[s.approvalStatus]}
                    </span>
                    {s.approvalStatus === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => void handleWithdraw(s.eventProductId)}
                        className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold hover:border-red-400 hover:text-red-300"
                      >
                        Rút đơn
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollectorShell>
  );
}
