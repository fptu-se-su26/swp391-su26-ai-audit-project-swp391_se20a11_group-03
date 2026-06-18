import { apiClient } from "@/lib/apiClient";

export type UserProfile = {
  userId?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  identityNumber?: string;
  roleName?: string;
  status?: string;
  identityVerified?: boolean;
  profileStatus?: string;
  identityVerifiedAt?: string;
};

export async function getMyProfile(): Promise<UserProfile> {
  const res = await apiClient<{ success: boolean; data: UserProfile; message?: string }>("/users/me/profile");
  if (!res?.success) {
    throw new Error(res?.message || "Failed to load profile");
  }
  return res.data ?? {};
}

export async function updateMyProfile(payload: {
  fullName: string;
  phone: string;
}): Promise<UserProfile> {
  const res = await apiClient<{ success: boolean; data: UserProfile; message?: string }>("/users/me/profile", {
    method: "PUT",
    body: payload,
  });
  if (!res?.success) {
    throw new Error(res?.message || "Failed to update profile");
  }
  return res.data ?? {};
}
