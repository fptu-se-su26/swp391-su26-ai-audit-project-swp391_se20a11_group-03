"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import StaffSidebar from "./StaffSidebar";
import { getStoredUser, isAdmin, isStaff } from "@/lib/userSession";

export default function StaffShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Staff workspaces are available to both Staff and Admin (admin inherits staff tools).
  useEffect(() => {
    const user = getStoredUser();
    if (!user || (!isStaff(user) && !isAdmin(user))) {
      router.replace("/auth");
    }
  }, [router]);

  return (
    <div className="flex overflow-hidden h-screen">
      <StaffSidebar />
      <main className="ml-72 flex-1 h-screen overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
