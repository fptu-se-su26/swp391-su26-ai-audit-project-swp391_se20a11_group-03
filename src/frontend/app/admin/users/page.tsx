import AdminShell from "@/components/shells/AdminShell";

export default function AdminUsersPage() {
  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
          QUẢN TRỊ HỆ THỐNG
        </p>
        <h1 className="font-display-lg mt-2 text-3xl">Người dùng & vai trò</h1>
        <div className="glass-panel mt-6 rounded-2xl p-6 text-sm text-white/60">
          Quản lý người dùng, phân quyền và vai trò hệ thống.
        </div>
      </div>
    </AdminShell>
  );
}
