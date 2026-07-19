"use client";

import { useState, useEffect } from "react";

export interface CurrentUser {
  userId: number;
  username: string;
  email: string;
  roleName: string;  // "Admin" | "Staff" | "Seller" | "User"
  status: string;
  token?: string;    // JWT từ backend
}

/** Lấy JWT token từ localStorage */
export function getToken(): string | null {
  try {
    const stored = localStorage.getItem("currentUser");
    if (!stored) return null;
    return (JSON.parse(stored) as CurrentUser).token ?? null;
  } catch {
    return null;
  }
}

/**
 * Trả về user đang đăng nhập từ localStorage.
 * undefined = đang load (chưa đọc localStorage)
 * null      = đã load, chưa đăng nhập
 * CurrentUser = đã đăng nhập
 */
export function useCurrentUser(): CurrentUser | null | undefined {
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentUser");
      setUser(stored ? (JSON.parse(stored) as CurrentUser) : null);
    } catch {
      setUser(null);
    }
  }, []);

  return user;
}

/** Lưu thông tin user vào localStorage sau khi login thành công */
export function saveCurrentUser(user: CurrentUser): void {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

/** Xoá thông tin user khi logout */
export function clearCurrentUser(): void {
  localStorage.removeItem("currentUser");
}

/**
 * Map roleName từ DB → đường dẫn dashboard tương ứng
 *   "Admin"  → /admin
 *   "Staff"  → /staff/support
 *   "Seller" → /inventory
 *   "User"   → /dashboard
 */
export function getDashboardPath(roleName: string): string {
  switch (roleName) {
    case "Admin":  return "/admin";
    case "Staff":  return "/staff/support";
    case "Seller": return "/inventory";
    default:       return "/dashboard";
  }
}
