"use client";

import { useEffect, useRef, useState } from "react";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { getStoredToken } from "@/lib/apiClient";
import type { AuctionChatMessage } from "@/lib/services/auctionChatService";

function getWsBaseUrl(): string {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8096/api";
  return api.replace(/\/api\/?$/, "");
}

export function useAuctionChatRealtime(
  auctionId: number | null,
  onMessage: (message: AuctionChatMessage) => void,
) {
  const clientRef = useRef<Client | null>(null);
  const topicSubRef = useRef<StompSubscription | null>(null);
  const onMessageRef = useRef(onMessage);
  const [connected, setConnected] = useState(false);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const token = getStoredToken();
    if (!token || !auctionId) return;

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
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error("[auction-chat] STOMP error", frame.headers["message"] ?? frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      setConnected(false);
      topicSubRef.current?.unsubscribe();
      topicSubRef.current = null;
      void client.deactivate();
      clientRef.current = null;
    };
  }, [auctionId]);

  useEffect(() => {
    const client = clientRef.current;
    topicSubRef.current?.unsubscribe();
    topicSubRef.current = null;

    if (!connected || !client?.connected || !auctionId) return;

    topicSubRef.current = client.subscribe(
      `/topic/auction/${auctionId}/chat`,
      (frame: IMessage) => {
        try {
          const msg = JSON.parse(frame.body) as AuctionChatMessage;
          onMessageRef.current(msg);
        } catch {
          // ignore malformed payloads
        }
      },
    );

    return () => {
      topicSubRef.current?.unsubscribe();
      topicSubRef.current = null;
    };
  }, [auctionId, connected]);

  const publish = (content: string) => {
    const client = clientRef.current;
    if (!client?.connected || !auctionId) return false;
    client.publish({
      destination: "/app/auctionChat.sendMessage",
      body: JSON.stringify({ auctionId, content }),
    });
    return true;
  };

  return { connected, publish };
}
