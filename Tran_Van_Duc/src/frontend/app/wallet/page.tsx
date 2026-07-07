import CollectorShell from "@/components/shells/CollectorShell";
import { mockTransactions, mockUser } from "@/lib/mock-data";

export default function WalletPage() {
  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">Ví BidZone</h1>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">Số dư khả dụng</p>
            <p className="mt-2 text-2xl font-bold text-[var(--luxora-gold-light)]">
              ${mockUser.walletBalance.toLocaleString("en-US")}
            </p>
            <button
              type="button"
              className="gradient-cta mt-4 w-full rounded-full py-2.5 text-xs font-semibold text-black"
            >
              Nạp tiền
            </button>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">Tiền cọc đang khóa</p>
            <p className="mt-2 text-2xl font-bold">
              ${mockUser.lockedDeposits.toLocaleString("en-US")}
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-full border border-white/15 py-2.5 text-xs font-semibold hover:border-[var(--luxora-gold)]"
            >
              Rút tiền
            </button>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">Tổng giá trị tài sản</p>
            <p className="mt-2 text-2xl font-bold">$1,240,000</p>
          </div>
        </div>

        <h2 className="font-headline-md mt-10 mb-4 text-lg">
          Lịch sử giao dịch
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">Ngày</th>
                <th className="px-5 py-3 font-medium">Loại</th>
                <th className="px-5 py-3 font-medium">Mô tả</th>
                <th className="px-5 py-3 font-medium">Số tiền</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5">
                  <td className="px-5 py-4 text-white/60">{tx.date}</td>
                  <td className="px-5 py-4">{tx.type}</td>
                  <td className="px-5 py-4 text-white/60">{tx.description}</td>
                  <td
                    className={`px-5 py-4 font-semibold ${
                      tx.amount >= 0 ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    ${tx.amount.toLocaleString("en-US")}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        tx.status === "completed"
                          ? "bg-green-500/10 text-green-300"
                          : "bg-yellow-500/10 text-yellow-300"
                      }`}
                    >
                      {tx.status === "completed" ? "Hoàn tất" : "Đã khóa"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CollectorShell>
  );
}
