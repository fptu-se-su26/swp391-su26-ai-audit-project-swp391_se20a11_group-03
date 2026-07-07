import AdminShell from "@/components/shells/AdminShell";

export default function AdminContractsPage() {
  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
          TÀI CHÍNH & PHÁP LÝ
        </p>
        <h1 className="font-display-lg mt-2 text-3xl">Hợp đồng điện tử</h1>
        <div className="glass-panel mt-6 rounded-2xl p-6 text-sm text-white/60">
          Khu vực quản lý hợp đồng điện tử cho các giao dịch đấu giá.
        </div>
      </div>
    </AdminShell>
  );
}
