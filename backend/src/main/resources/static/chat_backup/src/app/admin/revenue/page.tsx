import { mockAdminStats, mockAuctionHistory } from "@/lib/mock-data";
import AdminShell from "@/components/layout/AdminShell";

const STATS = [
  { label: "Total Revenue", value: mockAdminStats.totalRevenue, icon: "payments", growth: mockAdminStats.revenueGrowth, color: "primary" },
  { label: "Completed Transactions", value: mockAdminStats.completedTransactions, icon: "receipt_long", growth: mockAdminStats.transactionsGrowth, color: "secondary" },
  { label: "Active Users", value: mockAdminStats.activeUsers, icon: "group", growth: mockAdminStats.usersGrowth, color: "tertiary" },
  { label: "Commission Earned", value: mockAdminStats.commissionEarned, icon: "percent", growth: mockAdminStats.commissionGrowth, color: "primary" },
];

const CHART_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CHART_VALS = [820, 940, 880, 1050, 1200, 1100, 1380, 1420, 1600, 1820, 1640, 1950];
const MAX_VAL = Math.max(...CHART_VALS);

export default function RevenuePage() {
  return (
    <AdminShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">Revenue Analytics</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">Platform-wide financial performance and transaction metrics.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
              <div className="flex items-start justify-between mb-sm">
                <span className="material-symbols-outlined text-on-surface-variant">{stat.icon}</span>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold uppercase">
                  {stat.growth}
                </span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant">{stat.label}</p>
              <p className="font-headline-md text-headline-md md:text-[28px] font-bold text-primary mt-xs">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-surface rounded-xl p-lg soft-shadow border border-surface-variant">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-lg">Monthly Revenue (USD thousands)</h2>
          <div className="flex items-end gap-2 h-48">
            {CHART_MONTHS.map((month, i) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-xs">
                <div
                  className="w-full bg-primary-container rounded-t-sm hover:bg-primary transition-colors cursor-pointer"
                  style={{ height: `${(CHART_VALS[i] / MAX_VAL) * 100}%` }}
                  title={`$${CHART_VALS[i]}k`}
                />
                <span className="text-[9px] text-on-surface-variant hidden md:block">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <section>
          <h2 className="font-headline-sm text-headline-sm text-primary border-b border-surface-variant pb-xs mb-md">
            Recent Completed Auctions
          </h2>
          <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-variant">
                  {["Lot", "Item", "Seller", "Buyer", "Sale Price", "Date", "Status"].map((h) => (
                    <th key={h} className="p-md font-label-sm text-label-sm text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockAuctionHistory.map((row) => (
                  <tr key={row.id} className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                    <td className="p-md font-label-md text-label-md text-primary">#{row.lotNumber}</td>
                    <td className="p-md font-body-md text-sm text-on-surface truncate max-w-[200px]">{row.title}</td>
                    <td className="p-md font-body-md text-sm text-on-surface-variant">{row.seller}</td>
                    <td className="p-md font-body-md text-sm text-on-surface-variant">{row.buyer}</td>
                    <td className="p-md font-bold text-primary">${row.salePrice.toLocaleString()}</td>
                    <td className="p-md font-body-md text-sm text-on-surface-variant">{row.date}</td>
                    <td className="p-md">
                      {row.status === "completed" ? (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-tertiary-fixed text-on-tertiary-fixed-variant">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-error-container text-on-error-container">
                          Dispute
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
