import CollectorShell from "@/components/shells/CollectorShell";
import { mockPayouts } from "@/lib/mock-data";

export default function EarningsPage() {
  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">Doanh thu &amp; Chi trả</h1>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">Thu nhập ròng</p>
            <p className="mt-2 text-2xl font-bold text-[var(--luxora-gold-light)]">
              $1,850,000
            </p>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">Đang chờ đối soát</p>
            <p className="mt-2 text-2xl font-bold">$250,000</p>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">Có thể rút</p>
            <p className="mt-2 text-2xl font-bold">$1,600,000</p>
            <button
              type="button"
              className="gradient-cta mt-4 w-full rounded-full py-2.5 text-xs font-semibold text-black"
            >
              Rút tiền
            </button>
          </div>
        </div>

        <div className="glass-panel mt-6 flex items-center justify-between rounded-2xl p-6">
          <div>
            <p className="text-xs text-white/40">Thông tin ngân hàng</p>
            <p className="mt-1 text-sm font-semibold">
              JPMorgan Chase ****4582
            </p>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-[var(--luxora-gold)] hover:underline"
          >
            Chỉnh sửa tài khoản
          </button>
        </div>

        <h2 className="font-headline-md mt-10 mb-4 text-lg">
          Lịch sử chi trả
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">Ngày</th>
                <th className="px-5 py-3 font-medium">Mã tham chiếu</th>
                <th className="px-5 py-3 font-medium">Số tiền</th>
                <th className="px-5 py-3 font-medium">Tài khoản nhận</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {mockPayouts.map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="px-5 py-4 text-white/60">{p.date}</td>
                  <td className="px-5 py-4 text-white/60">{p.ref}</td>
                  <td className="px-5 py-4 font-semibold text-[var(--luxora-gold-light)]">
                    ${p.amount.toLocaleString("en-US")}
                  </td>
                  <td className="px-5 py-4 text-white/60">{p.destination}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        p.status === "processed"
                          ? "bg-green-500/10 text-green-300"
                          : "bg-yellow-500/10 text-yellow-300"
                      }`}
                    >
                      {p.status === "processed" ? "Đã xử lý" : "Đang xử lý"}
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
