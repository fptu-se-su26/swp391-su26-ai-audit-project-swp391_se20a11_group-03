"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser, getDashboardPath } from "@/lib/useCurrentUser";

/**
 * Trang này chỉ còn dùng để redirect sau khi đã login.
 * Nếu chưa login → về /auth. Nếu đã login → về dashboard theo role.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const currentUser = useCurrentUser();

  useEffect(() => {
    // useCurrentUser dùng useEffect nên currentUser=null ở render đầu tiên
    // Chỉ redirect khi đã hydrate xong
    const stored = localStorage.getItem("currentUser");
    if (!stored) {
      router.replace("/auth");
    } else {
      try {
        const user = JSON.parse(stored);
        router.replace(getDashboardPath(user.roleName));
      } catch {
        router.replace("/auth");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a192f]">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-secondary text-[48px] animate-spin">sync</span>
        <p className="text-white font-label-md">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
