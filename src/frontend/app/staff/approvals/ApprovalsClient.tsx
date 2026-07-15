"use client";

import { adminApi, type ReviewProduct } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

async function loadPendingProducts(): Promise<ReviewProduct[]> { return (await adminApi.pendingProducts()).data; }

export default function ApprovalsClient() {
  const { data: items, loading, error } = useApiData(loadPendingProducts, []);
  const priority = items[0];
  return <div className="mx-auto max-w-7xl px-6 py-10"><h1 className="font-display-lg text-3xl">Bàn duyệt vật phẩm</h1>
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3"><Stat label="Chờ duyệt" value={items.length} color="text-yellow-300" /><Stat label="Có ảnh" value={items.filter((item) => item.images?.length).length} color="text-blue-300" /><Stat label="Chưa có ảnh" value={items.filter((item) => !item.images?.length).length} color="text-red-300" /></div>
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4"><aside className="glass-panel rounded-2xl p-6 lg:col-span-1"><p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">Hồ sơ ưu tiên</p>{priority ? <><p className="text-sm font-semibold">{priority.productName}</p><p className="mt-1 text-xs text-white/40">Seller #{priority.sellerId}</p><p className="mt-3 text-xs text-white/50">{priority.categoryName}</p><p className="mt-1 text-lg font-bold text-[var(--luxora-gold-light)]">{priority.startingPrice.toLocaleString("vi-VN")} ₫</p></> : <p className="text-sm text-white/45">Không có hồ sơ chờ duyệt.</p>}</aside>
      <div className="lg:col-span-3"><h2 className="font-headline-md mb-4 text-lg">Danh sách chờ xử lý</h2><div className="flex flex-col gap-3">{items.map((item) => <div key={item.productId} className="glass-card flex flex-wrap items-center gap-4 rounded-2xl p-4"><div className="min-w-[220px] flex-1"><p className="text-[10px] text-white/40">{item.categoryName} · {item.submittedAt ? new Intl.DateTimeFormat("vi-VN").format(new Date(item.submittedAt)) : "—"}</p><p className="text-sm font-semibold">{item.productName}</p><p className="text-xs text-white/40">Seller #{item.sellerId}</p></div><p className="font-semibold text-[var(--luxora-gold-light)]">{item.startingPrice.toLocaleString("vi-VN")} ₫</p><span className="rounded-full bg-yellow-500/10 px-3 py-1 text-[11px] font-semibold text-yellow-300">{item.status}</span></div>)}{!loading && items.length === 0 && <p className="py-12 text-center text-sm text-white/45">{error ?? "Không có sản phẩm chờ duyệt."}</p>}</div></div>
    </div>
  </div>;
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) { return <div className="glass-panel rounded-2xl p-6"><p className="text-xs text-white/40">{label}</p><p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p></div>; }
