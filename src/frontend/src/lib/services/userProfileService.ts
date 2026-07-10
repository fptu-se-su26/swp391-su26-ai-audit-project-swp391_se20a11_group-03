import { apiClient } from "@/lib/apiClient";
import { DEMO_MODE, readDemoUser } from "@/lib/demoMode";

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
  active?: boolean;
  paymentStrikeCount?: number;
  lockedByPaymentStrikes?: boolean;
};

export async function getMyProfile(): Promise<UserProfile> {
  if (DEMO_MODE) {
    const user = readDemoUser();
    if (!user) throw new Error("Demo session not found");
    return { ...user, fullName: user.username, phone: "0901234567", identityNumber: "", identityVerifiedAt: undefined };
  }
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
  if (DEMO_MODE) {
    const user = readDemoUser();
    return { ...user, fullName: payload.fullName, phone: payload.phone };
  }
  const res = await apiClient<{ success: boolean; data: UserProfile; message?: string }>("/users/me/profile", {
    method: "PUT",
    body: payload,
  });
  if (!res?.success) {
    throw new Error(res?.message || "Failed to update profile");
  }
  return res.data ?? {};
}
