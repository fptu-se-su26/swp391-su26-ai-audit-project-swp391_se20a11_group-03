"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { getStoredToken } from "@/lib/apiClient";
import { subscribeStoredUser } from "@/lib/userSession";

export type AuctionWinAnnouncement = {
  id: string;
  type: "AUCTION_WON";
  auctionId: number;
  productId?: number | null;
  winnerUserId: number;
  winnerUsername: string;
  productName: string;
  finalPriceVnd: number;
  settledAt?: string | null;
};

const MAX_QUEUE = 3;

function getWsBaseUrl(): string {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8096/api";
  return api.replace(/\/api\/?$/, "");
}

function parseAnnouncement(body: string): AuctionWinAnnouncement | null {
  try {
    const raw = JSON.parse(body) as {
      type?: string;
      auctionId?: number;
      productId?: number | null;
      winnerUserId?: number;
      winnerUsername?: string;
      productName?: string;
      finalPriceVnd?: number;
      settledAt?: string | null;
    };
    if (raw.type !== "AUCTION_WON" || raw.auctionId == null || raw.winnerUserId == null) {
      return null;
    }
    return {
      id: `${raw.auctionId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "AUCTION_WON",
      auctionId: Number(raw.auctionId),
      productId: raw.productId != null ? Number(raw.productId) : null,
      winnerUserId: Number(raw.winnerUserId),
      winnerUsername: raw.winnerUsername?.trim() || "Người thắng",
      productName: raw.productName?.trim() || "sản phẩm",
      finalPriceVnd: Number(raw.finalPriceVnd ?? 0),
      settledAt: raw.settledAt ?? null,
    };
  } catch {
    return null;
  }
}

export function useAuctionAnnouncements() {
  const [announcements, setAnnouncements] = useState<AuctionWinAnnouncement[]>([]);
  const clientRef = useRef<Client | null>(null);
  const subRef = useRef<StompSubscription | null>(null);
  const [connected, setConnected] = useState(false);
  const [authTick, setAuthTick] = useState(0);

  const dismiss = useCallback((id: string) => {
    setAnnouncements((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushAnnouncement = useCallback((item: AuctionWinAnnouncement) => {
    setAnnouncements((prev) => [item, ...prev].slice(0, MAX_QUEUE));
  }, []);

  useEffect(() => subscribeStoredUser(() => setAuthTick((n) => n + 1)), []);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setConnected(false);
      return;
    }

    const client = new Client({
      webSocketFactory: () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const SockJS = require("sockjs-client");
        return new SockJS(`${getWsBaseUrl()}/ws/chat`);
      },
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true);
        subRef.current?.unsubscribe();
        subRef.current = client.subscribe("/topic/auctions", (frame: IMessage) => {
          const parsed = parseAnnouncement(frame.body);
          if (parsed) {
            pushAnnouncement(parsed);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
        subRef.current?.unsubscribe();
        subRef.current = null;
      },
      onStompError: (frame) => {
        console.error("[announcements] STOMP error", frame.headers["message"] ?? frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      setConnected(false);
      subRef.current?.unsubscribe();
      subRef.current = null;
      void client.deactivate();
      clientRef.current = null;
    };
  }, [authTick, pushAnnouncement]);

  return { announcements, dismiss, connected };
}
