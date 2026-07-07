import AdminShell from "@/components/shells/AdminShell";
import { mockAdminStats } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const stats = [
    {
      label: "Người dùng",
      value: mockAdminStats.activeUsers.value.toLocaleString("en-US"),
      icon: "group",
    },
    {
      label: "Giao dịch",
      value: mockAdminStats.completedTransactions.value.toLocaleString("en-US"),
      icon: "receipt_long",
    },
    {
      label: "Doanh thu",
      value: `$${(mockAdminStats.totalRevenue.value / 1000).toFixed(0)}K`,
      icon: "trending_up",
    },
    {
      label: "Hoa hồng",
      value: `$${(mockAdminStats.commissionEarned.value / 1000).toFixed(0)}K`,
      icon: "payments",
    },
  ];

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
          ADMIN CONTROL CENTER
        </p>
        <h1 className="font-display-lg mt-2 text-3xl">Tổng quan hệ thống</h1>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="glass-panel rounded-2xl p-6">
              <span className="material-symbols-outlined text-2xl text-[var(--luxora-gold)]">
                {item.icon}
              </span>
              <p className="mt-4 text-xs text-white/40">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-[var(--luxora-gold-light)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="glass-panel rounded-2xl p-6 lg:col-span-2">
            <h2 className="font-headline-md text-lg">Việc cần xử lý</h2>
            <div className="mt-5 grid gap-3">
              {[
                "Duyệt sản phẩm đang chờ kiểm định",
                "Rà soát hồ sơ KYC mới",
                "Kiểm tra phiên đấu giá chưa thanh toán",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70"
                >
                  <span className="material-symbols-outlined text-lg text-[var(--luxora-gold)]">
                    task_alt
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-6">
            <h2 className="font-headline-md text-lg">Trạng thái hôm nay</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Phiên đã đóng</span>
                <span className="font-semibold">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Chờ thanh toán</span>
                <span className="font-semibold">04</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Tranh chấp</span>
                <span className="font-semibold text-red-300">01</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
