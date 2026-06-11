import { apiClient } from "@/lib/apiClient";

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
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  phone: string;
  identityNumber: string;
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

export function login(payload: LoginRequest) {
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
