"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CollectorShell from "@/components/shells/CollectorShell";
import { ApiError, orderApi, walletApi, type DeliveryOrder, type WalletTransaction } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

type FilterKey = "ALL" | "PROCESSING" | "SHIPPING" | "COMPLETED" | "CANCELLED";

type DisplayOrder = {
  key: string;
  orderNumber: string;
  productName: string;
  subtitle: string;
  sellerName: string;
  createdAt: string;
  status: string;
  total: number;
  kind: "DELIVERY" | "PREMIUM";
  delivery?: DeliveryOrder;
  transaction?: WalletTransaction;
};

const FILTERS: Array<{ key: FilterKey; labelKey: "all" | "processing" | "shipping" | "cancelled" | "completed"; icon: string }> = [
  { key: "ALL", labelKey: "all", icon: "inventory_2" },
  { key: "PROCESSING", labelKey: "processing", icon: "schedule" },
  { key: "SHIPPING", labelKey: "shipping", icon: "local_shipping" },
  { key: "CANCELLED", labelKey: "cancelled", icon: "cancel" },
  { key: "COMPLETED", labelKey: "completed", icon: "check_circle" },
];

const STATUS_STYLES = {
  PENDING_PICKUP: "bg-amber-50 text-amber-700",
  ASSIGNED: "bg-blue-50 text-blue-700",
  PICKED_UP: "bg-sky-50 text-sky-700",
  IN_TRANSIT: "bg-violet-50 text-violet-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-green-50 text-green-700",
  DELIVERY_FAILED: "bg-red-50 text-red-700",
  REFUNDED: "bg-slate-100 text-slate-700",
};

type KnownStatus = keyof typeof STATUS_STYLES;

function matchesFilter(order: DisplayOrder, filter: FilterKey) {
  if (filter === "ALL") return true;
  if (filter === "PROCESSING") return ["PENDING_PICKUP", "ASSIGNED", "PICKED_UP"].includes(order.status);
  if (filter === "SHIPPING") return order.status === "IN_TRANSIT";
  if (filter === "COMPLETED") return ["DELIVERED", "COMPLETED"].includes(order.status);
  return ["DELIVERY_FAILED", "REFUNDED"].includes(order.status);
}

