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

export type AuctionOverview = {
  activeCount: number;
  upcomingCount: number;
  awaitingPaymentCount: number;
  endedCount: number;
  totalCount: number;
  activeSessions: AuctionOverviewItem[];
  upcomingSessions: AuctionOverviewItem[];
  awaitingPaymentSessions: AuctionOverviewItem[];
};

export type AuctionOverviewItem = {
  auctionId: number;
  productId: number | null;
  productName: string;
  sellerName: string;
  status: string;
  paymentStatus: string | null;
  currentBid: number;
  startTime: string | null;
  endTime: string | null;
  totalBids: number;
};

export async function getAuctionOverview() {
  const response = await apiClient<ApiResponse<AuctionOverview>>("/admin/dashboard/auction-overview");
  return response.data;
}

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

export type AuctionSessionRow = {
  auctionId: number;
  productId: number | null;
  productName: string;
  sellerName: string;
  buyerName: string;
  finalPrice: number;
  auctionStatus: string;
  paymentStatus: string;
  paymentCategory: "PAID" | "UNPAID" | "NO_WINNER";
  endTime: string | null;
  paidAt: string | null;
  paymentDeadline: string | null;
};

export async function getAuctionSessions(
  payment: "PAID" | "UNPAID" | "ALL" = "ALL",
  from?: string,
  to?: string,
) {
  const params = new URLSearchParams();
  params.set("payment", payment);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  const response = await apiClient<ApiResponse<AuctionSessionRow[]>>(
    `/admin/dashboard/auction-sessions${query ? `?${query}` : ""}`,
  );
  return response.data;
}

export async function getContracts() {
  const response = await apiClient<ApiResponse<ContractRow[]>>("/admin/dashboard/contracts");
  return response.data;
}
