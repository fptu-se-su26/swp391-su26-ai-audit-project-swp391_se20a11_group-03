import { apiClient } from "@/lib/apiClient";

export type AuctionChatMessage = {
  messageId: number;
  auctionId: number;
  senderId: number;
  senderName: string;
  senderRole?: string | null;
  content: string;
  sentAt: string;
};

export type AuctionChatStatus = {
  open: boolean;
  phase: "NOT_STARTED" | "OPEN" | "GRACE" | "CLOSED";
  closesAt?: string | null;
};

export async function getAuctionChatStatus(auctionId: number): Promise<AuctionChatStatus> {
  return apiClient<AuctionChatStatus>(`/auctions/${auctionId}/chat/status`);
}

export async function getAuctionChatMessages(auctionId: number): Promise<AuctionChatMessage[]> {
  return apiClient<AuctionChatMessage[]>(`/auctions/${auctionId}/chat/messages`);
}

export async function sendAuctionChatMessage(
  auctionId: number,
  content: string,
): Promise<AuctionChatMessage> {
  return apiClient<AuctionChatMessage>(`/auctions/${auctionId}/chat/messages`, {
    method: "POST",
    body: JSON.stringify({ auctionId, content }),
  });
}
