"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, subscribeStoredUser } from "@/lib/userSession";
import { ADMIN_HOME, shouldRedirectAdmin } from "@/lib/roleRouting";

/**
 * Keeps Admin users on management routes only — no collector/buyer UI.
 * Redirect runs client-side only to avoid hydration mismatch (localStorage).
 */
export default function AdminRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const check = () => {
      const user = getStoredUser();
      if (shouldRedirectAdmin(user, pathname)) {
        router.replace(ADMIN_HOME);
      }
    };
    check();
    return subscribeStoredUser(check);
  }, [pathname, router]);

  return <>{children}</>;
}
