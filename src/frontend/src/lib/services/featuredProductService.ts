import { apiClient } from "@/lib/apiClient";
import { ProductSummary } from "@/lib/services/productService";

export type FeaturedProductsResponse = {
  daily: ProductSummary[];
  weekly: ProductSummary[];
  monthly: ProductSummary[];
};

export type FeaturedProductSlot = {
  displayOrder: number;
  productId: number;
  product: ProductSummary | null;
};

export type AdminFeaturedProductsResponse = {
  daily: FeaturedProductSlot[];
  weekly: FeaturedProductSlot[];
  monthly: FeaturedProductSlot[];
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type FeaturedPeriodType = "DAILY" | "WEEKLY" | "MONTHLY";

export async function getFeaturedProducts() {
  return apiClient<FeaturedProductsResponse>("/featured-products");
}

export async function getAdminFeaturedProducts() {
  const response = await apiClient<ApiResponse<AdminFeaturedProductsResponse>>("/admin/featured-products");
  return response.data;
}

export async function updateAdminFeaturedProducts(periodType: FeaturedPeriodType, productIds: (number | null)[]) {
  const response = await apiClient<ApiResponse<null>>("/admin/featured-products", {
    method: "PUT",
    body: JSON.stringify({
      periodType,
      productIds: productIds.filter((id): id is number => id != null && id > 0),
    }),
  });
  return response;
}
