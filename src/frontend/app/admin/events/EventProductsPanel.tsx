"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  adminApi,
  productApi,
  type AvailableProductForEvent,
  type EventProduct,
  type EventProductApprovalStatus,
} from "@/lib/api";

const statusBadge: Record<EventProductApprovalStatus, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  APPROVED: "bg-green-500/15 text-green-700 border-green-500/30",
  REJECTED: "bg-red-500/15 text-red-700 border-red-500/30",
};

const statusLabel: Record<EventProductApprovalStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
};

function formatVnd(value: number | null) {
  return value == null ? "—" : `${value.toLocaleString("vi-VN")} ₫`;
}

export default function EventProductsPanel({ eventId }: { eventId: number }) {
  const [products, setProducts] = useState<EventProduct[]>([]);
  const [available, setAvailable] = useState<AvailableProductForEvent[]>([]);
  const [productNames, setProductNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerProductId, setPickerProductId] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([adminApi.eventProducts(eventId), adminApi.availableProducts()])
      .then(([productsRes, availableRes]) => {
        if (cancelled) return;
        setProducts(productsRes.data ?? []);
        setAvailable(availableRes.data ?? []);
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(cause instanceof ApiError ? cause.message : "Không thể tải sản phẩm sự kiện");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // Resolve a display name for products already in the event (the assignment
  // endpoint doesn't return productName, only productId), one lookup per
  // distinct id, cached locally so re-renders don't refetch.
  useEffect(() => {
    const missingIds = products
      .map((p) => p.productId)
      .filter((id): id is number => id != null && productNames[id] === undefined);
    if (missingIds.length === 0) return;
    let cancelled = false;
    Promise.all(
      missingIds.map((id) =>
        productApi
          .detail(id)
          .then((detail) => [id, detail.productName] as const)
          .catch(() => [id, `Sản phẩm #${id}`] as const),
      ),
    ).then((pairs) => {
      if (cancelled) return;
      setProductNames((current) => {
        const next = { ...current };
        for (const [id, name] of pairs) next[id] = name;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  async function handleAdd() {
    if (!pickerProductId) return;
    setAdding(true);
    setError(null);
    try {
      const productId = Number(pickerProductId);
      const picked = available.find((p) => p.productId === productId);
      const response = await adminApi.assignExistingProductToEvent(eventId, productId);
      setProducts((current) => [...current, response.data]);
      setAvailable((current) => current.filter((p) => p.productId !== productId));
      if (picked) {
        setProductNames((current) => ({ ...current, [productId]: picked.productName }));
      }
      setPickerProductId("");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Không thể thêm sản phẩm vào sự kiện");
    } finally {
      setAdding(false);
    }
  }

  async function handleApprove(eventProductId: number) {
    setBusyId(eventProductId);
    setError(null);
    try {
      const response = await adminApi.approveEventProduct(eventProductId);
      setProducts((current) =>
        current.map((p) => (p.eventProductId === eventProductId ? response.data : p)),
      );
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Không thể duyệt sản phẩm");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(eventProductId: number) {
    if (!rejectReason.trim()) return;
    setBusyId(eventProductId);
    setError(null);
    try {
      const response = await adminApi.rejectEventProduct(eventProductId, rejectReason.trim());
      setProducts((current) =>
        current.map((p) => (p.eventProductId === eventProductId ? response.data : p)),
      );
      setRejectingId(null);
      setRejectReason("");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Không thể từ chối sản phẩm");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(eventProductId: number) {
    if (!window.confirm("Gỡ sản phẩm này khỏi sự kiện?")) return;
    setBusyId(eventProductId);
    setError(null);
    try {
      await adminApi.removeEventProduct(eventProductId);
      setProducts((current) => current.filter((p) => p.eventProductId !== eventProductId));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Không thể gỡ sản phẩm");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="md:col-span-2 rounded-2xl border border-[#ddd4c8] bg-[#fcfaf6] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57a2a]">
        Sản phẩm trong sự kiện
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={pickerProductId}
          onChange={(event) => setPickerProductId(event.target.value)}
          className="min-w-[240px] flex-1 rounded-xl border border-[#d8d0c4] bg-white px-3 py-2 text-sm text-[#1f1a14] outline-none focus:border-[#d4aa61]"
        >
          <option value="">
            {available.length === 0 ? "Không còn sản phẩm khả dụng" : "Chọn sản phẩm có sẵn để thêm..."}
          </option>
          {available.map((p) => (
            <option key={p.productId} value={p.productId}>
              {p.productName} ({formatVnd(p.startingPrice)})
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!pickerProductId || adding}
          onClick={() => void handleAdd()}
          className="rounded-full bg-[#f0c982] px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
        >
          {adding ? "Đang thêm..." : "Thêm"}
        </button>
      </div>
      <p className="mt-2 text-xs text-[#7b7268]">
        Có thể bấm "Thêm" nhiều lần để đưa nhiều sản phẩm của hệ thống/seller vào sự kiện này.
      </p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 space-y-2">
        {loading && <p className="text-sm text-[#7b7268]">Đang tải sản phẩm...</p>}
        {!loading && products.length === 0 && (
          <p className="text-sm text-[#7b7268]">Sự kiện này chưa có sản phẩm nào.</p>
        )}
        {products.map((p) => (
          <div
            key={p.eventProductId}
            className="rounded-xl border border-[#e3dbcf] bg-white p-3 text-sm text-[#1f1a14]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {p.productId != null ? productNames[p.productId] ?? `Sản phẩm #${p.productId}` : "—"}
                </p>
                <p className="text-xs text-[#7b7268]">
                  Giá khởi điểm: {formatVnd(p.startingPrice)} · Hiện tại: {formatVnd(p.currentPrice)}
                </p>
                {p.approvalStatus === "REJECTED" && p.rejectReason && (
                  <p className="mt-1 text-xs text-red-600">Lý do từ chối: {p.rejectReason}</p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadge[p.approvalStatus]}`}
              >
                {statusLabel[p.approvalStatus]}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {p.approvalStatus === "PENDING" && (
                <>
                  <button
                    type="button"
                    disabled={busyId === p.eventProductId}
                    onClick={() => void handleApprove(p.eventProductId)}
                    className="rounded-full border border-green-600/30 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-500/10 disabled:opacity-40"
                  >
                    Duyệt
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRejectingId(rejectingId === p.eventProductId ? null : p.eventProductId)
                    }
                    className="rounded-full border border-red-600/30 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-500/10"
                  >
                    Từ chối
                  </button>
                </>
              )}
              {(p.approvalStatus === "PENDING" || p.approvalStatus === "APPROVED") &&
                p.sessionStatus === "SCHEDULED" && (
                  <button
                    type="button"
                    disabled={busyId === p.eventProductId}
                    onClick={() => void handleRemove(p.eventProductId)}
                    className="rounded-full border border-[#d8d0c4] px-3 py-1 text-xs font-semibold text-[#534a3f] hover:border-red-400 hover:text-red-600 disabled:opacity-40"
                  >
                    Xóa
                  </button>
                )}
            </div>

            {rejectingId === p.eventProductId && (
              <div className="mt-2 flex flex-col gap-2">
                <textarea
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  className="min-h-16 w-full rounded-xl border border-[#d8d0c4] bg-white px-3 py-2 text-sm outline-none focus:border-[#d4aa61]"
                />
                <button
                  type="button"
                  disabled={!rejectReason.trim() || busyId === p.eventProductId}
                  onClick={() => void handleReject(p.eventProductId)}
                  className="self-start rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                >
                  Xác nhận từ chối
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
