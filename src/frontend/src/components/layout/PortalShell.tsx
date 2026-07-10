"use client";

import type { ReactNode } from "react";
import AdminShell from "@/components/layout/AdminShell";
import StaffShell from "@/components/layout/StaffShell";
import { getStoredUser, isAdmin } from "@/lib/userSession";

/** Staff workspace routes: Admin keeps AdminShell sidebar; pure Staff uses StaffShell. */
export default function PortalShell({ children }: { children: ReactNode }) {
  const user = getStoredUser();
  if (isAdmin(user)) {
    return <AdminShell>{children}</AdminShell>;
  }
  return <StaffShell>{children}</StaffShell>;
}
