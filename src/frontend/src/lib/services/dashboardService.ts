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
  identityNumber?: string | null;
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

export async function getContracts(cccd?: string) {
  const query = cccd?.trim() ? `?cccd=${encodeURIComponent(cccd.trim())}` : "";
  const response = await apiClient<ApiResponse<ContractRow[]>>(`/admin/dashboard/contracts${query}`);
  return response.data;
}

export type WalletLedgerRow = {
  id: number;
  userId: number | null;
  userName: string;
  userEmail?: string | null;
  amount: number;
  status: string;
  description?: string | null;
  referenceCode?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  staffNote?: string | null;
  createdAt: string | null;
  updatedAt?: string | null;
};

export async function getDepositHistory() {
  const response = await apiClient<ApiResponse<WalletLedgerRow[]>>("/admin/dashboard/deposit-history");
  return response.data;
}

export async function getWithdrawalHistory(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await apiClient<ApiResponse<WalletLedgerRow[]>>(
    `/admin/dashboard/withdrawal-history${query}`,
  );
  return response.data;
}

export type BalanceLedgerRow = {
  transactionId: number;
  walletId: number | null;
  userId: number | null;
  userName: string;
  transactionType: string;
  transactionTypeLabel: string;
  amount: number;
  signedAmount: number;
  direction: "CREDIT" | "DEBIT";
  status: string;
  referenceCode: string | null;
  description: string | null;
  createdAt: string | null;
};

export async function getBalanceLedger(params?: {
  from?: string;
  to?: string;
  userId?: number;
  type?: string;
}) {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  if (params?.userId != null) search.set("userId", String(params.userId));
  if (params?.type) search.set("type", params.type);
  const query = search.toString();
  const response = await apiClient<ApiResponse<BalanceLedgerRow[]>>(
    `/admin/dashboard/balance-ledger${query ? `?${query}` : ""}`,
  );
  return response.data;
}

export async function openContractPdf(contractId: number): Promise<void> {
  const { getStoredToken, resolveApiUrl } = await import("@/lib/apiClient");
  const token = getStoredToken();
  const res = await fetch(resolveApiUrl(`/admin/dashboard/contracts/${contractId}/pdf`), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error("Không thể mở file PDF hợp đồng.");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
