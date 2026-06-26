"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import StaffShell from "@/components/layout/StaffShell";
import { apiClient } from "@/lib/apiClient";
import { useTranslations } from "@/i18n/I18nProvider";

type ProductImage = {
  imageId: number;
  imageUrl: string;
  isPrimary: boolean;
};

type ProductAttribute = {
  valueId: number;
  attributeId: number;
  attributeValue: string;
};

type Product = {
  productId: number;
  productName: string;
  description: string | null;
  categoryId: number | null;
  categoryName?: string | null;
  startingPrice: number;
  stepPrice?: number;
  taxPercent?: number;
  status: string;
  submittedAt: string;
  rejectionReason?: string | null;
  auctionMode?: string | null;
  scheduledStartTime?: string | null;
  scheduledDurationSeconds?: number | null;
  images: ProductImage[];
  attributes: ProductAttribute[];
};

type Status = "PENDING" | "APPROVED" | "REJECTED";

const STATUS_CFG: Record<Status, { labelKey: string; class: string }> = {
  PENDING: { labelKey: "statusPending", class: "bg-secondary-container text-on-secondary-container" },
  APPROVED: { labelKey: "statusApproved", class: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  REJECTED: { labelKey: "statusRejected", class: "bg-error-container text-on-error-container" },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h`;
  return `${Math.floor(seconds / 60)}m`;
}

const MIN_START_LEAD_MINUTES = 5;

function defaultApproveStartLocal(): string {
  const d = new Date(Date.now() + 10 * 60 * 1000);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

function minApproveStartLocal(): string {
  const d = new Date(Date.now() + MIN_START_LEAD_MINUTES * 60 * 1000);
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

type ApproveSchedule = {
  auctionMode: "LIVE" | "TIMED";
  scheduledStartTime: string;
  scheduledDurationHours: number;
};

function ApproveScheduleModal({
  product,
  onClose,
  onConfirm,
  processing,
  t,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: (schedule: ApproveSchedule) => void;
  processing: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const [auctionMode, setAuctionMode] = useState<"LIVE" | "TIMED">("TIMED");
  const [scheduledStartTime, setScheduledStartTime] = useState(defaultApproveStartLocal());
  const [scheduledDurationHours, setScheduledDurationHours] = useState(8);

  const startError = useMemo(() => {
    if (!scheduledStartTime) return t("approveModal.startTimeRequired");
    const picked = new Date(scheduledStartTime);
    if (Number.isNaN(picked.getTime())) return t("approveModal.startTimeInvalid");
    if (picked.getTime() < Date.now() + MIN_START_LEAD_MINUTES * 60 * 1000) {
      return t("approveModal.startTimeTooSoon", { minutes: MIN_START_LEAD_MINUTES });
    }
    return null;
  }, [scheduledStartTime, t]);

  const canConfirm = !processing && !startError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-variant bg-surface p-md">
          <h2 className="font-headline-md text-headline-md text-primary">{t("approveModal.title")}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-surface-variant">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>

        <div className="space-y-md p-lg">
          <p className="text-sm text-on-surface-variant">
            {t("approveModal.desc", { name: product.productName })}
          </p>

          <div className="space-y-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">{t("auctionMode")}</label>
            <div className="grid grid-cols-2 gap-sm">
              {(["LIVE", "TIMED"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAuctionMode(mode)}
                  className={`rounded-lg border px-md py-sm text-left transition-colors ${
                    auctionMode === mode
                      ? "border-primary bg-primary-container text-on-primary-container"
                      : "border-outline-variant bg-surface-container-low hover:border-primary"
                  }`}
                >
                  <span className="block font-label-md text-label-md">{mode}</span>
                  <span className="text-xs text-on-surface-variant">
                    {mode === "LIVE" ? t("approveModal.liveHint") : t("approveModal.timedHint")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">{t("scheduledStart")}</label>
            <input
              type="datetime-local"
              value={scheduledStartTime}
              min={minApproveStartLocal()}
              onChange={(e) => setScheduledStartTime(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-3 text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {startError && <p className="text-xs text-error">{startError}</p>}
          </div>

          {auctionMode === "TIMED" && (
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">{t("duration")}</label>
              <input
                type="number"
                min={6}
                max={12}
                value={scheduledDurationHours}
                onChange={(e) => setScheduledDurationHours(Number(e.target.value))}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-3 text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-on-surface-variant">{t("approveModal.durationHint")}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-sm border-t border-surface-variant bg-surface p-md">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant px-md py-sm font-label-md text-label-md text-on-surface hover:bg-surface-variant"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() =>
              onConfirm({
                auctionMode,
                scheduledStartTime: scheduledStartTime.slice(0, 16),
                scheduledDurationHours,
              })
            }
            className="rounded-lg bg-tertiary-fixed px-md py-sm font-label-md text-label-md text-on-tertiary-fixed-variant hover:opacity-90 disabled:opacity-50"
          >
            {processing ? "..." : t("approveModal.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductDetailModal({ product, onClose, t }: { product: Product; onClose: () => void; t: (key: string) => string }) {
  const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const otherImages = product.images?.filter((img) => img !== primaryImage) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-surface-variant p-md flex items-center justify-between z-10">
          <h2 className="font-headline-md text-headline-md text-primary">{t("modalTitle")}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>

        <div className="p-lg space-y-lg">
          {/* Images */}
          <div className="space-y-sm">
            <h3 className="font-label-md text-label-md text-on-surface-variant">{t("images")}</h3>
            {product.images && product.images.length > 0 ? (
              <div className="space-y-sm">
                {primaryImage && (
                  <div>
                    <p className="text-xs text-on-surface-variant mb-xs">{t("primaryImage")}</p>
                    <img
                      src={primaryImage.imageUrl}
                      alt={product.productName}
                      className="w-full max-h-64 object-contain rounded-xl bg-surface-variant"
                    />
                  </div>
                )}
                {otherImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-sm">
                    {otherImages.map((img) => (
                      <img
                        key={img.imageId}
                        src={img.imageUrl}
                        alt=""
                        className="w-full h-20 object-cover rounded-lg bg-surface-variant"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-32 rounded-xl bg-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">image_not_supported</span>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-md">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{t("productName")}</p>
                <p className="font-body-lg text-on-surface">{product.productName}</p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{t("category")}</p>
                <p className="font-body-md text-on-surface">{product.categoryName || "—"}</p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{t("startingPrice")}</p>
                <p className="font-headline-sm text-headline-sm text-primary font-bold">{formatCurrency(product.startingPrice)}</p>
              </div>
              {product.stepPrice !== undefined && product.stepPrice !== null && (
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{t("stepPrice")}</p>
                  <p className="font-body-md text-on-surface">{formatCurrency(product.stepPrice)}</p>
                </div>
              )}
              {product.taxPercent !== undefined && product.taxPercent !== null && (
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{t("tax")}</p>
                  <p className="font-body-md text-on-surface">{product.taxPercent}%</p>
                </div>
              )}
            </div>

            <div className="space-y-md">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{t("description")}</p>
                <p className="font-body-md text-on-surface whitespace-pre-wrap">{product.description || "—"}</p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{t("submittedAt")}</p>
                <p className="font-body-md text-on-surface">{formatDate(product.submittedAt)}</p>
              </div>
              {product.auctionMode && (
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{t("auctionMode")}</p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold uppercase mt-1 ${
                    product.auctionMode === "LIVE"
                      ? "bg-error-container text-on-error-container"
                      : "bg-secondary-container text-on-secondary-container"
                  }`}>
                    {product.auctionMode}
                  </span>
                </div>
              )}
              {product.scheduledStartTime && (
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{t("scheduledStart")}</p>
                  <p className="font-body-md text-on-surface">{formatDate(product.scheduledStartTime)}</p>
                </div>
              )}
              {product.scheduledDurationSeconds && (
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{t("duration")}</p>
                  <p className="font-body-md text-on-surface">{formatDuration(product.scheduledDurationSeconds)}</p>
                </div>
              )}
              {product.rejectionReason && (
                <div className="p-sm rounded-lg bg-error-container">
                  <p className="font-label-sm text-label-sm text-error font-bold">{t("rejectionReason")}</p>
                  <p className="font-body-sm text-on-error-container mt-xs">{product.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  const t = useTranslations("staffApprovals");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rejectNote, setRejectNote] = useState<Record<number, string>>({});
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [approvingProduct, setApprovingProduct] = useState<Product | null>(null);
  const [selectedTab, setSelectedTab] = useState<Status | "ALL">("PENDING");

  const fetchProducts = useCallback(async () => {
    try {
      const response = await apiClient<{ data: Product[] }>("/admin/products/pending");
      setProducts(response.data || []);
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateStatus = async (
    productId: number,
    newStatus: "APPROVED" | "REJECTED",
    note?: string,
    schedule?: ApproveSchedule,
  ) => {
    setProcessing(productId);
    try {
      let body: Record<string, unknown> = {};
      if (newStatus === "APPROVED" && schedule) {
        body = {
          auctionMode: schedule.auctionMode,
          scheduledStartTime: schedule.scheduledStartTime,
          scheduledDurationSeconds:
            schedule.auctionMode === "TIMED" ? schedule.scheduledDurationHours * 3600 : undefined,
        };
      } else if (newStatus === "REJECTED" && note) {
        body = { reason: note };
      }
      const endpoint = newStatus === "APPROVED"
        ? `/admin/products/${productId}/approve`
        : `/admin/products/${productId}/reject`;
      await apiClient(endpoint, {
        method: "POST",
        body,
      });
      await fetchProducts();
      setApprovingProduct(null);
    } catch {
      alert(t("updateError"));
    } finally {
      setProcessing(null);
      setRejectingId(null);
    }
  };

  const filteredProducts = selectedTab === "ALL" ? products : products.filter((p) => p.status === selectedTab);
  const pendingCount = products.filter((p) => p.status === "PENDING").length;
  const approvedCount = products.filter((p) => p.status === "APPROVED").length;
  const rejectedCount = products.filter((p) => p.status === "REJECTED").length;

  const tabs: { key: Status | "ALL"; label: string; count: number }[] = [
    { key: "PENDING", label: t("tabPending"), count: pendingCount },
    { key: "APPROVED", label: t("tabApproved"), count: approvedCount },
    { key: "REJECTED", label: t("tabRejected"), count: rejectedCount },
    { key: "ALL", label: t("tabAll"), count: products.length },
  ];

  if (loading) {
    return (
      <StaffShell>
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        </div>
      </StaffShell>
    );
  }

  if (error) {
    return (
      <StaffShell>
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          <div className="bg-error-container rounded-xl p-lg text-center">
            <p className="text-on-error-container">{error}</p>
          </div>
        </div>
      </StaffShell>
    );
  }

  return (
    <StaffShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{t("pageTitle")}</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-md">
          <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant text-center">
            <p className="font-headline-md text-[32px] font-bold text-primary">{pendingCount}</p>
            <p className="font-label-md text-label-md text-on-surface-variant mt-xs">{t("summaryAwaiting")}</p>
          </div>
          <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant text-center">
            <p className="font-headline-md text-[32px] font-bold text-primary">{products.length}</p>
            <p className="font-label-md text-label-md text-on-surface-variant mt-xs">{t("summaryTotal")}</p>
          </div>
          <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant text-center">
            <p className="font-headline-md text-[32px] font-bold text-primary">{approvedCount}</p>
            <p className="font-label-md text-label-md text-on-surface-variant mt-xs">{t("summaryApproved")}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-sm border-b border-surface-variant">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`px-md py-sm font-label-md text-label-md border-b-2 transition-colors ${
                selectedTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-xs px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedTab === tab.key ? "bg-primary text-on-primary" : "bg-surface-variant"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-lg text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-md block">check_circle</span>
              <p className="text-on-surface-variant">{t("noProducts")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-variant">
                    {[t("tableItemTitle"), t("tableCategory"), t("tableEstValue"), t("tableAuction"), t("tableSubmitted"), t("tableStatus"), t("tableActions")].map((h) => (
                      <th key={h} className="p-md font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((item) => {
                    const statusKey = item.status as Status;
                    const cfg = STATUS_CFG[statusKey] || { labelKey: item.status, class: "bg-surface-variant text-on-surface-variant" };
                    const isProcessing = processing === item.productId;
                    const isRejectingThis = rejectingId === item.productId;

                    return (
                      <tr key={item.productId} className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                        <td className="p-md">
                          <p className="font-label-md text-label-md text-on-surface line-clamp-1">{item.productName}</p>
                          {item.description && (
                            <p className="text-xs text-on-surface-variant mt-xs line-clamp-1">{item.description}</p>
                          )}
                          {item.status === "REJECTED" && item.rejectionReason && (
                            <p className="text-xs text-error mt-xs line-clamp-1">{t("reason")}: {item.rejectionReason}</p>
                          )}
                        </td>
                        <td className="p-md font-body-sm text-sm text-on-surface-variant">
                          {item.categoryName || "—"}
                        </td>
                        <td className="p-md font-bold text-primary whitespace-nowrap">{formatCurrency(item.startingPrice)}</td>
                        <td className="p-md">
                          {item.auctionMode ? (
                            <div className="text-xs">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  item.auctionMode === "LIVE"
                                    ? "bg-error-container text-on-error-container"
                                    : "bg-secondary-container text-on-secondary-container"
                                }`}
                              >
                                {item.auctionMode}
                              </span>
                              {item.scheduledStartTime && (
                                <p className="mt-1 text-on-surface-variant whitespace-nowrap">
                                  {formatDate(item.scheduledStartTime)}
                                </p>
                              )}
                              {item.scheduledDurationSeconds && (
                                <p className="text-on-surface-variant">{formatDuration(item.scheduledDurationSeconds)}</p>
                              )}
                            </div>
                          ) : item.status === "PENDING" ? (
                            <span className="text-xs italic text-on-surface-variant">{t("awaitingSchedule")}</span>
                          ) : (
                            <span className="text-xs text-on-surface-variant">—</span>
                          )}
                        </td>
                        <td className="p-md font-body-sm text-sm text-on-surface-variant whitespace-nowrap">
                          {formatDate(item.submittedAt)}
                        </td>
                        <td className="p-md">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.class}`}>
                            {t(cfg.labelKey)}
                          </span>
                        </td>
                        <td className="p-md">
                          {/* View Details — always visible */}
                          <button
                            onClick={() => setSelectedProduct(item)}
                            className="mb-xs flex w-full items-center gap-xs px-3 py-1.5 rounded-lg border border-outline-variant font-label-sm text-label-sm text-on-surface hover:bg-surface-variant transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            {t("viewDetails")}
                          </button>

                          {item.status === "PENDING" && !isRejectingThis && (
                            <div className="flex gap-xs">
                              <button
                                onClick={() => setApprovingProduct(item)}
                                disabled={isProcessing}
                                className="flex-1 px-2 py-1.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-[10px] uppercase font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
                              >
                                {isProcessing ? "..." : t("approve")}
                              </button>
                              <button
                                onClick={() => setRejectingId(item.productId)}
                                className="flex-1 px-2 py-1.5 rounded-lg bg-error-container text-on-error-container font-label-sm text-[10px] uppercase font-bold hover:opacity-80 transition-opacity"
                              >
                                {t("reject")}
                              </button>
                            </div>
                          )}

                          {item.status === "PENDING" && isRejectingThis && (
                            <div className="space-y-xs">
                              <textarea
                                value={rejectNote[item.productId] || ""}
                                onChange={(e) => setRejectNote({ ...rejectNote, [item.productId]: e.target.value })}
                                placeholder={t("rejectionPlaceholder")}
                                className="w-full p-xs rounded-lg border border-error bg-surface-variant text-on-surface text-xs resize-none"
                                rows={2}
                              />
                              <div className="flex gap-xs">
                                <button
                                  onClick={() => updateStatus(item.productId, "REJECTED", rejectNote[item.productId])}
                                  disabled={isProcessing}
                                  className="flex-1 px-2 py-1 rounded bg-error text-on-error font-label-sm text-[10px] font-bold disabled:opacity-50"
                                >
                                  {isProcessing ? "..." : t("confirmReject")}
                                </button>
                                <button
                                  onClick={() => { setRejectingId(null); setRejectNote({ ...rejectNote, [item.productId]: "" }); }}
                                  className="flex-1 px-2 py-1 rounded border border-outline-variant font-label-sm text-[10px] text-on-surface"
                                >
                                  {t("cancel")}
                                </button>
                              </div>
                            </div>
                          )}

                          {item.status === "APPROVED" && (
                            <span className="flex items-center gap-xs text-xs text-tertiary font-medium">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              {t("approvedLabel")}
                            </span>
                          )}

                          {item.status === "REJECTED" && (
                            <span className="flex items-center gap-xs text-xs text-error font-medium">
                              <span className="material-symbols-outlined text-[16px]">cancel</span>
                              {t("rejectedLabel")}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} t={t} />
      )}

      {approvingProduct && (
        <ApproveScheduleModal
          product={approvingProduct}
          onClose={() => setApprovingProduct(null)}
          onConfirm={(schedule) => updateStatus(approvingProduct.productId, "APPROVED", undefined, schedule)}
          processing={processing === approvingProduct.productId}
          t={t}
        />
      )}
    </StaffShell>
  );
}
