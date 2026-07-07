import AdminShell from "@/components/shells/AdminShell";
import { mockAuctionHistory } from "@/lib/mock-data";

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

export default function AuctionHistoryPage() {
  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">Lịch sử đấu giá toàn cục</h1>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Tổng phiên đấu giá", value: "1,240" },
            { label: "Giá bán TB", value: "$82,400" },
            { label: "Tỷ lệ tranh chấp", value: "0.8%" },
            { label: "Tỷ lệ hoàn tất", value: "98.2%" },
          ].map((s) => (
            <div key={s.label} className="glass-panel rounded-2xl p-6">
              <p className="text-xs text-white/40">{s.label}</p>
              <p className="mt-2 text-2xl font-bold text-[var(--luxora-gold-light)]">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm lot, seller, buyer..."
            className="flex-1 min-w-[220px] rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
          />
          <select className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-[var(--luxora-gold)]">
            {["Tất cả trạng thái", "Hoàn tất", "Tranh chấp", "Chờ thanh toán"].map(
              (opt) => (
                <option key={opt} className="bg-[var(--luxora-bg-elevated)]">
                  {opt}
                </option>
              ),
            )}
          </select>
          <select className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-[var(--luxora-gold)]">
            {["Tất cả danh mục", "Đồng hồ", "Túi xách", "Nghệ thuật"].map(
              (opt) => (
                <option key={opt} className="bg-[var(--luxora-bg-elevated)]">
                  {opt}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">Số lot</th>
                <th className="px-5 py-3 font-medium">Tên sản phẩm</th>
                <th className="px-5 py-3 font-medium">Người bán</th>
                <th className="px-5 py-3 font-medium">Người mua</th>
                <th className="px-5 py-3 font-medium">Giá cuối</th>
                <th className="px-5 py-3 font-medium">Hoa hồng</th>
                <th className="px-5 py-3 font-medium">Ngày bán</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {mockAuctionHistory.map((row) => (
                <tr key={row.id} className="border-b border-white/5">
                  <td className="px-5 py-4 text-[var(--luxora-gold)]">
                    {row.lotNumber}
                  </td>
                  <td className="px-5 py-4 font-medium">{row.title}</td>
                  <td className="px-5 py-4 text-white/60">{row.seller}</td>
                  <td className="px-5 py-4 text-white/60">{row.buyer}</td>
                  <td className="px-5 py-4 font-semibold text-[var(--luxora-gold-light)]">
                    ${row.salePrice.toLocaleString("en-US")}
                  </td>
                  <td className="px-5 py-4 text-white/60">
                    ${(row.salePrice * 0.1).toLocaleString("en-US")}
                  </td>
                  <td className="px-5 py-4 text-white/60">{row.date}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_CLASS[row.status]}`}
                    >
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold hover:border-[var(--luxora-gold)]"
                    >
                      Xem
                    </button>
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
