import { apiClient, getStoredToken } from "@/lib/apiClient";

export type BidInfo = {
  bidId: number;
  productId: number;
  productName: string;
  lotNumber: string;
  image: string;
  currentBid: number;
  timeLeft: string;
  status: "leading" | "outbid" | "won" | "lost" | "deposited";
  auctionEndTime: string;
};

export type WonItem = {
  id: number;
  productId: number;
  productName: string;
  lotNumber: string;
  image: string;
  finalPrice: number;
  wonDate: string;
  status: "pending_payment" | "paid" | "shipped" | "delivered";
};

export type WatchlistItem = {
  id: number;
  productId: number;
  productName: string;
  lotNumber: string;
  image: string;
  currentBid: number;
  endTime: string;
  status: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function getMyBids(): Promise<BidInfo[]> {
  const token = getStoredToken();
  if (!token) return [];

  try {
    const response = await apiClient<ApiResponse<BidInfo[]>>("/bids/my-bids");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch my bids:", error);
    return [];
  }
}

export async function getWonItems(): Promise<WonItem[]> {
  const token = getStoredToken();
  if (!token) return [];

  try {
    const response = await apiClient<ApiResponse<WonItem[]>>("/bids/won");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch won items:", error);
    return [];
  }
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const token = getStoredToken();
  if (!token) return [];

  try {
    const response = await apiClient<ApiResponse<WatchlistItem[]>>("/watchlist");
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch watchlist:", error);
    return [];
  }
}

export async function addToWatchlist(productId: number): Promise<boolean> {
  try {
    await apiClient<ApiResponse<void>>(`/watchlist/${productId}`, {
      method: "POST",
    });
    return true;
  } catch (error) {
    console.error("Failed to add to watchlist:", error);
    return false;
  }
}

export async function removeFromWatchlist(productId: number): Promise<boolean> {
  try {
    await apiClient<ApiResponse<void>>(`/watchlist/${productId}`, {
      method: "DELETE",
    });
    return true;
  } catch (error) {
    console.error("Failed to remove from watchlist:", error);
    return false;
  }
}
