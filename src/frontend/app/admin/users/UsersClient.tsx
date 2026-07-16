"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiError, type AdminUser } from "@/lib/api";

const ROLES = ["User", "Seller", "Staff", "Admin"] as const;

const ROLE_CLASS: Record<string, string> = {
  Admin: "bg-red-500/10 text-red-300",
  Staff: "bg-blue-500/10 text-blue-300",
  Seller: "bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold-light)]",
  User: "bg-white/10 text-white/60",
};

export default function UsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminApi.users(q),
        adminApi.userStats(),
      ]);
      setUsers(usersRes.data ?? []);
      setStats(statsRes.data ?? {});
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    void load(query.trim());
  }

  async function changeRole(user: AdminUser, roleName: string) {
    if (roleName === user.roleName) return;
    if (!window.confirm(`Đổi vai trò của ${user.email} thành ${roleName}?`)) return;
    setBusyId(user.userId);
    setNotice(null);
    setError(null);
    try {
      const res = await adminApi.updateUserRole(user.userId, roleName);
      setUsers((prev) => prev.map((u) => (u.userId === user.userId ? res.data : u)));
      setNotice(`Đã đổi vai trò của ${user.email} thành ${roleName}.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể đổi vai trò.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(user: AdminUser) {
    const next = !user.active;
    if (!window.confirm(`${next ? "Mở khóa" : "Khóa"} tài khoản ${user.email}?`)) return;
    setBusyId(user.userId);
    setNotice(null);
    setError(null);
    try {
      const res = await adminApi.updateUserStatus(user.userId, next);
      setUsers((prev) => prev.map((u) => (u.userId === user.userId ? res.data : u)));
      setNotice(`Đã ${next ? "mở khóa" : "khóa"} tài khoản ${user.email}.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể cập nhật trạng thái.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
        QUẢN TRỊ HỆ THỐNG
      </p>
      <h1 className="font-display-lg mt-2 text-3xl">Người dùng &amp; vai trò</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(stats).map(([label, value]) => (
          <div key={label} className="glass-panel rounded-2xl p-4">
            <p className="text-[11px] text-white/40">{label}</p>
            <p className="mt-1 text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSearch} className="mt-6 flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên, email, SĐT, CCCD..."
          className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
        />
        <button
          type="submit"
          className="rounded-xl bg-[var(--luxora-gold)] px-5 py-2.5 text-sm font-semibold text-black"
        >
          Tìm
        </button>
      </form>

      {notice && (
        <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {notice}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="glass-panel mt-6 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-white/40">
              <th className="px-4 py-3">Người dùng</th>
              <th className="px-4 py-3">SĐT</th>
              <th className="px-4 py-3">KYC</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Strike</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => {
              const busy = busyId === u.userId;
              return (
                <tr key={u.userId} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.fullName ?? "—"}</p>
                    <p className="text-xs text-white/40">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-white/60">{u.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    {u.identityVerified ? (
                      <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold text-green-300">
                        Đã xác thực
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/50">
                        Chưa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.roleName ?? "User"}
                      disabled={busy}
                      onChange={(e) => void changeRole(u, e.target.value)}
                      className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold outline-none ${ROLE_CLASS[u.roleName ?? "User"] ?? "bg-white/10"}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r} className="bg-[#111] text-white">
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        u.active ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {u.active ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {u.paymentStrikeCount}
                    {u.lockedByPaymentStrikes ? " ⚠" : ""}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void toggleActive(u)}
                      className={`rounded-full px-4 py-1.5 text-[11px] font-semibold disabled:opacity-50 ${
                        u.active
                          ? "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                          : "bg-green-500/10 text-green-300 hover:bg-green-500/20"
                      }`}
                    >
                      {busy ? "..." : u.active ? "Khóa" : "Mở khóa"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loading && <p className="p-6 text-center text-sm text-white/40">Đang tải...</p>}
        {!loading && users.length === 0 && (
          <p className="p-6 text-center text-sm text-white/40">Không tìm thấy người dùng nào.</p>
        )}
      </div>
    </div>
  );
}
