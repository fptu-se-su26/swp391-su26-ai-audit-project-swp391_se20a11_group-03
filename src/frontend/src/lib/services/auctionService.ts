import { apiClient } from "@/lib/apiClient";

export type AuctionEligibility = {
  auctionId: number;
  productId: number | null;
  depositAllowed: boolean;
  alreadyDeposited: boolean;
  depositAmount: number;
  startTime: string;
  depositDeadline: string;
  message: string;
  kycVerified: boolean;
};

export type AuctionDeposit = {
  depositId: number;
  auctionId: number;
  userId: number;
  depositAmount: number;
  walletBalance: number;
  walletHoldBalance: number;
  status: string;
  message: string;
};

export type AuctionState = {
  auctionId: number;
  productId: number | null;
  auctionMode: "LIVE" | "TIMED";
  status: string;
  paymentStatus: string | null;
  startingPrice: number;
  bidStep: number;
  minNextBid: number;
  currentHighestBid: number;
  currentWinnerUserId: number | null;
  startTime: string;
  endTime: string;
  paymentDeadline: string | null;
  totalBids: number;
  serverNow: string;
};

export type BidRecord = {
  bidId: number;
  auctionId: number;
  userId: number;
  username: string | null;
  bidAmount: number;
  bidTime: string;
};

export type BidResult = {
  success: boolean;
  message: string;
  auctionId?: number;
  userId?: number;
  bidAmount?: number;
  currentHighestBid?: number;
  endTime?: string;
};

export type AuctionPaymentResult = {
  auctionId: number;
  productId: number | null;
  finalPrice: number;
  depositApplied: number;
  amountCharged: number;
  walletBalance: number;
  walletHoldBalance: number;
  paymentStatus: string;
  message: string;
};

export function getAuctionEligibility(auctionId: number) {
  return apiClient<AuctionEligibility>(`/auctions/${auctionId}/eligibility`);
}

export function createAuctionDeposit(auctionId: number) {
  return apiClient<AuctionDeposit>(`/deposits?auctionId=${encodeURIComponent(auctionId)}`, {
    method: "POST",
  });
}

export function getAuctionState(auctionId: number) {
  return apiClient<AuctionState>(`/auctions/${auctionId}/state`);
}

export function getBidHistory(auctionId: number, limit = 20) {
  return apiClient<BidRecord[]>(`/auctions/${auctionId}/bids?limit=${encodeURIComponent(limit)}`);
}

export function placeBid(auctionId: number, bidAmount: number) {
  return apiClient<BidResult>(`/auctions/${auctionId}/bid`, {
    method: "POST",
    body: { bidAmount },
  });
}

export function payAuction(auctionId: number) {
  return apiClient<AuctionPaymentResult>(`/auctions/${auctionId}/pay`, {
    method: "POST",
  });
}
