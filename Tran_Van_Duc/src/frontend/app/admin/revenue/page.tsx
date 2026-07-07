import AdminShell from "@/components/shells/AdminShell";
import { mockAdminStats, mockAuctionHistory } from "@/lib/mock-data";

const REVENUE_CURVE = [
  120, 145, 132, 168, 190, 175, 210, 240, 228, 260, 295, 320,
];

const STATUS_LABEL: Record<string, string> = {
  completed: "Hoàn tất",
  dispute: "Tranh chấp",
  pending_payment: "Chờ thanh toán",
};

const STATUS_CLASS: Record<string, string> = {
  completed: "bg-green-500/10 text-green-300",
  dispute: "bg-red-500/10 text-red-300",
  pending_payment: "bg-yellow-500/10 text-yellow-300",
};

export default function AdminRevenuePage() {
  const maxValue = Math.max(...REVENUE_CURVE);

  const stats = [
    { label: "Doanh thu", value: `$${(mockAdminStats.totalRevenue.value / 1000).toFixed(0)}K`, growth: mockAdminStats.totalRevenue.growth },
    { label: "Giao dịch", value: mockAdminStats.completedTransactions.value.toLocaleString("en-US"), growth: mockAdminStats.completedTransactions.growth },
    { label: "Người dùng", value: mockAdminStats.activeUsers.value.toLocaleString("en-US"), growth: mockAdminStats.activeUsers.growth },
    { label: "Hoa hồng", value: `$${(mockAdminStats.commissionEarned.value / 1000).toFixed(0)}K`, growth: mockAdminStats.commissionEarned.growth },
  ];

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
          ADMIN CONTROL CENTER
        </p>
        <h1 className="font-display-lg mt-2 text-3xl">Doanh thu &amp; Vận hành</h1>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-panel rounded-2xl p-6">
              <p className="text-xs text-white/40">{s.label}</p>
              <p className="mt-2 text-2xl font-bold text-[var(--luxora-gold-light)]">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-green-300">+{s.growth}%</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="glass-panel rounded-2xl p-6 lg:col-span-1">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              Tình trạng hôm nay
            </p>
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Phiên đã đóng</span>
                <span className="font-semibold">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Báo cáo chờ xuất</span>
                <span className="font-semibold">04</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Tranh chấp</span>
                <span className="font-semibold text-red-300">01</span>
              </div>
            </div>
          </aside>

          <div className="glass-panel rounded-2xl p-6 lg:col-span-3">
            <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-white/40">
              Revenue curve 12 tháng (USD nghìn)
            </p>
            <div className="flex h-40 items-end gap-2">
              {REVENUE_CURVE.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-[var(--luxora-gold)]/60"
                  style={{ height: `${(v / maxValue) * 100}%` }}
                  title={`$${v}K`}
                />
              ))}
            </div>
          </div>
        </div>

        <h2 className="font-headline-md mt-10 mb-4 text-lg">
          Giao dịch gần đây
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">Lot #</th>
                <th className="px-5 py-3 font-medium">Item / Seller → Buyer</th>
                <th className="px-5 py-3 font-medium">Giá bán</th>
                <th className="px-5 py-3 font-medium">Ngày</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {mockAuctionHistory.slice(0, 4).map((row) => (
                <tr key={row.id} className="border-b border-white/5">
                  <td className="px-5 py-4 text-[var(--luxora-gold)]">
                    {row.lotNumber}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{row.title}</p>
                    <p className="text-xs text-white/40">
                      {row.seller} → {row.buyer}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[var(--luxora-gold-light)]">
                    ${row.salePrice.toLocaleString("en-US")}
                  </td>
                  <td className="px-5 py-4 text-white/60">{row.date}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_CLASS[row.status]}`}
                    >
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