export default function OrdersPage() {
  const t = useTranslations("ordersPage");
  const locale = useLocale();
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
  const numberFormatter = useMemo(() => new Intl.NumberFormat(dateLocale), [dateLocale]);
  const loadOrders = useCallback(() => orderApi.mine(), []);
  const loadTransactions = useCallback(() => walletApi.transactions(), []);
  const { data: deliveryOrders, setData, loading: ordersLoading, error: ordersError } = useApiData(loadOrders, [] as DeliveryOrder[]);
  const { data: transactions, loading: transactionsLoading, error: transactionsError } = useApiData(loadTransactions, [] as WalletTransaction[]);
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [exactStatus, setExactStatus] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"NEWEST" | "OLDEST">("NEWEST");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedOrder, setSelectedOrder] = useState<DisplayOrder | null>(null);

  const orders = useMemo<DisplayOrder[]>(() => {
    const premiumOrders = transactions
      .filter((transaction) => transaction.transactionType === "PREMIUM_PURCHASE")
      .map((transaction) => ({
        key: `premium-${transaction.transactionId}`,
        orderNumber: `PRM${transaction.transactionId}`,
        productName: t("premiumProduct"),
        subtitle: transaction.description?.toUpperCase().includes("YEARLY") ? t("yearlyPackage") : t("monthlyPackage"),
        sellerName: "BidZone",
        createdAt: transaction.createdAt,
        status: transaction.status,
        total: Math.abs(transaction.amount),
        kind: "PREMIUM" as const,
        transaction,
      }));
    const auctionOrders = deliveryOrders.map((order) => ({
      key: `delivery-${order.orderId}`,
      orderNumber: `BID${order.orderId}`,
      productName: order.productName,
      subtitle: t("auctionProduct"),
      sellerName: order.sellerName,
      createdAt: order.createdAt,
      status: order.status,
      total: order.finalPrice + order.shippingFee,
      kind: "DELIVERY" as const,
      delivery: order,
    }));
    return [...premiumOrders, ...auctionOrders];
  }, [deliveryOrders, t, transactions]);

  function getStatusMeta(status: string) {
    const known = status in STATUS_STYLES ? status as KnownStatus : null;
    return {
      label: known ? t(`status.${known}.label`) : status.replaceAll("_", " "),
      description: known ? t(`status.${known}.description`) : t("status.UNKNOWN.description"),
      className: known ? STATUS_STYLES[known] : "bg-slate-100 text-slate-700",
    };
  }

  const filteredOrders = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi-VN");
    return orders
      .filter((order) => matchesFilter(order, filter))
      .filter((order) => !exactStatus || order.status === exactStatus)
      .filter((order) =>
        !keyword ||
        order.orderNumber.toLocaleLowerCase("vi-VN").includes(keyword) ||
        order.productName.toLocaleLowerCase("vi-VN").includes(keyword) ||
        order.sellerName.toLocaleLowerCase("vi-VN").includes(keyword),
      )
      .sort((a, b) => {
        const difference = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sort === "NEWEST" ? difference : -difference;
      });
  }, [exactStatus, filter, orders, query, sort]);

  const loading = ordersLoading || transactionsLoading;
  const error = ordersError ?? transactionsError;

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function confirmReceived(order: DeliveryOrder) {
    setBusy(order.orderId);
    setMessage("");
    try {
      await orderApi.confirmReceived(order.orderId);
      const refreshed = await orderApi.mine();
      setData(refreshed);
      const updated = refreshed.find((item) => item.orderId === order.orderId);
      if (updated) {
        setSelectedOrder({
          key: `delivery-${updated.orderId}`,
          orderNumber: `BID${updated.orderId}`,
          productName: updated.productName,
          subtitle: t("auctionProduct"),
          sellerName: updated.sellerName,
          createdAt: updated.createdAt,
          status: updated.status,
          total: updated.finalPrice + updated.shippingFee,
          kind: "DELIVERY",
          delivery: updated,
        });
      }
    } catch (reason: unknown) {
      setMessage(reason instanceof ApiError ? reason.message : t("confirmError"));
    } finally {
      setBusy(null);
    }
  }

  async function copyOrderId(orderNumber: string) {
    await navigator.clipboard.writeText(orderNumber);
    setMessage(t("copied", { id: orderNumber }));
  }

  return (
    <CollectorShell>
      <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_48%_0%,rgba(245,219,166,.13),transparent_32%),#fffdfa] text-[#29262b] xl:h-screen xl:min-h-0 xl:overflow-y-hidden">
        <div className="mx-auto flex h-full max-w-[1320px] flex-col px-5 py-7 sm:px-8 lg:px-10 xl:py-8">
          <header className="shrink-0">
            <h1 className="text-3xl font-bold tracking-[-.035em] text-[#1f1d20] sm:text-4xl">{t("title")}</h1>
            <p className="mt-2 text-sm text-[#7d767c]">{t("subtitle")}</p>
          </header>

          <div className="mt-7 flex shrink-0 flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div className="no-scrollbar flex max-w-full overflow-x-auto rounded-2xl border border-[#e7e0d7] bg-white p-1 shadow-sm">
              {FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setFilter(item.key);
                    setExactStatus("");
                    setPage(1);
                  }}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    filter === item.key && !exactStatus
                      ? "bg-[#fff2d6] text-[#a66909] shadow-sm"
                      : "text-[#625c62] hover:bg-[#faf7f1] hover:text-[#29262b]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {t(`filters.${item.labelKey}`)}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <label className="flex min-w-0 flex-1 items-center rounded-xl border border-[#e5ded5] bg-white px-4 shadow-sm focus-within:border-[#d4a24b] lg:w-[330px]">
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder={t("searchPlaceholder")}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#aaa3a8]"
                />
                <span className="material-symbols-outlined text-[21px] text-[#625c62]">search</span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  aria-expanded={filterOpen}
                  onClick={() => setFilterOpen((open) => !open)}
                  className={`inline-flex h-full items-center gap-2 rounded-xl border bg-white px-4 text-sm font-medium shadow-sm transition hover:border-[#d7b36b] ${filterOpen || exactStatus ? "border-[#d7a54d] text-[#a76b0b]" : "border-[#e5ded5] text-[#4e484d]"}`}
                >
                  <span className="material-symbols-outlined text-[19px]">filter_alt</span>
                  <span className="hidden sm:inline">{t("filterButton")}</span>
                </button>

                {filterOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-64 rounded-2xl border border-[#e4dcd1] bg-white p-4 shadow-[0_18px_50px_rgba(57,42,20,.14)]">
                    <label className="text-xs font-semibold text-[#6f686d]">
                      {t("specificStatus")}
                      <select value={exactStatus} onChange={(event) => { setExactStatus(event.target.value); setPage(1); }} className="mt-2 w-full rounded-xl border border-[#e2dbd2] bg-[#fcfaf7] px-3 py-2.5 text-sm outline-none focus:border-[#d2a04a]">
                        <option value="">{t("allStatuses")}</option>
                        {Object.keys(STATUS_STYLES).map((value) => <option key={value} value={value}>{getStatusMeta(value).label}</option>)}
                      </select>
                    </label>
                    <label className="mt-4 block text-xs font-semibold text-[#6f686d]">
                      {t("sort")}
                      <select value={sort} onChange={(event) => { setSort(event.target.value as "NEWEST" | "OLDEST"); setPage(1); }} className="mt-2 w-full rounded-xl border border-[#e2dbd2] bg-[#fcfaf7] px-3 py-2.5 text-sm outline-none focus:border-[#d2a04a]">
                        <option value="NEWEST">{t("newest")}</option>
                        <option value="OLDEST">{t("oldest")}</option>
                      </select>
                    </label>
                    <button type="button" onClick={() => { setExactStatus(""); setSort("NEWEST"); setPage(1); setFilterOpen(false); }} className="mt-4 w-full rounded-xl bg-[#f6efe4] px-3 py-2 text-xs font-bold text-[#8f6318]">{t("resetFilter")}</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {message && (
            <div role="status" className="mt-4 shrink-0 rounded-xl border border-[#ead6a8] bg-[#fff8e8] px-4 py-3 text-sm text-[#8e6216]">
              {message}
            </div>
          )}

          <section className="mt-5 flex min-h-[430px] flex-1 flex-col overflow-hidden rounded-2xl border border-[#e7e0d7] bg-white shadow-[0_12px_38px_rgba(69,51,24,.07)]" aria-label={t("table.aria")}>
            <div className="hidden shrink-0 grid-cols-[120px_minmax(180px,1.6fr)_100px_135px_115px_125px] items-center border-b border-[#ece6de] bg-[#fffefa] px-4 py-4 text-xs font-semibold text-[#666067] lg:grid">
              <span>{t("table.order")}</span>
              <span>{t("table.product")}</span>
              <span>{t("table.date")}</span>
              <span>{t("table.status")}</span>
              <span>{t("table.total")}</span>
              <span>{t("table.actions")}</span>
            </div>

            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
              {loading && (
                <div className="space-y-3" aria-label={t("loading")}>
                  {[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-[#f5f1eb]" />)}
                </div>
              )}

              {!loading && paginatedOrders.map((order) => {
                const meta = getStatusMeta(order.status);
                return (
                  <article key={order.key} className="mb-3 rounded-2xl border border-[#e9e3dc] bg-white p-4 shadow-[0_6px_20px_rgba(62,45,20,.045)] last:mb-0 lg:grid lg:grid-cols-[120px_minmax(180px,1.6fr)_100px_135px_115px_125px] lg:items-center lg:px-4 lg:py-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-[#28252a]">#{order.orderNumber}</strong>
                        <button type="button" aria-label={t("copyOrder")} onClick={() => void copyOrderId(order.orderNumber)} className="text-[#898288] transition hover:text-[#b37512]">
                          <span className="material-symbols-outlined text-[17px]">content_copy</span>
                        </button>
                      </div>
                      <p className="mt-3 text-xs text-[#8a8389]">{t("oneProduct")}</p>
                      <button type="button" onClick={() => setSelectedOrder(order)} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#ad700d] lg:flex">
                        {t("viewDetails")} <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                      </button>
                    </div>

                    <div className="mt-4 flex min-w-0 items-center gap-4 lg:mt-0">
                      <div className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border ${order.kind === "PREMIUM" ? "border-[#3b3020] bg-[radial-gradient(circle_at_50%_20%,#3a2a10,#100d09)] text-[#e7ba5d]" : "border-[#e7ddce] bg-[radial-gradient(circle_at_35%_25%,#fff7df,#f0dfbd)] text-[#b87a16]"}`}>
                        <span className="material-symbols-outlined text-[30px]">{order.kind === "PREMIUM" ? "crown" : "inventory_2"}</span>
                        {order.kind === "PREMIUM" && <span className="mt-0.5 text-[7px] font-bold tracking-[.16em]">PREMIUM</span>}
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-[#27242a]">{order.productName}</h2>
                        <p className="mt-1 truncate text-xs text-[#7c757b]">{order.subtitle}</p>
                        <span className="mt-2 inline-flex rounded-full bg-[#fff0d2] px-2 py-1 text-[10px] font-semibold text-[#a86b0c]">{order.kind === "PREMIUM" ? t("premium") : t("auction")}</span>
                      </div>
                    </div>

                    <div className="mt-4 text-xs lg:mt-0">
                      <p className="font-medium text-[#343037]">{new Date(order.createdAt).toLocaleDateString(dateLocale)}</p>
                      <p className="mt-2 text-[#898288]">{new Date(order.createdAt).toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>

                    <div className="mt-4 lg:mt-0">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${meta.className}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {meta.label}
                      </span>
                      <p className="mt-2 max-w-[155px] text-[11px] leading-4 text-[#8b848a]">{meta.description}</p>
                    </div>

                    <div className="mt-4 lg:mt-0">
                      <strong className="text-sm text-[#29262b]">{numberFormatter.format(order.total)} ₫</strong>
                      <p className="mt-2 text-[11px] font-semibold text-[#3772b9]">{t("wallet")}</p>
                    </div>

                    <div className="mt-5 flex items-center gap-2 lg:mt-0">
                      <button type="button" onClick={() => setSelectedOrder(order)} className="rounded-xl border border-[#dda74b] bg-white px-3 py-2.5 text-[11px] font-bold text-[#a66b0c] transition hover:bg-[#fff8e9]">{t("viewDetails")}</button>
                      <button type="button" aria-label={t("moreActions")} className="flex h-9 w-8 items-center justify-center rounded-lg text-[#777078] hover:bg-[#f6f2ec]">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </div>
                  </article>
                );
              })}

              {!loading && !paginatedOrders.length && (
                <div className="flex h-full min-h-72 flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff5df] text-[#bb7b16]">
                    <span className="material-symbols-outlined text-[30px]">package_2</span>
                  </div>
                  <h2 className="mt-4 font-bold text-[#353137]">{t("emptyTitle")}</h2>
                  <p className="mt-1 text-sm text-[#8a8389]">{error ?? t("emptyDescription")}</p>
                </div>
              )}
            </div>

            <footer className="flex shrink-0 flex-col items-center justify-between gap-3 border-t border-[#ece6de] bg-[#fffefa] px-5 py-3 sm:flex-row">
              <p className="text-xs text-[#807980]">
                {t("showing", { shown: paginatedOrders.length, total: filteredOrders.length })}
              </p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-[#756e74]">
                  {t("perPagePrefix")}
                  <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-[#e3dcd3] bg-white px-2 py-2 outline-none">
                    {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
                  </select>
                  {t("perPageSuffix")}
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3dcd3] bg-white text-[#767078] disabled:opacity-35">
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <span className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-[#dda94f] bg-[#fff8e9] px-3 text-xs font-bold text-[#ad700d]">{currentPage}</span>
                  <button type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3dcd3] bg-white text-[#767078] disabled:opacity-35">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </footer>
          </section>
        </div>

        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#302b28]/45 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && busy === null) setSelectedOrder(null); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="order-detail-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#e2d8ca] bg-[#fffdfa] shadow-[0_30px_90px_rgba(49,36,18,.28)]">
              <header className="flex items-start justify-between border-b border-[#e9e1d6] bg-[#fff9ed] px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a66e13]">{t("detail.eyebrow")}</p>
                  <h2 id="order-detail-title" className="mt-1 text-2xl font-bold text-[#29252a]">#{selectedOrder.orderNumber}</h2>
                </div>
                <button type="button" aria-label={t("detail.close")} disabled={busy !== null} onClick={() => setSelectedOrder(null)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#777078] hover:bg-[#eee7dd] disabled:opacity-40">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>

              <div className="p-6">
                <div className="flex items-center gap-4 rounded-2xl border border-[#e8e0d6] bg-white p-4">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${selectedOrder.kind === "PREMIUM" ? "bg-[#19130b] text-[#dca846]" : "bg-[#fff2d6] text-[#b57815]"}`}><span className="material-symbols-outlined text-[30px]">{selectedOrder.kind === "PREMIUM" ? "crown" : "inventory_2"}</span></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-[#2d2930]">{selectedOrder.productName}</h3>
                    <p className="mt-1 text-sm text-[#777078]">{selectedOrder.subtitle}</p>
                  </div>
                  <strong className="text-[#a66e13]">{numberFormatter.format(selectedOrder.total)} ₫</strong>
                </div>

                {selectedOrder.delivery ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#f8f5f0] p-4 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8287]">{t("detail.recipient")}</p>
                      <p className="mt-2 font-bold text-[#332f34]">{selectedOrder.delivery.receiverName}</p>
                      <p className="mt-1 text-[#716a70]">{selectedOrder.delivery.receiverPhone}</p>
                    </div>
                    <div className="rounded-2xl bg-[#f8f5f0] p-4 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8287]">{t("detail.address")}</p>
                      <p className="mt-2 leading-6 text-[#544e53]">{selectedOrder.delivery.addressLine}, {selectedOrder.delivery.ward}, {selectedOrder.delivery.district}, {selectedOrder.delivery.province}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#f8f5f0] p-4 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8287]">{t("detail.payment")}</p>
                      <p className="mt-2 font-bold text-[#332f34]">{t("wallet")}</p>
                      <p className="mt-1 text-[#716a70]">{t("paymentSuccess")}</p>
                    </div>
                    <div className="rounded-2xl bg-[#f8f5f0] p-4 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8287]">{t("detail.reference")}</p>
                      <p className="mt-2 break-all font-medium text-[#544e53]">{selectedOrder.transaction?.referenceCode ?? selectedOrder.orderNumber}</p>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="font-bold text-[#302c31]">{t("detail.history")}</h3>
                  <ol className="mt-4 space-y-0">
                    {(selectedOrder.delivery?.history ?? [{
                      fromStatus: null,
                      toStatus: selectedOrder.status,
                      changedBy: "SYSTEM",
                      note: t("premiumActivated"),
                      createdAt: selectedOrder.createdAt,
                    }]).map((history, index, historyItems) => {
                      const meta = getStatusMeta(history.toStatus);
                      return (
                        <li key={`${history.createdAt}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
                          {index < historyItems.length - 1 && <span className="absolute left-[7px] top-4 h-[calc(100%-4px)] w-px bg-[#e2d8c9]" />}
                          <span className="relative mt-1.5 h-4 w-4 shrink-0 rounded-full border-4 border-[#fff4da] bg-[#c88a23]" />
                          <div>
                            <p className="text-sm font-bold text-[#3a353a]">{meta.label}</p>
                            <p className="mt-1 text-xs text-[#898187]">{new Date(history.createdAt).toLocaleString(dateLocale)}</p>
                            {history.note && <p className="mt-1 text-xs text-[#6f686e]">{history.note}</p>}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>

              <footer className="flex justify-end gap-3 border-t border-[#e9e1d6] bg-[#faf7f2] p-5">
                <button type="button" disabled={busy !== null} onClick={() => setSelectedOrder(null)} className="rounded-xl border border-[#ddd5ca] bg-white px-5 py-3 text-sm font-bold text-[#625b61]">{t("detail.close")}</button>
                {selectedOrder.delivery?.status === "DELIVERED" && (
                  <button type="button" disabled={busy === selectedOrder.delivery.orderId} onClick={() => void confirmReceived(selectedOrder.delivery!)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c78b27] to-[#e3b85c] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
                    <span className="material-symbols-outlined text-[19px]">package_2</span>
                    {busy === selectedOrder.delivery.orderId ? t("detail.processing") : t("detail.received")}
                  </button>
                )}
              </footer>
            </section>
          </div>
        )}
      </main>
    </CollectorShell>
  );
}
