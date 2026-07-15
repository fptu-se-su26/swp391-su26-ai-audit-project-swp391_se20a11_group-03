import { LuxuryLot } from "@/components/home/types";
import { getProductImage } from "@/lib/productPresentation";
import { ProductSummary } from "@/lib/services/productService";

export function remainingTimeLabel(endTime?: string | null): string {
  if (!endTime) return "Sắp kết thúc";
  const minutes = Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 60000));
  if (minutes <= 0) return "Đã kết thúc";
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  return days > 0 ? `${days} ngày ${hours} giờ` : `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
}

export function toLuxuryLot(
  product: ProductSummary,
  index: number,
  status: LuxuryLot["status"],
): LuxuryLot {
  const bid = product.currentBid || product.startingPrice || 0;
  return {
    id: product.productId,
    lotNumber: String(product.productId).padStart(3, "0"),
    title: product.productName,
    category: product.categoryName || "Sưu tầm",
    image: getProductImage(product.imageUrl),
    currentBid: bid,
    estimateLow: Math.round(bid * 1.12),
    estimateHigh: Math.round(bid * 1.35),
    timeLeft: status === "ended" ? "Đã bán" : remainingTimeLabel(product.auctionEndTime),
    bids: 0,
    status,
    verified: true,
  };
}
