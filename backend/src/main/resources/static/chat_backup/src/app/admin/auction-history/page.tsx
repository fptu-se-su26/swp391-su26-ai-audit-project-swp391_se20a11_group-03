import { mockAuctionHistory } from "@/lib/mock-data";
import AdminShell from "@/components/layout/AdminShell";

export default function AuctionHistoryPage() {
  const summary = [
    { label: "Total Auctions", value: "1,240" },
    { label: "Avg. Sale Price", value: "$82,400" },
    { label: "Dispute Rate", value: "0.8%" },
    { label: "Completion Rate", value: "98.2%" },
  ];

  return (
    <AdminShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">Global Auction History</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">Complete record of all auction events on the platform.</p>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {summary.map((s) => (
            <div key={s.label} className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant text-center">
              <p className="font-headline-md text-headline-md md:text-[28px] font-bold text-primary">{s.value}</p>
              <p className="font-label-md text-label-md text-on-surface-variant mt-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-sm">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search by lot, seller, or buyer..."
              className="pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-sm focus:border-secondary outline-none w-64"
            />
          </div>
          <select className="px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-sm focus:border-secondary outline-none appearance-none">
            <option>All Statuses</option>
            <option>Completed</option>
            <option>Dispute</option>
            <option>Pending Payment</option>
          </select>
          <select className="px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-sm focus:border-secondary outline-none appearance-none">
            <option>All Categories</option>
            <option>Watches</option>
            <option>Fine Art</option>
            <option>Automotive</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-variant">
                {["Lot #", "Item Title", "Seller", "Buyer", "Final Price", "Commission", "Sale Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="p-md font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...mockAuctionHistory, ...mockAuctionHistory].map((row, i) => (
                <tr key={i} className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                  <td className="p-md font-label-md text-label-md text-primary">#{row.lotNumber}</td>
                  <td className="p-md font-body-md text-sm text-on-surface max-w-[180px] truncate">{row.title}</td>
                  <td className="p-md font-body-md text-sm text-on-surface-variant">{row.seller}</td>
                  <td className="p-md font-body-md text-sm text-on-surface-variant">{row.buyer}</td>
                  <td className="p-md font-bold text-primary">${row.salePrice.toLocaleString()}</td>
                  <td className="p-md text-on-surface-variant text-sm">${Math.round(row.salePrice * 0.1).toLocaleString()}</td>
                  <td className="p-md font-body-md text-sm text-on-surface-variant whitespace-nowrap">{row.date}</td>
                  <td className="p-md">
                    {row.status === "completed" ? (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-tertiary-fixed text-on-tertiary-fixed-variant">Completed</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-error-container text-on-error-container">Dispute</span>
                    )}
                  </td>
                  <td className="p-md">
                    <button className="text-secondary font-label-sm text-label-sm hover:underline">View</button>
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
