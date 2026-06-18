import { apiClient } from "@/lib/apiClient";

export type ProductSummary = {
  productId: number;
  productName: string;
  categoryId: number | null;
  categoryName: string | null;
  startingPrice: number;
  currentBid: number;
  status: string;
  imageUrl: string | null;
  auctionId: number | null;
  auctionStatus: string | null;
  auctionStartTime: string | null;
  auctionEndTime: string | null;
  auctionMode: "LIVE" | "TIMED" | null;
  scheduledStartTime: string | null;
  scheduledDurationSeconds: number | null;
  sellerId?: number | null;
};

export type BidSummary = {
  bidId: number;
  userId: number | null;
  bidderName: string | null;
  bidAmount: number | null;
  bidTime: string | null;
};

export type AuctionSummary = {
  auctionId: number;
  startTime: string;
  endTime: string;
  status: string;
  bids: BidSummary[];
};

export type ProductDetail = ProductSummary & {
  description: string | null;
  imageUrls: string[];
  auctionMode: "LIVE" | "TIMED" | null;
  scheduledDurationSeconds: number | null;
  auctionPaymentStatus: string | null;
  auctionPaymentDeadline: string | null;
  auction: AuctionSummary | null;
};

export type ProductSearchFilters = {
  keyword?: string;
  categoryId?: number | "";
  minPrice?: number | "";
  maxPrice?: number | "";
  status?: string;
  auctionStatus?: string;
  page?: number;
  size?: number;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type CategorySummary = {
  categoryId: number;
  categoryName: string;
  description?: string | null;
  isActive: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

function appendParam(params: URLSearchParams, key: string, value: unknown) {
  if (value !== undefined && value !== null && value !== "") {
    params.set(key, String(value));
  }
}

export async function searchProducts(filters: ProductSearchFilters = {}) {
  const params = new URLSearchParams();
  appendParam(params, "keyword", filters.keyword?.trim());
  appendParam(params, "categoryId", filters.categoryId);
  appendParam(params, "minPrice", filters.minPrice);
  appendParam(params, "maxPrice", filters.maxPrice);
  appendParam(params, "status", filters.status);
  appendParam(params, "auctionStatus", filters.auctionStatus);
  appendParam(params, "page", filters.page ?? 0);
  appendParam(params, "size", filters.size ?? 12);

  const query = params.toString();
  return apiClient<PageResponse<ProductSummary>>(`/products${query ? `?${query}` : ""}`);
}

export async function getCategories() {
  const response = await apiClient<ApiResponse<CategorySummary[]>>("/categories");
  return response.data;
}

export type CategoryAttribute = {
  attributeId: number;
  categoryId: number;
  attributeName: string;
  dataType: string;
  isRequired: boolean;
  displayOrder: number;
};

export async function getCategoryAttributes(categoryId: number | string) {
  const response = await apiClient<ApiResponse<CategoryAttribute[]>>(`/categories/${categoryId}/attributes`);
  return response.data;
}

export async function getProductDetail(productId: number | string) {
  return apiClient<ProductDetail>(`/products/${productId}`);
}

export async function getMyProducts() {
  return apiClient<ApiResponse<ProductSummary[]>>("/seller/products/mine");
}

export async function uploadProductImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const response = await apiClient<ApiResponse<string[]>>("/uploads", {
    method: "POST",
    body: formData,
  });
  return response.data;
}

export type CreateProductPayload = {
  productName: string;
  categoryId: number;
  description?: string;
  startingPrice: number;
  stepPrice?: number;
  taxPercent?: number;
  auctionMode?: "LIVE" | "TIMED";
  scheduledStartTime?: string;
  scheduledDurationSeconds?: number;
  images: { imageUrl: string; isPrimary?: boolean }[];
  attributes?: { attributeId: number; attributeValue: string }[];
};

export async function createProduct(payload: CreateProductPayload) {
  return apiClient<ApiResponse<unknown>>("/seller/products", {
    method: "POST",
    body: payload as unknown as Record<string, unknown>,
  });
}

export async function deleteProduct(productId: number): Promise<void> {
  await apiClient(`/seller/products/${productId}`, {
    method: "DELETE",
  });
}

export async function updateProduct(
  productId: number,
  payload: {
    productName?: string;
    description?: string;
    startingPrice?: number;
    auctionMode?: string;
    scheduledStartTime?: string;
    scheduledDurationSeconds?: number;
  }
): Promise<void> {
  await apiClient(`/seller/products/${productId}`, {
    method: "PUT",
    body: payload as unknown as Record<string, unknown>,
  });
}
