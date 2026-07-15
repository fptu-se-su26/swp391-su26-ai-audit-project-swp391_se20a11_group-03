"use client";

import { useEffect, useRef, useState } from "react";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { getStoredToken } from "@/lib/apiClient";

export type RealtimeChatMessage = {
  messageId: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  isRead: boolean;
  sentAt: string;
};

function getWsBaseUrl(): string {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8096/api";
  return api.replace(/\/api\/?$/, "");
}

type Options = {
  conversationId: number | null;
  onMessage: (message: RealtimeChatMessage) => void;
  onConversationEvent?: () => void;
  subscribeStaffTopic?: boolean;
};

export function useChatRealtime({
  conversationId,
  onMessage,
  onConversationEvent,
  subscribeStaffTopic = false,
}: Options) {
  const clientRef = useRef<Client | null>(null);
  const conversationSubRef = useRef<StompSubscription | null>(null);
  const onMessageRef = useRef(onMessage);
  const onConversationEventRef = useRef(onConversationEvent);
  const [connected, setConnected] = useState(false);
  onMessageRef.current = onMessage;
  onConversationEventRef.current = onConversationEvent;

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

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
        client.subscribe("/user/queue/conversation-new", () => {
          onConversationEventRef.current?.();
        });

        if (subscribeStaffTopic) {
          client.subscribe("/topic/staff/new-conversation", () => {
            onConversationEventRef.current?.();
          });
        }
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error("[chat] STOMP error", frame.headers["message"] ?? frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      setConnected(false);
      conversationSubRef.current?.unsubscribe();
      conversationSubRef.current = null;
      void client.deactivate();
      clientRef.current = null;
    };
  }, [subscribeStaffTopic]);

  useEffect(() => {
    const client = clientRef.current;
    conversationSubRef.current?.unsubscribe();
    conversationSubRef.current = null;

    if (!connected || !client?.connected || !conversationId) return;

    conversationSubRef.current = client.subscribe(
      `/topic/conversation/${conversationId}`,
      (frame: IMessage) => {
        try {
          const msg = JSON.parse(frame.body) as RealtimeChatMessage;
          onMessageRef.current(msg);
        } catch {
          // ignore malformed payloads
        }
      },
    );

    return () => {
      conversationSubRef.current?.unsubscribe();
      conversationSubRef.current = null;
    };
  }, [conversationId, connected]);

  return { connected };
}
