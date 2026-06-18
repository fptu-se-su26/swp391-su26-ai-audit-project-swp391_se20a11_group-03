"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import {
  AdminUser,
  AdminUserStats,
  getAdminUserStats,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "@/lib/services/adminService";

const ROLE_OPTIONS = ["User", "Seller", "Staff", "Admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminUserStats>({});
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [userList, userStats] = await Promise.all([
        getAdminUsers(),
        getAdminUserStats(),
      ]);
      setUsers(userList);
      setStats(userStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot load admin users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const roles = useMemo(
    () => Array.from(new Set(users.map((user) => user.roleName))).sort(),
    [users],
  );

  const filteredUsers = users.filter((user) => {
    const haystack = `${user.fullName} ${user.email} ${user.phone}`.toLowerCase();
    const matchesSearch = haystack.includes(query.trim().toLowerCase());
    const matchesRole = roleFilter === "all" || user.roleName === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleUser = async (user: AdminUser) => {
    const updated = await updateAdminUserStatus(user.userId, !user.active);
    setUsers((current) =>
      current.map((item) => (item.userId === updated.userId ? updated : item)),
    );
  };

  const changeRole = async (user: AdminUser, roleName: string) => {
    const updated = await updateAdminUserRole(user.userId, roleName);
    setUsers((current) =>
      current.map((item) => (item.userId === updated.userId ? updated : item)),
    );
  };

  return (
    <AdminShell>
      <div className="mx-auto max-w-[1400px] space-y-lg p-margin-mobile md:p-margin-desktop">
        <div>
          <h1 className="font-display-lg-mobile text-primary md:font-display-lg">User Management</h1>
          <p className="mt-xs font-body-lg text-on-surface-variant">
            Manage customer, seller, staff, and admin accounts.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-md xl:grid-cols-5">
          {["Total", "Active", "User", "Seller", "Staff"].map((key) => (
            <div key={key} className="rounded-xl border border-surface-variant bg-surface p-md soft-shadow">
              <p className="font-label-md text-label-md text-on-surface-variant">{key}</p>
              <p className="mt-xs font-headline-md text-headline-md font-bold text-primary">
                {stats[key] ?? 0}
              </p>
            </div>
          ))}
        </div>

        <section className="rounded-xl border border-surface-variant bg-surface p-lg soft-shadow">
          <div className="mb-md flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-sm md:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, email, or phone"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm outline-none focus:border-secondary md:w-80"
              />
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm outline-none focus:border-secondary"
              >
                <option value="all">All roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => void loadData()}
              className="rounded-lg border border-outline-variant px-md py-sm font-label-md text-label-md hover:bg-surface-container-low"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-md rounded-lg bg-error-container px-md py-sm text-on-error-container">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-xl text-center text-on-surface-variant">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-surface-variant bg-surface-container-low">
                    {["User", "Role", "KYC", "Status", "Action"].map((heading) => (
                      <th key={heading} className="p-md font-label-sm text-label-sm text-on-surface-variant">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.userId} className="border-b border-surface-variant hover:bg-surface-container-lowest">
                      <td className="p-md">
                        <p className="font-label-md text-label-md text-primary">{user.fullName}</p>
                        <p className="text-sm text-on-surface-variant">{user.email}</p>
                        <p className="text-xs text-on-surface-variant">{user.phone}</p>
                      </td>
                      <td className="p-md">
                        <select
                          value={user.roleName}
                          onChange={(event) => void changeRole(user, event.target.value)}
                          className="rounded-lg border border-outline-variant bg-surface-container-low px-sm py-xs text-sm outline-none focus:border-secondary"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-md">
                        <span className={user.identityVerified ? "text-on-tertiary-container" : "text-on-surface-variant"}>
                          {user.identityVerified ? "Verified" : "Not verified"}
                        </span>
                      </td>
                      <td className="p-md">
                        <span className={user.active ? "text-on-tertiary-container" : "text-error"}>
                          {user.active ? "ACTIVE" : "LOCKED"}
                        </span>
                      </td>
                      <td className="p-md">
                        <button
                          onClick={() => void toggleUser(user)}
                          className={`rounded-lg px-md py-sm font-label-sm text-label-sm ${
                            user.active
                              ? "bg-error-container text-on-error-container hover:opacity-90"
                              : "bg-tertiary-fixed text-on-tertiary-fixed-variant hover:opacity-90"
                          }`}
                        >
                          {user.active ? "Lock" : "Unlock"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
