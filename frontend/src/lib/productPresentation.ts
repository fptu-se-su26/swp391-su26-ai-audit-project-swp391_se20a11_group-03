export const PRODUCT_PLACEHOLDER_IMAGE = "/product-placeholder.svg";

export function getProductImage(imageUrl?: string | null) {
  return imageUrl && imageUrl.trim().length > 0 ? imageUrl : PRODUCT_PLACEHOLDER_IMAGE;
}

/**
 * Reconcile the persisted `auction.status` with the actual lifecycle that can be
 * derived from `startTime` / `endTime`. Use this in the storefront/detail UI so
 * the visible state is never out of sync with the wall clock — for example, a
 * session whose `EndTime` already passed but whose denormalized status column
 * has not yet been swept by the background scheduler.
 */
export function computeEffectiveAuctionStatus(
  status: string | null | undefined,
  startTime?: string | null,
  endTime?: string | null,
  now: Date = new Date(),
): "UPCOMING" | "ACTIVE" | "ENDED" | "AWAITING_PAYMENT" | "PAID" | "FORFEITED" {
  const upper = (status ?? "").toUpperCase();
  if (upper === "AWAITING_PAYMENT" || upper === "PAID" || upper === "FORFEITED") {
    return upper;
  }

  const start = startTime ? new Date(startTime) : null;
  const end = endTime ? new Date(endTime) : null;

  if (end && !Number.isNaN(end.getTime()) && end.getTime() <= now.getTime()) {
    return "ENDED";
  }
  if (start && !Number.isNaN(start.getTime()) && start.getTime() > now.getTime()) {
    return "UPCOMING";
  }
  if (end && !Number.isNaN(end.getTime()) && end.getTime() > now.getTime()) {
    return "ACTIVE";
  }

  // Fall back to the persisted value if we cannot infer from timestamps.
  if (upper === "UPCOMING" || upper === "ACTIVE" || upper === "ENDED") {
    return upper;
  }
  return "ACTIVE";
}
