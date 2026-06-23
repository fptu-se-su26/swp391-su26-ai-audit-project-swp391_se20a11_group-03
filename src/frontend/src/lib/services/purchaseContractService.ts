import { apiClient, resolveApiUrl } from "@/lib/apiClient";

export type PurchaseContract = {
  signed: boolean;
  contractId: number | null;
  fileUrl: string | null;
  signedAt: string | null;
  finalPrice: number | null;
  productName: string | null;
};

export async function getPurchaseContract(auctionId: number): Promise<PurchaseContract> {
  return apiClient<PurchaseContract>(`/auctions/${auctionId}/purchase-contract`);
}

export async function signPurchaseContract(auctionId: number): Promise<PurchaseContract & { success: boolean; message?: string }> {
  return apiClient(`/auctions/${auctionId}/purchase-contract/sign`, { method: "POST" });
}

export function purchaseContractPdfUrl(fileUrl: string | null): string | null {
  if (!fileUrl) return null;
  return resolveApiUrl(fileUrl);
}
