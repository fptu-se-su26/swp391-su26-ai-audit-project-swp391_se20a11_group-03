"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import {
  AdminUser,
  AdminUserStats,
  getAdminUserStats,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "@/lib/services/adminService";
import { useTranslations } from "@/i18n/I18nProvider";

const ROLE_OPTIONS = ["User", "Seller", "Staff", "Admin"];
const STAT_KEYS = ["Total", "Active", "User", "Seller", "Staff"] as const;
const STAT_LABEL_KEYS: Record<(typeof STAT_KEYS)[number], string> = {
  Total: "statTotal",
  Active: "statActive",
  User: "statUser",
  Seller: "statSeller",
  Staff: "statStaff",
};

function displayCccd(user: AdminUser): string {
  return user.identityNumber || user.latestKycCccd || "—";
}

export default function AdminUsersPage() {
  const t = useTranslations("adminUsers");
  const tc = useTranslations("common");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminUserStats>({});
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async (q: string) => {
    setLoading(true);
    setError("");
    try {
      const userList = await getAdminUsers(q || undefined);
      setUsers(userList);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const userStats = await getAdminUserStats();
      setStats(userStats);
    } catch {
      // stats are best-effort
    }
  }, []);

  useEffect(() => {
    void loadUsers(appliedQuery);
  }, [appliedQuery, loadUsers]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const roles = useMemo(
    () => Array.from(new Set(users.map((user) => user.roleName))).sort(),
    [users],
  );

  const filteredUsers = users.filter((user) => roleFilter === "all" || user.roleName === roleFilter);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setAppliedQuery(searchInput.trim());
  }

  function handleClearSearch() {
    setSearchInput("");
    setAppliedQuery("");
  }

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
          <h1 className="font-display-lg-mobile text-primary md:font-display-lg">{t("pageTitle")}</h1>
          <p className="mt-xs font-body-lg text-on-surface-variant">{t("pageSubtitle")}</p>
        </div>

        <div className="grid grid-cols-2 gap-md xl:grid-cols-5">
          {STAT_KEYS.map((key) => (
            <div key={key} className="rounded-xl border border-surface-variant bg-surface p-md soft-shadow">
              <p className="font-label-md text-label-md text-on-surface-variant">{t(STAT_LABEL_KEYS[key])}</p>
              <p className="mt-xs font-headline-md text-headline-md font-bold text-primary">
                {stats[key] ?? 0}
              </p>
            </div>
          ))}
        </div>

        <section className="rounded-xl border border-surface-variant bg-surface p-lg soft-shadow">
          <form onSubmit={handleSearch} className="mb-md flex flex-col gap-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-sm md:flex-row md:items-center">
              <div className="relative md:w-96">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
                  search
                </span>
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-sm pl-11 pr-3 outline-none focus:border-secondary"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm font-label-md text-label-md text-on-primary"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                {t("search")}
              </button>
              {appliedQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="rounded-lg border border-outline-variant px-md py-sm font-label-md text-label-md hover:bg-surface-container-low"
                >
                  {t("clearFilter")}
                </button>
              )}
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm outline-none focus:border-secondary"
              >
                <option value="all">{t("allRoles")}</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                void loadUsers(appliedQuery);
                void loadStats();
              }}
              className="rounded-lg border border-outline-variant px-md py-sm font-label-md text-label-md hover:bg-surface-container-low"
            >
              {t("refresh")}
            </button>
          </form>

          {appliedQuery && (
            <p className="mb-md text-sm text-on-surface-variant">
              {t("resultsFor")} <span className="font-semibold text-primary">&quot;{appliedQuery}&quot;</span> ({t("accountsCount", { count: filteredUsers.length })})
            </p>
          )}

          {error && (
            <div className="mb-md rounded-lg bg-error-container px-md py-sm text-on-error-container">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-xl text-center text-on-surface-variant">{tc("loading")}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-xl text-center text-on-surface-variant">{t("noUsersFound")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-surface-variant bg-surface-container-low">
                    {[t("tableUser"), t("tableIdNumber"), t("tableRole"), t("tableKyc"), t("tablePaymentStrikes"), t("tableStatus"), t("tableActions")].map((heading) => (
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
                      <td className="p-md font-mono text-sm text-on-surface-variant">{displayCccd(user)}</td>
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
                          {user.identityVerified ? t("kycVerified") : t("kycUnverified")}
                        </span>
                      </td>
                      <td className="p-md">
                        <div className="flex flex-col gap-1">
                          <span
                            className={
                              (user.paymentStrikeCount ?? 0) >= 3
                                ? "font-semibold text-error"
                                : (user.paymentStrikeCount ?? 0) >= 1
                                  ? "font-semibold text-amber-700"
                                  : "text-on-surface-variant"
                            }
                          >
                            {user.paymentStrikeCount ?? 0}/3
                          </span>
                          {user.lockedByPaymentStrikes && (
                            <span className="inline-flex w-fit rounded-full bg-error-container px-2 py-0.5 text-[10px] font-bold uppercase text-on-error-container">
                              {t("paymentLockBadge")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-md">
                        <span className={user.active ? "text-on-tertiary-container" : "text-error"}>
                          {user.active ? "ACTIVE" : "LOCKED"}
                        </span>
                      </td>
                      <td className="p-md">
                        <button
                          onClick={() => void toggleUser(user)}
                          title={
                            !user.active && user.lockedByPaymentStrikes
                              ? t("unlockStrikeHint")
                              : undefined
                          }
                          className={`rounded-lg px-md py-sm font-label-sm text-label-sm ${
                            user.active
                              ? "bg-error-container text-on-error-container hover:opacity-90"
                              : "bg-tertiary-fixed text-on-tertiary-fixed-variant hover:opacity-90"
                          }`}
                        >
                          {user.active ? t("lock") : t("unlock")}
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
