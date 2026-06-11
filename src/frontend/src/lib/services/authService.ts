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

export function login(payload: LoginRequest) {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function checkBackendHealth() {
  return apiClient<string>("/alive", {
    method: "GET",
  });
}
