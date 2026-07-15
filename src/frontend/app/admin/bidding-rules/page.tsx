import AdminShell from "@/components/shells/AdminShell";

export default function AdminBiddingRulesPage() {
  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
          QUẢN TRỊ HỆ THỐNG
        </p>
        <h1 className="font-display-lg mt-2 text-3xl">Luật đấu giá</h1>
        <div className="glass-panel mt-6 rounded-2xl p-6 text-sm text-white/60">
          Thiết lập bước giá, thời gian gia hạn và các quy tắc đấu giá.
        </div>
      </div>
    </AdminShell>
  );
}
