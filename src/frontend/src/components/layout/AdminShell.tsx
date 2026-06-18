"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import { getStoredUser, isAdmin } from "@/lib/userSession";

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (!user || !isAdmin(user)) {
      router.replace("/auth");
    }
  }, [router]);

  return (
    <div className="flex overflow-hidden h-screen">
      <AdminSidebar />
      <main className="ml-80 flex-1 h-screen overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
