"use client";

import Link from "next/link";
import { useState } from "react";
import CollectorShell from "@/components/shells/CollectorShell";
import { ApiError, auctionApi, type WonAuction } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

async function loadWonItems(): Promise<WonAuction[]> {
  return (await auctionApi.wonAuctions()).data;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

export default function WonItemsPage() {
  const { data: wonItems, setData, loading, error } = useApiData(
    loadWonItems,
    [],
  );
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");

  async function handlePay(item: WonAuction) {
    setPayError("");
    setPaySuccess("");
    setPayingId(item.auctionId);
    try {
      await auctionApi.pay(item.auctionId);
      setPaySuccess(
        `Đã thanh toán "${item.productName}" thành công từ ví BidZone.`,
      );
      setData(await loadWonItems());
    } catch (cause) {
      setPayError(
        cause instanceof ApiError
          ? cause.message
          : "Không thể thanh toán. Vui lòng thử lại.",
      );
    } finally {
      setPayingId(null);
    }
  }

  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">Vật phẩm đã thắng</h1>

        {payError ? (
          <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {payError}
          </p>
        ) : null}
        {paySuccess ? (
          <p className="mt-4 rounded-lg border border-green-400/30 bg-green-500/10 px-3 py-2 text-xs text-green-200">
            {paySuccess}
          </p>
        ) : null}

        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">Ngày</th>
                <th className="px-5 py-3 font-medium">Lot &amp; Sản phẩm</th>
                <th className="px-5 py-3 font-medium">Giá thắng</th>
                <th className="px-5 py-3 font-medium">Trạng thái thanh toán</th>
                <th className="px-5 py-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {wonItems.map((item) => (
                <tr key={item.id} className="border-b border-white/5">
                  <td className="px-5 py-4 text-white/60">{formatDate(item.wonDate)}</td>
                  <td className="px-5 py-4">
                    <p className="text-[10px] text-[var(--luxora-gold)]">
                      {item.lotNumber}
                    </p>
                    <p className="font-medium">{item.productName}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[var(--luxora-gold-light)]">
                    {item.finalPrice.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        item.status === "paid"
                          ? "bg-green-500/10 text-green-300"
                          : item.status === "forfeited"
                            ? "bg-red-500/10 text-red-300"
                            : "bg-yellow-500/10 text-yellow-300"
                      }`}
                    >
                      {item.status === "paid"
                        ? "Đã thanh toán"
                        : item.status === "forfeited"
                          ? "Đã quá hạn"
                          : "Đang chờ"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {item.status !== "paid" && item.status !== "forfeited" ? (
                        <button
                          type="button"
                          onClick={() => void handlePay(item)}
                          disabled={payingId !== null}
                          className="gradient-cta rounded-full px-3 py-1.5 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {payingId === item.auctionId
                            ? "Đang thanh toán..."
                            : "Thanh toán"}
                        </button>
                      ) : null}
                      <Link
                        href={`/auctions/${item.auctionId}`}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium hover:border-[var(--luxora-gold)]"
                      >
                        Xem phiên đấu giá
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && wonItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-white/45">
                    {error ?? "Bạn chưa thắng phiên đấu giá nào."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </CollectorShell>
  );
}
