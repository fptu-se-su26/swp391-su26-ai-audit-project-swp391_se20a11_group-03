"use client";

import { useCallback, useState, type FormEvent } from "react";
import {
  adminApi,
  ApiError,
  productApi,
  toImageSrc,
  type ReviewProduct,
} from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

type AuctionMode = "LIVE" | "TIMED";

type ApprovalForm = {
  auctionMode: AuctionMode;
  scheduledStartTime: string;
  durationHours: string;
};

const MIN_LEAD_MINUTES = 5;

function toDateTimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultStartTime() {
  const date = new Date(Date.now() + 15 * 60 * 1000);
  date.setSeconds(0, 0);
  return toDateTimeLocalValue(date);
}

function initialApprovalForm(item: ReviewProduct): ApprovalForm {
  const savedStart = item.scheduledStartTime ? new Date(item.scheduledStartTime) : null;
  const hasValidSavedStart =
    savedStart !== null &&
    !Number.isNaN(savedStart.getTime()) &&
    savedStart.getTime() > Date.now() + MIN_LEAD_MINUTES * 60 * 1000;
  const durationHours = item.scheduledDurationSeconds
    ? String(item.scheduledDurationSeconds / 3600)
    : "6";

  return {
    auctionMode: item.auctionMode === "LIVE" ? "LIVE" : "TIMED",
    scheduledStartTime: hasValidSavedStart
      ? toDateTimeLocalValue(savedStart)
      : defaultStartTime(),
    durationHours,
  };
}

async function loadPendingProducts(): Promise<ReviewProduct[]> {
  return (await adminApi.pendingProducts()).data;
}

