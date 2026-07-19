import { getStoredToken, resolveApiUrl } from "@/lib/apiClient";
import { apiClient } from "@/lib/apiClient";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type SellerContract = {
  signed: boolean;
  acknowledged?: boolean;
  pendingPersistence?: boolean;
  contractId: number | null;
  signedAt: string | null;
  fileUrl: string | null;
  roleName?: string;
  roleUpgraded?: boolean;
};

const ACK_STORAGE_KEY = "bz_seller_contract_ack";

export function hasLocalSellerContractAck(userId?: number): boolean {
  if (typeof window === "undefined" || userId == null) return false;
  return sessionStorage.getItem(`${ACK_STORAGE_KEY}_${userId}`) === "1";
}

export function setLocalSellerContractAck(userId?: number): void {
  if (typeof window === "undefined" || userId == null) return;
  sessionStorage.setItem(`${ACK_STORAGE_KEY}_${userId}`, "1");
}

export function clearLocalSellerContractAck(userId?: number): void {
  if (typeof window === "undefined" || userId == null) return;
  sessionStorage.removeItem(`${ACK_STORAGE_KEY}_${userId}`);
}

/** Acknowledge agreement (no DB write, no role change). */
export async function acknowledgeSellerContract() {
  const response = await apiClient<ApiResponse<SellerContract>>("/seller-contract/sign", {
    method: "POST",
  });
  return response.data;
}

/** @deprecated Use acknowledgeSellerContract + submitSellerRegistration */
export async function signSellerContract() {
  return acknowledgeSellerContract();
}

/** Persist contract PDF and upgrade to Seller (requires KYC approved). */
export async function submitSellerRegistration() {
  const response = await apiClient<ApiResponse<SellerContract>>("/seller-contract/submit", {
    method: "POST",
  });
  return response.data;
}

export async function getMySellerContract() {
  const response = await apiClient<ApiResponse<SellerContract>>("/seller-contract/me");
  return response.data;
}

export async function getSellerContractByUser(userId: number) {
  const response = await apiClient<ApiResponse<SellerContract>>(`/seller-contract/user/${userId}`);
  return response.data;
}

export function sellerContractPdfUrl(fileUrl: string | null): string | null {
  if (!fileUrl) return null;
  return resolveApiUrl(fileUrl);
}

/** Fetches the watermarked preview PDF (requires JWT). Returns a blob object URL. */
export async function fetchSellerContractPreviewBlobUrl(): Promise<string> {
  const token = getStoredToken();
  const response = await fetch(resolveApiUrl("/seller-contract/preview-pdf"), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error("Không thể tải bản xem trước hợp đồng PDF.");
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/** Fetches signed seller contract PDF (requires JWT). */
export async function fetchSellerContractPdfBlobUrl(userId?: number): Promise<string> {
  const token = getStoredToken();
  const path = userId != null ? `/seller-contract/user/${userId}/pdf` : "/seller-contract/me/pdf";
  const response = await fetch(resolveApiUrl(path), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error("Không thể tải hợp đồng PDF.");
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function openSellerContractPdf(userId?: number): Promise<void> {
  const url = await fetchSellerContractPdfBlobUrl(userId);
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
