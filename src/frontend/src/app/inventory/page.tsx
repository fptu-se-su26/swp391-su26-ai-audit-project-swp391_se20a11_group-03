"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CollectorShell from "@/components/layout/CollectorShell";
import {
  searchProducts,
  ProductSummary,
  deleteProduct,
  updateProduct,
  getProductDetail,
  ProductDetail,
  getMyProducts,
} from "@/lib/services/productService";
import { computeEffectiveAuctionStatus } from "@/lib/productPresentation";
import { useTranslations } from "@/i18n/I18nProvider";

type Tab = "pending" | "active" | "upcoming" | "ended";

const AUCTION_STATUS_CONFIG: Record<string, { label: string; class: string; icon: string }> = {
  ACTIVE: { label: "Đang đấu giá", class: "bg-error-container text-on-error-container", icon: "gavel" },
  UPCOMING: { label: "Sắp đấu giá", class: "bg-secondary-container text-on-secondary-container", icon: "schedule" },
  ENDED: { label: "Đã kết thúc", class: "bg-surface-variant text-on-surface-variant", icon: "check_circle" },
};

const PRODUCT_STATUS_CLASS_MAP: Record<string, string> = {
  PENDING: "bg-secondary-container text-on-secondary-container",
  ACTIVE: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  APPROVED: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  REJECTED: "bg-error-container text-on-error-container",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

// Map product to a tab based on status + auction state
function getProductTab(p: ProductSummary): Tab {
  if (p.status === "PENDING") return "pending";
  if (p.status === "REJECTED") return "pending";

  // APPROVED — need auction state
  const effStatus = computeEffectiveAuctionStatus(
    p.auctionStatus,
    p.auctionStartTime,
    p.auctionEndTime
  );
  if (effStatus === "ACTIVE") return "active";
  if (effStatus === "UPCOMING") return "upcoming";
  return "ended";
}

interface EditProductModalProps {
  product: ProductDetail;
  onClose: () => void;
  onSaved: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

function EditProductModal({ product, onClose, onSaved, t }: EditProductModalProps) {
  const [form, setForm] = useState({
    productName: product.productName,
    description: product.description || "",
    startingPrice: product.startingPrice,
    auctionMode: "TIMED",
    scheduledStartTime: "",
    scheduledDurationHours: 8,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize start time + duration from product data
  useEffect(() => {
    const startTime = product.scheduledStartTime || product.auction?.startTime;
    if (startTime) {
      const d = new Date(startTime);
      const tz = d.getTimezoneOffset() * 60_000;
      setForm((f) => ({ ...f, scheduledStartTime: new Date(d.getTime() - tz).toISOString().slice(0, 16) }));
    }
    if (product.scheduledDurationSeconds) {
      setForm((f) => ({ ...f, scheduledDurationHours: Math.round(product.scheduledDurationSeconds! / 3600) }));
    }
    // We don't currently fetch auctionMode from detail. Default to TIMED.
  }, [product]);

  const minStartTime = useMemo(() => {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    const tz = d.getTimezoneOffset() * 60_000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 16);
  }, []);

  const startError = useMemo(() => {
    if (!form.scheduledStartTime) return null;
    const d = new Date(form.scheduledStartTime);
    if (Number.isNaN(d.getTime())) return t("validation.invalidTime");
    if (d.getTime() < Date.now() + 5 * 60 * 1000) return t("validation.mustBeAtLeastMinutes", { minutes: 5 });
    return null;
  }, [form.scheduledStartTime, t]);

  const canSave =
    form.productName.trim() !== "" &&
    form.description.trim() !== "" &&
    form.startingPrice > 0 &&
    !saving &&
    !startError;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const scheduledLocal = form.scheduledStartTime.slice(0, 16);
      const durationSeconds = form.auctionMode === "TIMED" ? form.scheduledDurationHours * 3600 : undefined;
      await updateProduct(product.productId, {
        productName: form.productName.trim(),
        description: form.description.trim(),
        startingPrice: form.startingPrice,
        auctionMode: form.auctionMode,
        scheduledStartTime: scheduledLocal,
        scheduledDurationSeconds: durationSeconds,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("editModal.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface border-b border-surface-variant p-md flex items-center justify-between z-10">
          <h2 className="font-headline-md text-headline-md text-primary">{t("editModal.title")}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>

        <div className="p-lg space-y-md">
          {error && (
            <div className="rounded-md border border-error/30 bg-error-container/25 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <div className="space-y-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">{t("editModal.productName")}</label>
            <input
              type="text"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
            />
          </div>

          <div className="space-y-xs">
            <label className="font-label-md text-label-md text-on-surface-variant">{t("editModal.description")}</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">{t("editModal.startingPriceVnd")}</label>
              <input
                type="number"
                min={0}
                value={form.startingPrice}
                onChange={(e) => setForm({ ...form, startingPrice: Number(e.target.value) })}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">{t("editModal.auctionMode")}</label>
              <select
                value={form.auctionMode}
                onChange={(e) => setForm({ ...form, auctionMode: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none appearance-none"
              >
                <option value="TIMED">{t("editModal.timedOption")}</option>
                <option value="LIVE">{t("editModal.liveOption")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface-variant">{t("editModal.startTime")}</label>
              <input
                type="datetime-local"
                value={form.scheduledStartTime}
                min={minStartTime}
                onChange={(e) => setForm({ ...form, scheduledStartTime: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
              />
              {startError && (
                <p className="text-xs text-error">{startError}</p>
              )}
            </div>
            {form.auctionMode === "TIMED" && (
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">{t("editModal.durationHours")}</label>
                <input
                  type="number"
                  min={6}
                  max={12}
                  value={form.scheduledDurationHours}
                  onChange={(e) => setForm({ ...form, scheduledDurationHours: Number(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                />
              </div>
            )}
          </div>

          <div className="rounded-md bg-secondary-container p-sm text-sm text-on-secondary-container">
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">info</span>
            {t("editModal.warningNote")}
          </div>
        </div>

        <div className="sticky bottom-0 bg-surface border-t border-surface-variant p-md flex gap-sm justify-end">
          <button
            onClick={onClose}
            className="px-md py-sm rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface hover:bg-surface-variant transition-colors"
          >
            {t("editModal.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-md py-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-xs"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                {t("editModal.saving")}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                {t("editModal.save")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const statusLabels = useMemo<Record<string, string>>(() => ({
    PENDING: t("status.pending"),
    ACTIVE: t("status.active"),
    APPROVED: t("status.approved"),
    REJECTED: t("status.rejected"),
  }), [t]);

  const statusClassMap = useMemo(() => ({
    PENDING: "bg-secondary-container text-on-secondary-container",
    ACTIVE: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    APPROVED: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    REJECTED: "bg-error-container text-on-error-container",
  }), []);

  const fetchProducts = async () => {
    try {
      const response = await getMyProducts();
      console.log("getMyProducts response:", response);
      setProducts(response.data ?? []);
    } catch (err) {
      console.error("getMyProducts error:", err);
      setError(err instanceof Error ? err.message : t("errors.loadProducts"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: number) => {
    if (!confirm(t("confirmDelete"))) {
      return;
    }
    setDeletingId(productId);
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch {
      alert(t("deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = async (productId: number) => {
    setEditLoading(true);
    try {
      const detail = await getProductDetail(productId);
      setEditingProduct(detail);
    } catch {
      alert(t("loadDetailFailed"));
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSaved = () => {
    setEditingProduct(null);
    fetchProducts();
  };

  const pendingItems = products.filter((p) => p.status === "PENDING" || p.status === "REJECTED");
  const activeItems = products.filter((p) => getProductTab(p) === "active");
  const upcomingItems = products.filter((p) => getProductTab(p) === "upcoming");
  const endedItems = products.filter((p) => getProductTab(p) === "ended");

  const tabs: { key: Tab; label: string; count: number; icon: string }[] = [
    { key: "pending", label: t("tabs.pending"), count: pendingItems.length, icon: "hourglass_empty" },
    { key: "active", label: t("tabs.active"), count: activeItems.length, icon: "gavel" },
    { key: "upcoming", label: t("tabs.upcoming"), count: upcomingItems.length, icon: "schedule" },
    { key: "ended", label: t("tabs.ended"), count: endedItems.length, icon: "check_circle" },
  ];

  const currentItems =
    activeTab === "pending" ? pendingItems :
    activeTab === "active" ? activeItems :
    activeTab === "upcoming" ? upcomingItems :
    endedItems;

  if (loading) {
    return (
      <CollectorShell>
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        </div>
      </CollectorShell>
    );
  }

  if (error) {
    return (
      <CollectorShell>
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          <div className="bg-error-container rounded-xl p-lg text-center">
            <span className="material-symbols-outlined text-4xl text-on-error-container mb-md">error</span>
            <p className="text-on-error-container">{error}</p>
          </div>
        </div>
      </CollectorShell>
    );
  }

  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{t("pageTitle")}</h1>
            <p className="font-body-lg text-on-surface-variant mt-xs">{t("pageSubtitle")}</p>
          </div>
          <Link
            href="/post-item"
            className="bg-secondary text-on-secondary font-label-md text-label-md px-md py-sm rounded-lg flex items-center gap-xs hover:bg-secondary-fixed-dim transition-colors glow-accent"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {t("postNewItem")}
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-xs border-b border-surface-variant overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-md py-sm font-label-md text-label-md border-b-2 transition-colors flex items-center gap-xs whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
              <span className={`ml-1 min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-bold ${
                activeTab === tab.key ? "bg-primary text-on-primary" : "bg-surface-variant text-on-surface-variant"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <section>
          {currentItems.length === 0 ? (
            <div className="bg-surface rounded-xl p-lg text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-md block">
                {tabs.find((t) => t.key === activeTab)?.icon}
              </span>
              <p className="text-on-surface-variant">
                {activeTab === "pending"
                  ? t("empty.pending")
                  : activeTab === "active"
                  ? t("empty.active")
                  : activeTab === "upcoming"
                  ? t("empty.upcoming")
                  : t("empty.ended")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
              {currentItems.map((item) => {
                const statusCfg = {
                  label: statusLabels[item.status] || item.status,
                  class: PRODUCT_STATUS_CLASS_MAP[item.status] || "bg-surface-variant text-on-surface-variant",
                };
                const auctionState = computeEffectiveAuctionStatus(
                  item.auctionStatus,
                  item.auctionStartTime,
                  item.auctionEndTime
                );
                const auctionCfg = AUCTION_STATUS_CONFIG[auctionState];
                return (
                  <div key={item.productId} className="bg-surface rounded-xl overflow-hidden soft-shadow border border-surface-variant">
                    <div className="relative h-48 overflow-hidden bg-surface-variant">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant">image</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                        {item.status === "PENDING" && (
                          <span className={`px-2 py-1 rounded-full font-label-sm text-[10px] font-bold uppercase ${statusCfg.class}`}>
                            {statusCfg.label}
                          </span>
                        )}
                        {item.status === "REJECTED" && (
                          <span className={`px-2 py-1 rounded-full font-label-sm text-[10px] font-bold uppercase ${statusCfg.class}`}>
                            {statusCfg.label}
                          </span>
                        )}
                        {item.status === "APPROVED" && auctionCfg && (
                          <span className={`px-2 py-1 rounded-full font-label-sm text-[10px] font-bold uppercase ${auctionCfg.class} flex items-center gap-1`}>
                            <span className="material-symbols-outlined text-[10px]">{auctionCfg.icon}</span>
                            {auctionCfg.label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-md">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                        {item.categoryName || t("fields.uncategorized")}
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-primary mt-1 mb-sm line-clamp-2">
                        {item.productName}
                      </h3>
                      {item.status === "APPROVED" && (auctionState === "ACTIVE" || auctionState === "UPCOMING") && (
                        <p className="text-xs text-on-surface-variant mb-sm">
                          {auctionState === "ACTIVE" ? t("fields.ends") : t("fields.starts")}: {formatDateTime(auctionState === "ACTIVE" ? item.auctionEndTime : item.auctionStartTime)}
                        </p>
                      )}
                      <div className="flex justify-between items-center mb-md">
                        <div>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">{t("fields.startingPrice")}</p>
                          <p className="font-headline-sm text-headline-sm text-primary font-bold">
                            {formatCurrency(item.startingPrice)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-label-sm text-label-sm text-on-surface-variant">{t("fields.currentPrice")}</p>
                          <p className="font-label-md text-label-md text-on-surface">
                            {item.currentBid > 0 ? formatCurrency(item.currentBid) : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-sm">
                        {(item.status === "PENDING" || item.status === "REJECTED") && (
                          <>
                            <button
                              onClick={() => handleEditClick(item.productId)}
                              disabled={editLoading}
                              className="flex-1 border border-outline-variant rounded-lg py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center gap-xs disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              {t("actions.edit")}
                            </button>
                            <button
                              onClick={() => handleDelete(item.productId)}
                              disabled={deletingId === item.productId}
                              className="flex-1 border border-error rounded-lg py-2 font-label-md text-label-md text-error hover:bg-error-container transition-colors flex items-center justify-center gap-xs disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[16px]">{deletingId === item.productId ? "hourglass_empty" : "delete"}</span>
                              {deletingId === item.productId ? t("actions.deleting") : t("actions.delete")}
                            </button>
                          </>
                        )}
                        {item.status === "APPROVED" && auctionState === "ACTIVE" && (
                          <Link
                            href={`/auction-room/${item.productId}`}
                            className="flex-1 bg-error text-on-error rounded-lg py-2 font-label-md text-label-md flex items-center justify-center gap-xs hover:opacity-90 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-[16px]">videocam</span>
                            {t("actions.enterRoom")}
                          </Link>
                        )}
                        {item.status === "APPROVED" && auctionState === "UPCOMING" && (
                          <>
                            <Link
                              href={`/auctions/${item.productId}`}
                              className="flex-1 border border-outline-variant rounded-lg py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center gap-xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                              {t("actions.viewDetails")}
                            </Link>
                            <Link
                              href={`/auction-room/${item.productId}`}
                              className="flex-1 bg-secondary text-on-secondary rounded-lg py-2 font-label-md text-label-md flex items-center justify-center gap-xs hover:bg-secondary-fixed-dim transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">videocam</span>
                              {t("actions.enterRoomShort")}
                            </Link>
                          </>
                        )}
                        {item.status === "APPROVED" && auctionState === "ENDED" && (
                          <Link
                            href={`/auctions/${item.productId}`}
                            className="flex-1 bg-surface-container-low text-on-surface rounded-lg py-2 font-label-md text-label-md flex items-center justify-center gap-xs hover:bg-surface-variant border border-outline-variant transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">history</span>
                            {t("actions.viewResults")}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={handleEditSaved}
          t={t}
        />
      )}
    </CollectorShell>
  );
}
