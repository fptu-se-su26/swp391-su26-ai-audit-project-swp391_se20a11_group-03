import { apiClient, getStoredToken, resolveApiUrl } from "@/lib/apiClient";

export type PurchaseContract = {
  signed: boolean;
  acknowledged?: boolean;
  contractId: number | null;
  fileUrl: string | null;
  signedAt: string | null;
  finalPrice: number | null;
  productName: string | null;
  auctionId?: number;
  productId?: number | null;
  sellerName?: string;
  sellerEmail?: string;
  buyerName?: string;
  buyerEmail?: string;
  adminName?: string;
  adminEmail?: string;
};

export type PurchaseContractPreview = PurchaseContract & {
  auctionId: number;
  productId: number | null;
  sellerName: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  adminName: string;
  adminEmail: string;
};

export async function getPurchaseContract(auctionId: number): Promise<PurchaseContractPreview> {
  return apiClient<PurchaseContractPreview>(`/auctions/${auctionId}/purchase-contract`);
}

/** @deprecated use getPurchaseContract — same response */
export async function getPurchaseContractPreview(auctionId: number): Promise<PurchaseContractPreview> {
  return getPurchaseContract(auctionId);
}

export async function signPurchaseContract(auctionId: number): Promise<PurchaseContract & { success: boolean; message?: string }> {
  return apiClient(`/auctions/${auctionId}/purchase-contract/sign`, { method: "POST" });
}

export function purchaseContractPdfUrl(fileUrl: string | null): string | null {
  if (!fileUrl) return null;
  return resolveApiUrl(fileUrl);
}

export async function fetchPurchaseContractPdfBlobUrl(auctionId: number): Promise<string> {
  const token = getStoredToken();
  const response = await fetch(resolveApiUrl(`/auctions/${auctionId}/purchase-contract/pdf`), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error("Không thể tải hợp đồng mua bán PDF.");
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function openPurchaseContractPdf(auctionId: number): Promise<void> {
  const url = await fetchPurchaseContractPdfBlobUrl(auctionId);
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
