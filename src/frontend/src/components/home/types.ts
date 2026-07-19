export type LuxuryLot = {
  id: number;
  lotNumber: string;
  title: string;
  category: string;
  image: string;
  currentBid: number;
  estimateLow: number;
  estimateHigh: number;
  timeLeft: string;
  bids: number;
  status: "live" | "upcoming" | "ended";
  verified?: boolean;
};
