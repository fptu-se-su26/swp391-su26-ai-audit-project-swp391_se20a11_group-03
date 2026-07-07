import CollectorShell from "@/components/shells/CollectorShell";
import { mockWonItems } from "@/lib/mock-data";

export default function WonItemsPage() {
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
              {mockWonItems.map((item) => (
                <tr key={item.id} className="border-b border-white/5">
                  <td className="px-5 py-4 text-white/60">{item.date}</td>
                  <td className="px-5 py-4">
                    <p className="text-[10px] text-[var(--luxora-gold)]">
                      {item.lotNumber}
                    </p>
                    <p className="font-medium">{item.title}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[var(--luxora-gold-light)]">
                    ${item.winningBid.toLocaleString("en-US")}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        item.status === "paid"
                          ? "bg-green-500/10 text-green-300"
                          : "bg-yellow-500/10 text-yellow-300"
                      }`}
                    >
                      {item.status === "paid" ? "Đã thanh toán" : "Đang chờ"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium hover:border-[var(--luxora-gold)]"
                      >
                        Tải hóa đơn
                      </button>
                      <button
                        type="button"
                        disabled={item.status !== "paid"}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium hover:border-[var(--luxora-gold)] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Theo dõi vận chuyển
                      </button>
                    </div>
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
