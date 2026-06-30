"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import { AuctionSessionRow, getAuctionSessions } from "@/lib/services/dashboardService";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
}


type PaymentTab = "ALL" | "PAID" | "UNPAID";

export default function AuctionHistoryPage() {
  return (
    <Suspense fallback={<AdminShell><div className="p-margin-desktop">Đang tải lịch sử đấu giá...</div></AdminShell>}>
      <AuctionHistoryContent />
    </Suspense>
  );
}

function AuctionHistoryContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("payment")?.toUpperCase() as PaymentTab) || "ALL";
  const [rows, setRows] = useState<AuctionSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentTab, setPaymentTab] = useState<PaymentTab>(
    ["PAID", "UNPAID", "ALL"].includes(initialTab) ? initialTab : "ALL",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuctionSessions(
        paymentTab,
        fromDate || undefined,
        toDate || undefined,
      );
      setRows(data);
    } catch {
      setError("Không thể tải lịch sử phiên đấu giá.");
    } finally {
      setLoading(false);
    }
  }, [paymentTab, fromDate, toDate]);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.productName.toLowerCase().includes(q) ||
        r.sellerName.toLowerCase().includes(q) ||
        r.buyerName.toLowerCase().includes(q) ||
        String(r.auctionId).includes(q),
    );
  }, [rows, searchTerm]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      paid: rows.filter((r) => r.paymentCategory === "PAID").length,
      unpaid: rows.filter((r) => r.paymentCategory === "UNPAID").length,
      volume: rows.reduce((sum, r) => sum + r.finalPrice, 0),
    }),
    [rows],
  );

  return (
    <AdminShell>
      <div className="mx-auto max-w-[1400px] space-y-lg p-margin-mobile md:p-margin-desktop">
        <div>
          <Link href="/admin/dashboard" className="mb-2 inline-flex items-center gap-1 text-sm text-[#9a7429] hover:underline">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Về tổng quan
          </Link>
          <h1 className="font-display-lg-mobile text-primary md:font-display-lg">Lịch sử phiên đấu giá</h1>
          <p className="mt-xs font-body-lg text-on-surface-variant">
            Theo dõi các phiên đã kết thúc, phân loại theo trạng thái thanh toán.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-md md:grid-cols-4">
          {[
            { label: "Tổng phiên", value: String(stats.total), icon: "gavel" },
            { label: "Đã thanh toán", value: String(stats.paid), icon: "check_circle" },
            { label: "Chưa thanh toán", value: String(stats.unpaid), icon: "schedule" },
            { label: "Tổng giá trị", value: formatCurrency(stats.volume), icon: "payments" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-surface-variant bg-surface p-md text-center soft-shadow">
              <span className="material-symbols-outlined text-secondary">{item.icon}</span>
              <p className="mt-1 font-headline-md text-xl font-bold text-primary">{item.value}</p>
              <p className="font-label-md text-label-md text-on-surface-variant">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-sm">
          <div className="flex rounded-lg bg-surface-container-low p-1">
            {([
              { key: "ALL", label: "Tất cả" },
              { key: "PAID", label: "Đã thanh toán" },
              { key: "UNPAID", label: "Chưa thanh toán" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPaymentTab(tab.key)}
                className={`rounded-md px-4 py-1.5 font-label-md text-label-md transition-all ${
                  paymentTab === tab.key
                    ? "bg-surface text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-secondary"
            title="Từ ngày"
          />
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-secondary"
            title="Đến ngày"
          />
          <button
            type="button"
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="rounded-lg border border-outline-variant px-3 py-2 text-sm text-on-surface-variant hover:text-primary"
          >
            Xóa lọc ngày
          </button>
          <div className="relative min-w-[220px] flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm sản phẩm, người bán, người mua..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface py-2 pl-10 pr-4 text-sm outline-none focus:border-secondary"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-surface-variant bg-surface soft-shadow">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
          ) : error ? (
            <div className="p-lg text-center text-error">{error}</div>
          ) : filteredRows.length === 0 ? (
            <div className="p-xl text-center text-on-surface-variant">
              <span className="material-symbols-outlined mb-sm block text-4xl">history</span>
              Không có phiên đấu giá phù hợp.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-surface-variant bg-surface-container-low">
                    {[
                      "Phiên",
                      "Sản phẩm",
                      "Người bán",
                      "Người thắng",
                      "Giá cuối",
                      "Thanh toán",
                      "Kết thúc",
                      "Hạn thanh toán",
                      "",
                    ].map((h) => (
                      <th key={h} className="whitespace-nowrap p-md font-label-sm text-label-sm text-on-surface-variant">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.auctionId} className="border-b border-surface-variant hover:bg-surface-container-lowest">
                      <td className="p-md font-label-md text-primary">#{row.auctionId}</td>
                      <td className="p-md">
                        <p className="max-w-[180px] truncate font-body-md text-sm">{row.productName}</p>
                        <p className="text-xs text-on-surface-variant">LOT #{row.productId ?? "—"}</p>
                      </td>
                      <td className="p-md text-sm">{row.sellerName}</td>
                      <td className="p-md text-sm">{row.buyerName}</td>
                      <td className="p-md font-bold text-primary">{formatCurrency(row.finalPrice)}</td>
                      <td className="p-md">
                        {row.paymentCategory === "PAID" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-2 py-1 text-[10px] font-bold uppercase text-on-tertiary-fixed-variant">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            Đã thanh toán
                          </span>
                        ) : row.paymentCategory === "UNPAID" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-2 py-1 text-[10px] font-bold uppercase text-on-secondary-container">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            Chưa thanh toán
                          </span>
                        ) : (
                          <span className="rounded-full bg-surface-variant px-2 py-1 text-[10px] font-bold uppercase text-on-surface-variant">
                            Không có người thắng
                          </span>
                        )}
                      </td>
                      <td className="p-md text-sm text-on-surface-variant">{formatDateTime(row.endTime)}</td>
                      <td className="p-md text-sm text-on-surface-variant">
                        {row.paymentCategory === "UNPAID" ? formatDateTime(row.paymentDeadline) : formatDateTime(row.paidAt)}
                      </td>
                      <td className="p-md text-right">
                        {row.productId && (
                          <Link
                            href={`/auctions/${row.productId}`}
                            className="font-label-sm text-secondary hover:underline"
                          >
                            Xem
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
