"use client";

import Link from "next/link";
import CollectorShell from "@/components/shells/CollectorShell";
import { productApi, toImageSrc, type SellerProduct } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Đã duyệt",
  ACTIVE: "Đang niêm yết",
  PENDING: "Chờ duyệt",
  REJECTED: "Bị từ chối",
  DRAFT: "Bản nháp",
};

const STATUS_CLASS: Record<string, string> = {
  APPROVED: "bg-green-500/10 text-green-300",
  ACTIVE: "bg-green-500/10 text-green-300",
  PENDING: "bg-yellow-500/10 text-yellow-300",
  REJECTED: "bg-red-500/10 text-red-300",
  DRAFT: "bg-blue-500/10 text-blue-300",
};

async function loadInventory(): Promise<SellerProduct[]> {
  return (await productApi.mine()).data;
}

export default function InventoryPage() {
  const { data: inventory, loading, error } = useApiData(loadInventory, []);
  const featured = inventory[0];
  const activeCount = inventory.filter((item) =>
    ["APPROVED", "ACTIVE"].includes(item.status.toUpperCase()),
  ).length;
  const soldCount = inventory.filter((item) =>
    ["SOLD", "PAID"].includes(item.status.toUpperCase()),
  ).length;

  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="glass-card lg:col-span-2 flex flex-col justify-center gap-4 rounded-3xl p-10">
            <span className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
              CỔNG NGƯỜI BÁN
            </span>
            <h1 className="font-display-lg text-3xl">Kho ký gửi của bạn</h1>
            <div>
              <Link
                href="/post-item"
                className="gradient-cta inline-block rounded-full px-6 py-3 text-sm font-semibold text-black"
              >
                Đăng vật phẩm mới
              </Link>
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              {featured?.productName ?? "Chưa có sản phẩm"}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-white/50">Giá mở</span>
              <span className="font-semibold text-[var(--luxora-gold-light)]">
                {(featured?.startingPrice ?? 0).toLocaleString("vi-VN")} ₫
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-white/50">Danh mục</span>
              <span className="font-semibold">{featured?.categoryName ?? "—"}</span>
            </div>
            <span
              className={`mt-3 inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_CLASS[featured?.status?.toUpperCase() ?? ""] ?? "bg-white/10 text-white/60"}`}
            >
              {STATUS_LABEL[featured?.status?.toUpperCase() ?? ""] ?? featured?.status ?? "Trống"}
            </span>
          </section>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="glass-panel rounded-2xl p-6 lg:col-span-1">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Hiệu suất
            </p>
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Đang niêm yết</span>
                <span className="font-semibold">{activeCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Đã bán</span>
                <span className="font-semibold">{soldCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Doanh thu</span>
                <span className="font-semibold text-[var(--luxora-gold-light)]">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Giá TB</span>
                <span className="font-semibold">
                  {inventory.length
                    ? Math.round(inventory.reduce((sum, item) => sum + item.startingPrice, 0) / inventory.length).toLocaleString("vi-VN")
                    : 0} ₫
                </span>
              </div>
            </div>
          </aside>

          <div className="flex flex-col gap-4 lg:col-span-3">
            {inventory.map((item) => (
              <div
                key={item.productId}
                className="glass-card flex items-center gap-4 rounded-2xl p-4"
              >
                <div
                  className="h-16 w-16 shrink-0 rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${toImageSrc(item.imageUrl)})` }}
                />
                <div className="flex-1">
                  <p className="text-[10px] text-white/40">{item.categoryName ?? "Khác"}</p>
                  <p className="text-sm font-semibold">{item.productName}</p>
                  <p className="text-xs text-white/40">
                    Giá mở {item.startingPrice.toLocaleString("vi-VN")} ₫
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_CLASS[item.status.toUpperCase()] ?? "bg-white/10 text-white/60"}`}
                >
                  {STATUS_LABEL[item.status.toUpperCase()] ?? item.status}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold hover:border-[var(--luxora-gold)]"
                >
                  Sửa
                </button>
                {item.auctionId && (
                  <button
                    type="button"
                    className="gradient-cta rounded-full px-4 py-2 text-xs font-semibold text-black"
                  >
                    Xem phiên
                  </button>
                )}
              </div>
            ))}
            {!loading && inventory.length === 0 && (
              <p className="py-12 text-center text-sm text-white/45">
                {error ?? "Bạn chưa đăng sản phẩm nào."}
              </p>
            )}
          </div>
        </div>
      </div>
    </CollectorShell>
  );
}
