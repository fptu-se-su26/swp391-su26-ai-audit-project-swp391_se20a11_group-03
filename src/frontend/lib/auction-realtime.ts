"use client";

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_BASE_URL, getToken, type BidResult } from "@/lib/api";

const AUCTION_SOCKET_URL = `${API_BASE_URL.replace(/\/api\/?$/, "")}/ws/chat`;

export type AuctionResultEvent = {
  type: "AUCTION_WON" | "AUCTION_ENDED_NO_WINNER";
  auctionId: number;
  productId: number | null;
  winnerUserId: number | null;
  winnerUsername: string | null;
  productName: string;
  finalPriceVnd: number;
  settledAt: string;
  paymentDeadline: string | null;
};

type AuctionRealtimeOptions = {
  auctionId: number;
  onBid?: (event: BidResult) => void;
  onResult?: (event: AuctionResultEvent) => void;
  onConnectionChange?: (connected: boolean) => void;
};

function parseFrame<T>(frame: IMessage): T | null {
  try {
    return JSON.parse(frame.body) as T;
  } catch {
    return null;
  }
}

/**
 * Subscribes to public auction topics. REST polling remains active as a fallback
 * when STOMP/SockJS cannot connect.
 */
export function connectAuctionRealtime(options: AuctionRealtimeOptions): () => void {
  const token = getToken();
  let subscriptions: StompSubscription[] = [];

  const client = new Client({
    webSocketFactory: () => new SockJS(AUCTION_SOCKET_URL),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 2_000,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
    onConnect: () => {
      options.onConnectionChange?.(true);
      subscriptions.push(
        client.subscribe("/topic/bids", (frame) => {
          const event = parseFrame<BidResult>(frame);
          if (event?.auctionId === options.auctionId) options.onBid?.(event);
        }),
      );
      subscriptions.push(
        client.subscribe("/topic/auctions", (frame) => {
          const event = parseFrame<AuctionResultEvent>(frame);
          if (event?.auctionId === options.auctionId) options.onResult?.(event);
        }),
      );
    },
    onWebSocketClose: () => options.onConnectionChange?.(false),
    onStompError: () => options.onConnectionChange?.(false),
  });

  client.activate();
  return () => {
    subscriptions.forEach((subscription) => subscription.unsubscribe());
    subscriptions = [];
    void client.deactivate();
  };
}
