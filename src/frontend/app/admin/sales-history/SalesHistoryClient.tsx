"use client";

import { adminApi, type SalesHistory } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

const VND = new Intl.NumberFormat("vi-VN");

async function loadSales(): Promise<SalesHistory[]> {
  return (await adminApi.salesHistory()).data ?? [];
}

function fmt(date: string | null) {
  return date
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(date))
    : "—";
}

export default function SalesHistoryClient() {
  const { data: rows, loading, error } = useApiData(loadSales, []);

  const totalRevenue = rows.reduce((sum, r) => sum + (r.commission ?? 0), 0);
  const totalVolume = rows.reduce((sum, r) => sum + (r.finalPrice ?? 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
        ĐẤU GIÁ
      </p>
      <h1 className="font-display-lg mt-2 text-3xl">Lịch sử mua bán</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-[11px] text-white/40">Giao dịch</p>
          <p className="mt-1 text-2xl font-bold">{rows.length}</p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-[11px] text-white/40">Tổng giá trị chốt</p>
          <p className="mt-1 text-2xl font-bold text-[var(--luxora-gold-light)]">
            {VND.format(totalVolume)} ₫
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-[11px] text-white/40">Hoa hồng nền tảng</p>
          <p className="mt-1 text-2xl font-bold text-green-300">{VND.format(totalRevenue)} ₫</p>
        </div>
      </div>

      <div className="glass-panel mt-6 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-white/40">
              <th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3">Người bán</th>
              <th className="px-4 py-3">Người mua</th>
              <th className="px-4 py-3 text-right">Giá chốt</th>
              <th className="px-4 py-3 text-right">Hoa hồng</th>
              <th className="px-4 py-3 text-right">Trả seller</th>
              <th className="px-4 py-3">Thanh toán</th>
              <th className="px-4 py-3">Lúc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.auctionId} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <p className="font-medium">{r.productName}</p>
                  <p className="text-[11px] text-white/40">Phiên #{r.auctionId}</p>
                </td>
                <td className="px-4 py-3 text-white/60">{r.sellerName}</td>
                <td className="px-4 py-3 text-white/60">{r.buyerName}</td>
                <td className="px-4 py-3 text-right font-semibold text-[var(--luxora-gold-light)]">
                  {VND.format(r.finalPrice)} ₫
                </td>
                <td className="px-4 py-3 text-right text-green-300">{VND.format(r.commission)} ₫</td>
                <td className="px-4 py-3 text-right text-white/60">{VND.format(r.sellerPayout)} ₫</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      "PAID".toUpperCase() === (r.paymentStatus ?? "").toUpperCase()
                        ? "bg-green-500/10 text-green-300"
                        : "bg-yellow-500/10 text-yellow-300"
                    }`}
                  >
                    {r.paymentStatus ?? r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/50">{fmt(r.paidAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-6 text-center text-sm text-white/40">Đang tải...</p>}
        {!loading && rows.length === 0 && (
          <p className="p-6 text-center text-sm text-white/40">{error ?? "Chưa có giao dịch nào."}</p>
        )}
      </div>
    </div>
  );
}
