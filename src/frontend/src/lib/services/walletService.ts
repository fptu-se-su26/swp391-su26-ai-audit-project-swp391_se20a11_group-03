import { apiClient } from "@/lib/apiClient";

export type Wallet = {
  walletId: number;
  userId: number;
  balance: number;
  holdBalance: number;
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

export function getWithdrawals(status = "PENDING") {
  return apiClient<Withdrawal[]>(`/staff/withdrawals?status=${encodeURIComponent(status)}`);
}

export function updateWithdrawalStatus(id: number, status: "COMPLETED" | "REJECTED") {
  return apiClient<Withdrawal>(`/staff/withdrawals/${id}/status`, {
    method: "PUT",
    body: { status },
  });
}
