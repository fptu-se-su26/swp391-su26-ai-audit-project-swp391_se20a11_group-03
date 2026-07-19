import { apiClient } from "@/lib/apiClient";

export type NotificationType =
  | "PRODUCT_APPROVED"
  | "PRODUCT_REJECTED"
  | "AUCTION_STARTING"
  | "AUCTION_ENDING"
  | "OUTBID"
  | "PAYMENT_REQUIRED"
  | "KYC_APPROVED"
  | "KYC_REJECTED"
  | "WITHDRAWAL_APPROVED"
  | "WITHDRAWAL_REJECTED"
  | "BID_PLACED"
  | "GENERAL";

export type AppNotification = {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  referenceId: number | null;
  referenceType: string | null;
  isRead: boolean;
  createdAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export async function getNotifications(): Promise<AppNotification[]> {
  const response = await apiClient<ApiResponse<AppNotification[]>>("/notifications");
  return response.data ?? [];
}

export async function getUnreadNotifications(): Promise<AppNotification[]> {
  const response = await apiClient<ApiResponse<AppNotification[]>>("/notifications/unread");
  return response.data ?? [];
}

export async function getUnreadCount(): Promise<number> {
  const response = await apiClient<ApiResponse<{ count: number }>>("/notifications/unread-count");
  return response.data?.count ?? 0;
}

export async function markAsRead(notificationId: number): Promise<void> {
  await apiClient(`/notifications/${notificationId}/read`, { method: "POST" });
}

export async function markAllAsRead(): Promise<void> {
  await apiClient("/notifications/read-all", { method: "POST" });
}
