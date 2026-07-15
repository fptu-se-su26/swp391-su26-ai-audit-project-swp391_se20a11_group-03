"use client";

import Link from "next/link";
import CollectorShell from "@/components/shells/CollectorShell";
import { auctionApi, type WonAuction } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

async function loadWonItems(): Promise<WonAuction[]> {
  return (await auctionApi.wonAuctions()).data;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

export default function WonItemsPage() {
  const { data: wonItems, loading, error } = useApiData(loadWonItems, []);

  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">Vật phẩm đã thắng</h1>

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
                      <Link
                        href={`/auctions/${item.auctionId}`}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium hover:border-[var(--luxora-gold)] disabled:cursor-not-allowed disabled:opacity-30"
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
