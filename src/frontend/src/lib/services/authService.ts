import { apiClient } from "@/lib/apiClient";
import { createDemoUser, DEMO_MODE } from "@/lib/demoMode";

export type LoginRequest = {
  usernameOrEmail: string;
  password: string;
};

export type LoginResponse = {
  userId: number;
  username: string;
  email: string;
  roleName: string;
  status: string;
  token: string;
  identityVerified: boolean;
  profileStatus: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  userId?: number;
  fullName?: string;
  email?: string;
  status?: string;
};

export async function login(payload: LoginRequest) {
  if (DEMO_MODE) {
    if (payload.password !== "demo123") throw new Error("Demo password is demo123");
    await new Promise((resolve) => setTimeout(resolve, 350));
    return createDemoUser(payload.usernameOrEmail || "demo@luxeauction.vn") as LoginResponse;
  }
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function register(payload: RegisterRequest) {
  return apiClient<RegisterResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function checkBackendHealth() {
  return apiClient<string>("/alive", {
    method: "GET",
  });
}

export type SelectRoleRequest = {
  userId: number;
  role: "Seller" | "User";
};

export type SelectRoleResponse = {
  success: boolean;
  message: string;
  userId?: number;
  roleName?: string;
  previousRole?: string;
};

export function selectRole(payload: SelectRoleRequest) {
  return apiClient<SelectRoleResponse>("/auth/select-role", {
    method: "POST",
    body: payload as unknown as Record<string, unknown>,
  });
}
