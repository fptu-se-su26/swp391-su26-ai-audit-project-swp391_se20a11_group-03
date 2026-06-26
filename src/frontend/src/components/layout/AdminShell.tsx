"use client";

import { Suspense, useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import { getStoredUser, isAdmin } from "@/lib/userSession";

function SidebarFallback() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[72px] border-r border-[#1e2d3d] bg-[#071626] xl:w-60" />
  );
}

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
      <Suspense fallback={<SidebarFallback />}>
        <AdminSidebar />
      </Suspense>
      <main className="ml-[72px] flex-1 h-screen overflow-y-auto bg-[#f4f1ea] xl:ml-60">{children}</main>
    </div>
  );
}
