import type { StoredUser } from "@/lib/userSession";
import { isAdmin } from "@/lib/userSession";

/** Routes admin is allowed to visit (management only). */
export function isAdminAllowedPath(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/staff")) return true;
  if (pathname.startsWith("/auth")) return true;
  return false;
}

export function shouldRedirectAdmin(user: StoredUser | null, pathname: string): boolean {
  if (!user || !isAdmin(user)) return false;
  return !isAdminAllowedPath(pathname);
}

export const ADMIN_HOME = "/admin/dashboard";
