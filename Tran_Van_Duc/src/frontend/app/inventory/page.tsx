import Link from "next/link";
import CollectorShell from "@/components/shells/CollectorShell";
import { mockInventory } from "@/lib/mock-data";

const STATUS_LABEL: Record<string, string> = {
  live: "Đang niêm yết",
  pending: "Chờ duyệt",
  review: "Đang xem xét",
};

const STATUS_CLASS: Record<string, string> = {
  live: "bg-green-500/10 text-green-300",
  pending: "bg-yellow-500/10 text-yellow-300",
  review: "bg-blue-500/10 text-blue-300",
};

export default function InventoryPage() {
  const featured = mockInventory[0];

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
              {featured.title}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-white/50">Giá mở</span>
              <span className="font-semibold text-[var(--luxora-gold-light)]">
                ${featured.startingBid.toLocaleString("en-US")}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-white/50">Lượt xem</span>
              <span className="font-semibold">{featured.views}</span>
            </div>
            <span
              className={`mt-3 inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_CLASS[featured.status]}`}
            >
              {STATUS_LABEL[featured.status]}
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
                <span className="font-semibold">03</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Đã bán</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Doanh thu</span>
                <span className="font-semibold text-[var(--luxora-gold-light)]">
                  $1.85M
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Giá TB</span>
                <span className="font-semibold">$154K</span>
              </div>
            </div>
          </aside>

          <div className="flex flex-col gap-4 lg:col-span-3">
            {mockInventory.map((item) => (
              <div
                key={item.id}
                className="glass-card flex items-center gap-4 rounded-2xl p-4"
              >
                <div
                  className="h-16 w-16 shrink-0 rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="flex-1">
                  <p className="text-[10px] text-white/40">{item.category}</p>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-white/40">
                    Giá mở ${item.startingBid.toLocaleString("en-US")} ·{" "}
                    {item.views} lượt xem
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_CLASS[item.status]}`}
                >
                  {STATUS_LABEL[item.status]}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold hover:border-[var(--luxora-gold)]"
                >
                  Sửa
                </button>
                {item.status === "live" && (
                  <button
                    type="button"
                    className="gradient-cta rounded-full px-4 py-2 text-xs font-semibold text-black"
                  >
                    Mở phiên
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CollectorShell>
  );
}
