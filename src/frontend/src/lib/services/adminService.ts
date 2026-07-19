import { apiClient } from "@/lib/apiClient";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type AdminUser = {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  identityNumber: string | null;
  latestKycCccd?: string | null;
  roleName: string;
  status: string;
  profileStatus: string;
  active: boolean;
  emailVerified: boolean;
  identityVerified: boolean;
  paymentStrikeCount: number;
  lockedByPaymentStrikes: boolean;
};

export type AdminUserStats = Record<string, number>;

export type AdminCategory = {
  categoryId?: number;
  categoryName: string;
  description?: string | null;
  isActive?: boolean;
};

export async function getAdminUsers(q?: string) {
  const query = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
  const response = await apiClient<ApiResponse<AdminUser[]>>(`/admin/users${query}`);
  return response.data;
}

export async function getAdminUserStats() {
  const response = await apiClient<ApiResponse<AdminUserStats>>("/admin/users/stats");
  return response.data;
}

export async function updateAdminUserStatus(userId: number, active: boolean) {
  const response = await apiClient<ApiResponse<AdminUser>>(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: { active },
  });
  return response.data;
}

export async function updateAdminUserRole(userId: number, roleName: string) {
  const response = await apiClient<ApiResponse<AdminUser>>(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: { roleName },
  });
  return response.data;
}

export async function getAdminCategories() {
  const response = await apiClient<ApiResponse<AdminCategory[]>>("/admin/categories");
  return response.data;
}

export async function createAdminCategory(payload: AdminCategory) {
  const response = await apiClient<ApiResponse<AdminCategory>>("/admin/categories", {
    method: "POST",
    body: payload as unknown as Record<string, unknown>,
  });
  return response.data;
}

export async function updateAdminCategory(categoryId: number, payload: AdminCategory) {
  const response = await apiClient<ApiResponse<AdminCategory>>(`/admin/categories/${categoryId}`, {
    method: "PUT",
    body: payload as unknown as Record<string, unknown>,
  });
  return response.data;
}

export async function deleteAdminCategory(categoryId: number) {
  await apiClient<ApiResponse<null>>(`/admin/categories/${categoryId}`, {
    method: "DELETE",
  });
}
