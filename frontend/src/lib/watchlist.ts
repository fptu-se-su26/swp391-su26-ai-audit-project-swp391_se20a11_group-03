import { apiClient, getStoredToken } from "@/lib/apiClient";

const WATCHLIST_EVENT = "watchlist:changed";

type WatchlistApiItem = {
  productId: number;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

let cachedWatchlistIds: number[] = [];

function uniqueNumbers(values: number[]) {
  return Array.from(new Set(values.filter((value) => Number.isFinite(value) && value > 0)));
}

function notifyWatchlistChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(WATCHLIST_EVENT));
  }
}

function setCachedWatchlistIds(ids: number[]) {
  cachedWatchlistIds = uniqueNumbers(ids);
  notifyWatchlistChanged();
}

export function getWatchlistIds(): number[] {
  return [...cachedWatchlistIds];
}

export function isWatchlisted(productId: number) {
  return cachedWatchlistIds.includes(productId);
}

export async function refreshWatchlistIds() {
  if (!getStoredToken()) {
    setCachedWatchlistIds([]);
    return [];
  }

  try {
    const response = await apiClient<ApiResponse<WatchlistApiItem[]>>("/watchlist");
    const ids = (response.data ?? []).map((item) => Number(item.productId));
    setCachedWatchlistIds(ids);
    return ids;
  } catch {
    setCachedWatchlistIds([]);
    return [];
  }
}

export async function addWatchlistProduct(productId: number) {
  await apiClient<ApiResponse<void>>(`/watchlist/${productId}`, {
    method: "POST",
  });
  setCachedWatchlistIds([...cachedWatchlistIds, productId]);
  return true;
}

export async function removeWatchlistProduct(productId: number) {
  await apiClient<ApiResponse<void>>(`/watchlist/${productId}`, {
    method: "DELETE",
  });
  setCachedWatchlistIds(cachedWatchlistIds.filter((id) => id !== productId));
  return true;
}

export async function toggleWatchlist(productId: number) {
  if (isWatchlisted(productId)) {
    await removeWatchlistProduct(productId);
    return false;
  }

  await addWatchlistProduct(productId);
  return true;
}

export function subscribeWatchlist(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(WATCHLIST_EVENT, listener);
  return () => {
    window.removeEventListener(WATCHLIST_EVENT, listener);
  };
}
