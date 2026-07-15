"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import StaffSidebar from "./StaffSidebar";
import { useCurrentUser, getDashboardPath } from "@/lib/useCurrentUser";

export default function StaffShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    if (user === undefined) return; // still loading localStorage
    if (user === null) {
      router.replace("/auth");
      return;
    }
    if (user.roleName !== "Staff") {
      router.replace(getDashboardPath(user.roleName));
    }
  }, [user, router]);

  // Loading: don't flash content before redirect
  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-secondary text-[36px]">sync</span>
      </div>
    );
  }

  // Not logged in or wrong role: render nothing (redirect in progress)
  if (!user || user.roleName !== "Staff") return null;

  return (
    <div className="flex overflow-hidden h-screen">
      <StaffSidebar />
      <main className="ml-72 flex-1 h-screen overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
