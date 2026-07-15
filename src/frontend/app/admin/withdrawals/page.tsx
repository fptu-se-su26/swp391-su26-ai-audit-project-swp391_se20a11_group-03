import AdminShell from "@/components/shells/AdminShell";

export default function AdminWithdrawalsPage() {
  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
          VẬN HÀNH
        </p>
        <h1 className="font-display-lg mt-2 text-3xl">Duyệt rút tiền</h1>
        <div className="mt-6 grid gap-4">
          {[
            { user: "Trần Văn Đức", amount: "$12,500", status: "Chờ duyệt" },
            { user: "Lê Thu Hà", amount: "$8,300", status: "Đang kiểm tra" },
            { user: "Vũ Anh Tuấn", amount: "$4,100", status: "Chờ duyệt" },
          ].map((item) => (
            <div
              key={`${item.user}-${item.amount}`}
              className="glass-panel flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{item.user}</p>
                <p className="mt-1 text-sm text-white/45">{item.status}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-[var(--luxora-gold-light)]">
                  {item.amount}
                </span>
                <button
                  type="button"
                  className="rounded-full bg-[var(--luxora-gold)] px-4 py-2 text-xs font-semibold text-black"
                >
                  Duyệt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
