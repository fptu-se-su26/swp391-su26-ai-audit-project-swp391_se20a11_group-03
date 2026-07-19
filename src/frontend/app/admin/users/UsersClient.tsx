"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { adminApi, ApiError, type AdminUser } from "@/lib/api";

const ROLES = ["User", "Seller", "Staff", "Admin"] as const;

const ROLE_CLASS: Record<string, string> = {
  Admin: "bg-red-500/10 text-red-300",
  Staff: "bg-blue-500/10 text-blue-300",
  Seller: "bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold-light)]",
  User: "bg-white/10 text-white/60",
};

export default function UsersClient() {
  const t = useTranslations("adminUsersPage");
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
      setError(err instanceof ApiError ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    void load(query.trim());
  }

  async function changeRole(user: AdminUser, roleName: string) {
    if (roleName === user.roleName) return;
    if (!window.confirm(t("changeRoleConfirm", { email: user.email, role: roleName }))) return;
    setBusyId(user.userId);
    setNotice(null);
    setError(null);
    try {
      const res = await adminApi.updateUserRole(user.userId, roleName);
      setUsers((prev) => prev.map((u) => (u.userId === user.userId ? res.data : u)));
      setNotice(t("changeRoleNotice", { email: user.email, role: roleName }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("changeRoleError"));
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(user: AdminUser) {
    const next = !user.active;
    if (!window.confirm(t("toggleConfirm", { action: next ? t("unlockAction") : t("lockAction"), email: user.email }))) return;
    setBusyId(user.userId);
    setNotice(null);
    setError(null);
    try {
      const res = await adminApi.updateUserStatus(user.userId, next);
      setUsers((prev) => prev.map((u) => (u.userId === user.userId ? res.data : u)));
      setNotice(t("toggleNotice", { action: next ? t("unlockedAction") : t("lockedAction"), email: user.email }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("statusError"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
        {t("badge")}
      </p>
      <h1 className="font-display-lg mt-2 text-3xl">{t("title")}</h1>

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
          placeholder={t("searchPlaceholder")}
          className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
        />
        <button
          type="submit"
          className="rounded-xl bg-[var(--luxora-gold)] px-5 py-2.5 text-sm font-semibold text-black"
        >
          {t("search")}
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
              <th className="px-4 py-3">{t("user")}</th>
              <th className="px-4 py-3">{t("phone")}</th>
              <th className="px-4 py-3">KYC</th>
              <th className="px-4 py-3">{t("role")}</th>
              <th className="px-4 py-3">{t("status")}</th>
              <th className="px-4 py-3">Strike</th>
              <th className="px-4 py-3 text-right">{t("actions")}</th>
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
                        {t("verified")}
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/50">
                        {t("notYet")}
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
                      {u.active ? t("active") : t("locked")}
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
                      {busy ? "..." : u.active ? t("lockAction") : t("unlockAction")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loading && <p className="p-6 text-center text-sm text-white/40">{t("loading")}</p>}
        {!loading && users.length === 0 && (
          <p className="p-6 text-center text-sm text-white/40">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
