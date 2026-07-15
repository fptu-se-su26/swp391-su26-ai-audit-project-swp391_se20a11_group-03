import AdminShell from "@/components/shells/AdminShell";

export default function AdminSalesHistoryPage() {
  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
          ĐẤU GIÁ
        </p>
        <h1 className="font-display-lg mt-2 text-3xl">Lịch sử mua bán</h1>
        <div className="glass-panel mt-6 rounded-2xl p-6 text-sm text-white/60">
          Danh sách giao dịch mua bán sẽ được đồng bộ tại đây.
        </div>
      </div>
    </AdminShell>
  );
}
