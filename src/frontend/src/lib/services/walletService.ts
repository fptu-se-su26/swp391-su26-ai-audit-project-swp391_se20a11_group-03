import { apiClient } from "@/lib/apiClient";

export type Wallet = {
  walletId: number;
  userId: number;
  balance: number;
  holdBalance: number;
  availableBalance?: number;
  status: string;
};

export type DepositQr = {
  amount: number;
  bankId: string;
  bankAccount: string;
  accountName: string;
  content: string;
  qrUrl: string;
};

export type Withdrawal = {
  id: number;
  userId: number;
  userName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: string;
  staffNote?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WithdrawPayload = {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export function getMyWallet() {
  return apiClient<Wallet>("/wallet");
}

export function createDepositQr(amount: number) {
  return apiClient<DepositQr>("/wallet/deposit", {
    method: "POST",
    body: { amount },
  });
}

export function createWithdrawal(payload: WithdrawPayload) {
  return apiClient<Withdrawal>("/wallet/withdraw", {
    method: "POST",
    body: payload,
  });
}

export function getMyWithdrawals() {
  return apiClient<Withdrawal[]>("/wallet/withdrawals");
}

export type WalletTransaction = {
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

export function getMyTransactions(params?: { from?: string; to?: string; type?: string }) {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  if (params?.type) search.set("type", params.type);
  const query = search.toString();
  return apiClient<WalletTransaction[]>(`/wallet/transactions${query ? `?${query}` : ""}`);
}

export function getWithdrawals(status = "PENDING") {
  return apiClient<Withdrawal[]>(`/staff/withdrawals?status=${encodeURIComponent(status)}`);
}

export function updateWithdrawalStatus(id: number, status: "COMPLETED" | "REJECTED") {
  return apiClient<Withdrawal>(`/staff/withdrawals/${id}/status`, {
    method: "PUT",
    body: { status },
  });
}
