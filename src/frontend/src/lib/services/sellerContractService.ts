import { apiClient } from "@/lib/apiClient";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type SellerContract = {
  signed: boolean;
  contractId: number | null;
  signedAt: string | null;
  fileUrl: string | null;
};

export async function signSellerContract() {
  const response = await apiClient<ApiResponse<SellerContract>>("/seller-contract/sign", {
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
