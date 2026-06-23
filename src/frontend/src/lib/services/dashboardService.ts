import { apiClient } from "@/lib/apiClient";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type DashboardSummary = {
  totalUsers: number;
  totalProducts: number;
  totalAuctions: number;
  activeAuctions: number;
  totalRevenue: number;
  totalTopUps: number;
  depositsHeld: number;
  pendingWithdrawals: number;
  adminBalance: number;
};

export type DailyRevenue = {
  date: string;
  amount: number;
  count: number;
};

export type SalesHistoryRow = {
  auctionId: number;
  productId: number | null;
  productName: string;
  sellerName: string;
  buyerName: string;
  finalPrice: number;
  commission: number;
  sellerPayout: number;
  status: string;
  paymentStatus: string;
  paidAt: string | null;
};

export type ContractRow = {
  contractId: number;
  contractType: string;
  typeLabel: string;
  referenceId: number;
  referenceName: string;
  fileUrl: string | null;
  createdAt: string | null;
};

export async function getDashboardSummary() {
  const response = await apiClient<ApiResponse<DashboardSummary>>("/admin/dashboard/summary");
  return response.data;
}

export async function getDashboardRevenue(
  groupBy: "day" | "month" = "day",
  from?: string,
  to?: string,
) {
  const params = new URLSearchParams();
  params.set("groupBy", groupBy);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  const response = await apiClient<ApiResponse<DailyRevenue[]>>(
    `/admin/dashboard/revenue${query ? `?${query}` : ""}`,
  );
  return response.data;
}

export async function getSalesHistory() {
  const response = await apiClient<ApiResponse<SalesHistoryRow[]>>("/admin/dashboard/sales-history");
  return response.data;
}

export async function getContracts() {
  const response = await apiClient<ApiResponse<ContractRow[]>>("/admin/dashboard/contracts");
  return response.data;
}
