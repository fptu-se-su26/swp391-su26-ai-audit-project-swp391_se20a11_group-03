import { apiClient } from "@/lib/apiClient";

export type ProductSummary = {
  productId: number;
  productName: string;
  categoryId: number | null;
  categoryName: string | null;
  startingPrice: number;
  status: string;
};

export type ProductSearchFilters = {
  keyword?: string;
  categoryId?: number | "";
  minPrice?: number | "";
  maxPrice?: number | "";
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
  appendParam(params, "page", filters.page ?? 0);
  appendParam(params, "size", filters.size ?? 12);

  const query = params.toString();
  return apiClient<PageResponse<ProductSummary>>(`/products${query ? `?${query}` : ""}`);
}

export async function getCategories() {
  const response = await apiClient<ApiResponse<CategorySummary[]>>("/categories");
  return response.data;
}
