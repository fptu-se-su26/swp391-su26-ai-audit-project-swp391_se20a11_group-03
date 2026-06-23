"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { SalesHistoryRow, getSalesHistory } from "@/lib/services/dashboardService";

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
    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function SalesHistoryPage() {
  const [rows, setRows] = useState<SalesHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getSalesHistory()
      .then(setRows)
      .catch(() => setError("Không thể tải lịch sử mua bán."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.productName.toLowerCase().includes(q) ||
        r.sellerName.toLowerCase().includes(q) ||
        r.buyerName.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const totals = useMemo(
    () => ({
      gmv: filtered.reduce((s, r) => s + r.finalPrice, 0),
      commission: filtered.reduce((s, r) => s + r.commission, 0),
      count: filtered.length,
    }),
    [filtered],
  );

  if (loading) {
    return (
      <AdminShell>
        <div className="flex h-64 items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-[1400px] space-y-lg p-margin-mobile md:p-margin-desktop">
        <div>
          <h1 className="font-display-lg-mobile text-primary md:font-display-lg">Lịch sử mua bán</h1>
          <p className="mt-xs font-body-lg text-on-surface-variant">
            Các phiên đấu giá đã thanh toán thành công trên toàn nền tảng.
          </p>
        </div>

        {error && <div className="rounded-xl bg-error-container p-md text-on-error-container">{error}</div>}

        <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
          {[
            { label: "Tổng giá trị giao dịch (GMV)", value: formatCurrency(totals.gmv) },
            { label: "Hoa hồng nền tảng (20%)", value: formatCurrency(totals.commission) },
            { label: "Số giao dịch", value: String(totals.count) },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-surface-variant bg-surface p-md soft-shadow">
              <p className="font-label-md text-label-md text-on-surface-variant">{c.label}</p>
              <p className="mt-xs font-headline-md text-headline-md font-bold text-primary">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo sản phẩm, người bán, người mua..."
            className="w-full rounded-lg border border-outline-variant bg-surface py-2 pl-10 pr-3 outline-none focus:border-secondary"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl bg-surface p-xl text-center">
            <span className="material-symbols-outlined mb-sm block text-4xl text-on-surface-variant">receipt_long</span>
            <p className="text-on-surface-variant">Chưa có giao dịch nào.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-surface-variant bg-surface soft-shadow">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-surface-variant bg-surface-container-low">
                    {["Phiên", "Sản phẩm", "Người bán", "Người mua", "Giá chốt", "Hoa hồng", "Người bán nhận", "Thanh toán lúc"].map((h) => (
                      <th key={h} className="whitespace-nowrap p-md font-label-sm text-label-sm text-on-surface-variant">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.auctionId} className="border-b border-surface-variant hover:bg-surface-container-lowest">
                      <td className="p-md font-label-md text-label-md text-primary">#{r.auctionId}</td>
                      <td className="p-md font-label-md text-label-md text-on-surface">{r.productName}</td>
                      <td className="p-md text-sm text-on-surface-variant">{r.sellerName}</td>
                      <td className="p-md text-sm text-on-surface-variant">{r.buyerName}</td>
                      <td className="whitespace-nowrap p-md font-bold text-primary">{formatCurrency(r.finalPrice)}</td>
                      <td className="whitespace-nowrap p-md text-tertiary">{formatCurrency(r.commission)}</td>
                      <td className="whitespace-nowrap p-md text-on-surface-variant">{formatCurrency(r.sellerPayout)}</td>
                      <td className="whitespace-nowrap p-md text-sm text-on-surface-variant">{formatDateTime(r.paidAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