export default function ApprovalsClient() {
  const { data: items, loading, error, reload } = useApiData(loadPendingProducts, []);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [approvalItem, setApprovalItem] = useState<ReviewProduct | null>(null);
  const [approvalForm, setApprovalForm] = useState<ApprovalForm | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [approvalMinimumStart, setApprovalMinimumStart] = useState("");
  const [detailItem, setDetailItem] = useState<ReviewProduct | null>(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);
  const [attributeNames, setAttributeNames] = useState<Record<number, string>>({});

  const openDetail = useCallback(async (item: ReviewProduct) => {
    setNotice(null);
    setDetailItem(item);
    const primaryImageIndex = item.images.findIndex((image) => image.isPrimary);
    setDetailImageIndex(primaryImageIndex >= 0 ? primaryImageIndex : 0);
    setAttributeNames({});

    try {
      const response = await productApi.categoryAttributes(item.categoryId);
      setAttributeNames(
        Object.fromEntries(
          response.data.map((attribute) => [
            attribute.attributeId,
            attribute.attributeName,
          ]),
        ),
      );
    } catch {
      // Chi tiết sản phẩm vẫn hiển thị được nếu danh mục không còn tồn tại.
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetailItem(null);
    setDetailImageIndex(0);
    setAttributeNames({});
  }, []);

  const openApproval = useCallback((item: ReviewProduct) => {
    setNotice(null);
    setDetailItem(null);
    setApprovalError(null);
    setApprovalItem(item);
    setApprovalForm(initialApprovalForm(item));
    setApprovalMinimumStart(
      toDateTimeLocalValue(new Date(Date.now() + MIN_LEAD_MINUTES * 60 * 1000)),
    );
  }, []);

  const closeApproval = useCallback(() => {
    setApprovalItem(null);
    setApprovalForm(null);
    setApprovalError(null);
    setApprovalMinimumStart("");
  }, []);

  const approve = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!approvalItem || !approvalForm) return;

      const startTime = new Date(approvalForm.scheduledStartTime);
      if (
        Number.isNaN(startTime.getTime()) ||
        startTime.getTime() <= Date.now() + MIN_LEAD_MINUTES * 60 * 1000
      ) {
        setApprovalError("Thời gian bắt đầu phải cách hiện tại ít nhất 5 phút.");
        return;
      }

      const durationHours = Number(approvalForm.durationHours);
      if (
        approvalForm.auctionMode === "TIMED" &&
        (!Number.isInteger(durationHours) || durationHours < 6 || durationHours > 12)
      ) {
        setApprovalError("Phiên đấu giá hẹn giờ phải kéo dài từ 6 đến 12 giờ.");
        return;
      }

      setNotice(null);
      setApprovalError(null);
      setBusyId(approvalItem.productId);
      try {
        await adminApi.approveProduct(approvalItem.productId, {
          auctionMode: approvalForm.auctionMode,
          scheduledStartTime: approvalForm.scheduledStartTime,
          scheduledDurationSeconds:
            approvalForm.auctionMode === "TIMED" ? durationHours * 3600 : null,
        });
        setNotice(`Đã duyệt "${approvalItem.productName}" và tạo lịch đấu giá.`);
        closeApproval();
        reload();
      } catch (err) {
        setApprovalError(
          err instanceof ApiError ? err.message : "Không thể duyệt sản phẩm.",
        );
      } finally {
        setBusyId(null);
      }
    },
    [approvalForm, approvalItem, closeApproval, reload],
  );

  const reject = useCallback(
    async (item: ReviewProduct) => {
      const reason = window.prompt(`Lý do từ chối "${item.productName}":`, "");
      if (reason === null) return;
      setNotice(null);
      setBusyId(item.productId);
      try {
        await adminApi.rejectProduct(item.productId, reason);
        setNotice(`Đã từ chối "${item.productName}".`);
        setDetailItem((current) =>
          current?.productId === item.productId ? null : current,
        );
        reload();
      } catch (err) {
        setNotice(err instanceof ApiError ? err.message : "Không thể từ chối sản phẩm.");
      } finally {
        setBusyId(null);
      }
    },
    [reload],
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="font-display-lg text-3xl">Bàn duyệt vật phẩm</h1>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Stat label="Chờ duyệt" value={items.length} color="text-yellow-300" />
        <Stat label="Có ảnh" value={items.filter((i) => i.images?.length).length} color="text-blue-300" />
        <Stat label="Chưa có ảnh" value={items.filter((i) => !i.images?.length).length} color="text-red-300" />
      </div>

      {notice && (
        <div className="mt-6 rounded-xl border border-[var(--luxora-gold)]/30 bg-[var(--luxora-gold)]/5 px-4 py-3 text-sm text-[var(--luxora-gold-light)]">
          {notice}
        </div>
      )}

      <h2 className="font-headline-md mb-4 mt-8 text-lg">Danh sách chờ xử lý</h2>
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const primary = item.images?.find((im) => im.isPrimary) ?? item.images?.[0];
          const busy = busyId === item.productId;
          return (
            <div key={item.productId} className="glass-card flex flex-wrap items-center gap-4 rounded-2xl p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={toImageSrc(primary?.imageUrl ?? null)} alt={item.productName} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-[200px] flex-1">
                <p className="text-[10px] text-white/40">
                  {item.categoryName} · {item.submittedAt ? new Intl.DateTimeFormat("vi-VN").format(new Date(item.submittedAt)) : "—"}
                </p>
                <p className="text-sm font-semibold">{item.productName}</p>
                <p className="text-xs text-white/40">Seller #{item.sellerId}</p>
              </div>
              <p className="font-semibold text-[var(--luxora-gold-light)]">
                {item.startingPrice.toLocaleString("vi-VN")} ₫
              </p>
              <div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void openDetail(item)}
                  className="rounded-full border border-[var(--luxora-gold)]/30 bg-[var(--luxora-gold)]/5 px-4 py-2 text-xs font-semibold text-[var(--luxora-gold-light)] hover:bg-[var(--luxora-gold)]/10 disabled:opacity-50"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          );
        })}
        {!loading && items.length === 0 && (
          <p className="py-12 text-center text-sm text-white/45">{error ?? "Không có sản phẩm chờ duyệt."}</p>
        )}
      </div>

      {detailItem && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-detail-title"
        >
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-[var(--luxora-bg-elevated)] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[var(--luxora-bg-elevated)] px-6 py-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-[10px] font-semibold text-yellow-300">
                    CHỜ DUYỆT
                  </span>
                  <span className="text-xs text-white/35">
                    Mã sản phẩm #{detailItem.productId}
                  </span>
                </div>
                <h2 id="product-detail-title" className="font-headline-md mt-2 text-2xl">
                  {detailItem.productName}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDetail}
                disabled={busyId === detailItem.productId}
                className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-40"
                aria-label="Đóng chi tiết sản phẩm"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid gap-8 p-6 lg:grid-cols-[1.05fr_0.95fr]">
              <section aria-label="Ảnh sản phẩm">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={toImageSrc(
                      detailItem.images?.[detailImageIndex]?.imageUrl ?? null,
                    )}
                    alt={`${detailItem.productName} - ảnh ${detailImageIndex + 1}`}
                    className="h-full w-full object-contain"
                  />
                </div>

                {detailItem.images.length > 1 && (
                  <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
                    {detailItem.images.map((image, index) => (
                      <button
                        key={image.imageId}
                        type="button"
                        onClick={() => setDetailImageIndex(index)}
                        className={`aspect-square overflow-hidden rounded-lg border bg-black/30 ${
                          detailImageIndex === index
                            ? "border-[var(--luxora-gold)]"
                            : "border-white/10 hover:border-white/30"
                        }`}
                        aria-label={`Xem ảnh ${index + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={toImageSrc(image.imageUrl)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <p className="mt-2 text-xs text-white/35">
                  {detailItem.images.length > 0
                    ? `${detailItem.images.length} ảnh do người bán cung cấp`
                    : "Người bán chưa cung cấp ảnh"}
                </p>
              </section>

              <section>
                <div className="rounded-2xl border border-[var(--luxora-gold)]/20 bg-[var(--luxora-gold)]/5 p-5">
                  <p className="text-xs text-white/45">Giá khởi điểm</p>
                  <p className="mt-1 text-3xl font-bold text-[var(--luxora-gold-light)]">
                    {detailItem.startingPrice.toLocaleString("vi-VN")} ₫
                  </p>
                  {detailItem.stepPrice !== null && (
                    <p className="mt-2 text-xs text-white/45">
                      Bước giá: {detailItem.stepPrice.toLocaleString("vi-VN")} ₫
                    </p>
                  )}
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 rounded-2xl border border-white/10 p-5 text-sm">
                  <DetailField label="Danh mục" value={detailItem.categoryName || "—"} />
                  <DetailField label="Người bán" value={`Seller #${detailItem.sellerId}`} />
                  <DetailField
                    label="Ngày gửi duyệt"
                    value={
                      detailItem.submittedAt
                        ? new Intl.DateTimeFormat("vi-VN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }).format(new Date(detailItem.submittedAt))
                        : "—"
                    }
                  />
                  <DetailField
                    label="Thuế"
                    value={
                      detailItem.taxPercent !== null
                        ? `${detailItem.taxPercent}%`
                        : "—"
                    }
                  />
                </dl>

                <div className="mt-5">
                  <h3 className="text-sm font-semibold">Mô tả sản phẩm</h3>
                  <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-6 text-white/65">
                    {detailItem.description?.trim() || "Người bán chưa cung cấp mô tả."}
                  </p>
                </div>

                {detailItem.attributes?.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-sm font-semibold">Thông số chi tiết</h3>
                    <dl className="mt-2 divide-y divide-white/10 rounded-2xl border border-white/10 px-4">
                      {detailItem.attributes.map((attribute) => (
                        <div
                          key={attribute.valueId}
                          className="grid grid-cols-[minmax(100px,0.8fr)_1.2fr] gap-4 py-3 text-sm"
                        >
                          <dt className="text-white/45">
                            {attributeNames[attribute.attributeId] ??
                              `Thuộc tính #${attribute.attributeId}`}
                          </dt>
                          <dd className="text-right text-white/80">
                            {attribute.attributeValue}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </section>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/10 bg-[var(--luxora-bg-elevated)] px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDetail}
                disabled={busyId === detailItem.productId}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-white/5 disabled:opacity-40"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => reject(detailItem)}
                disabled={busyId === detailItem.productId}
                className="rounded-full bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-40"
              >
                {busyId === detailItem.productId ? "Đang xử lý..." : "Từ chối"}
              </button>
              <button
                type="button"
                onClick={() => openApproval(detailItem)}
                disabled={busyId === detailItem.productId}
                className="rounded-full bg-green-500/15 px-5 py-2.5 text-sm font-semibold text-green-300 hover:bg-green-500/25 disabled:opacity-40"
              >
                Duyệt sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      {approvalItem && approvalForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approval-dialog-title"
        >
          <form
            onSubmit={approve}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[var(--luxora-bg-elevated)] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="approval-dialog-title" className="font-headline-md text-xl">
                  Lên lịch đấu giá
                </h2>
                <p className="mt-1 text-sm text-white/50">{approvalItem.productName}</p>
              </div>
              <button
                type="button"
                onClick={closeApproval}
                disabled={busyId === approvalItem.productId}
                className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-40"
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div>
                <label htmlFor="auction-mode" className="mb-1.5 block text-xs font-medium text-white/60">
                  Hình thức đấu giá
                </label>
                <select
                  id="auction-mode"
                  value={approvalForm.auctionMode}
                  onChange={(event) =>
                    setApprovalForm((current) =>
                      current
                        ? { ...current, auctionMode: event.target.value as AuctionMode }
                        : current,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)]"
                >
                  <option value="TIMED" className="bg-[var(--luxora-bg-elevated)]">
                    Hẹn giờ (TIMED)
                  </option>
                  <option value="LIVE" className="bg-[var(--luxora-bg-elevated)]">
                    Trực tiếp (LIVE)
                  </option>
                </select>
              </div>

              <div>
                <label htmlFor="auction-start" className="mb-1.5 block text-xs font-medium text-white/60">
                  Thời gian bắt đầu
                </label>
                <input
                  id="auction-start"
                  type="datetime-local"
                  required
                  min={approvalMinimumStart}
                  value={approvalForm.scheduledStartTime}
                  onChange={(event) =>
                    setApprovalForm((current) =>
                      current
                        ? { ...current, scheduledStartTime: event.target.value }
                        : current,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)]"
                />
                <p className="mt-1.5 text-[11px] text-white/35">
                  Thời gian bắt đầu phải cách hiện tại ít nhất 5 phút.
                </p>
              </div>

              {approvalForm.auctionMode === "TIMED" && (
                <div>
                  <label htmlFor="auction-duration" className="mb-1.5 block text-xs font-medium text-white/60">
                    Thời lượng (giờ)
                  </label>
                  <input
                    id="auction-duration"
                    type="number"
                    required
                    min={6}
                    max={12}
                    step={1}
                    value={approvalForm.durationHours}
                    onChange={(event) =>
                      setApprovalForm((current) =>
                        current ? { ...current, durationHours: event.target.value } : current,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)]"
                  />
                  <p className="mt-1.5 text-[11px] text-white/35">Từ 6 đến 12 giờ.</p>
                </div>
              )}
            </div>

            {approvalError && (
              <div
                className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                role="alert"
              >
                {approvalError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeApproval}
                disabled={busyId === approvalItem.productId}
                className="flex-1 rounded-full border border-white/15 py-2.5 text-sm font-semibold hover:bg-white/5 disabled:opacity-40"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={busyId === approvalItem.productId}
                className="flex-1 rounded-full bg-green-500/15 py-2.5 text-sm font-semibold text-green-300 hover:bg-green-500/25 disabled:opacity-40"
              >
                {busyId === approvalItem.productId ? "Đang duyệt..." : "Xác nhận duyệt"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <p className="text-xs text-white/40">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="mt-1 text-white/80">{value}</dd>
    </div>
  );
}
