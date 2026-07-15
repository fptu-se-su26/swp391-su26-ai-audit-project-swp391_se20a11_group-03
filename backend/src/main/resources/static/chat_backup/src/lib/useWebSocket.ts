"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { getToken } from "./useCurrentUser";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

// Shape của MessageResponse từ backend
export interface ChatMessage {
  messageId: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

interface UseWebSocketOptions {
  conversationId: number | null;
  currentUserId: number;
  onConnected?: () => void;
}

export function useWebSocket({
  conversationId,
  currentUserId,
  onConnected,
}: UseWebSocketOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const clientRef = useRef<Client | null>(null);

  const authHeader = (): Record<string, string> => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Load lịch sử tin nhắn
  const loadHistory = useCallback(async (cid: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/v1/messages/conversation/${cid}`,
        { headers: authHeader() }
      );
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kết nối WebSocket STOMP
  useEffect(() => {
    if (!conversationId) return;

    loadHistory(conversationId);

    // Mark as read
    fetch(
      `${BACKEND_URL}/api/v1/messages/conversation/${conversationId}/read`,
      { method: "PATCH", headers: authHeader() }
    ).catch(() => {});

    const token = getToken();

    const client = new Client({
      webSocketFactory: () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const SockJS = require("sockjs-client");
        return new SockJS(`${BACKEND_URL}/ws/chat`);
      },
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        onConnected?.();

        // Subscribe real-time messages của conversation này
        client.subscribe(
          `/topic/conversation/${conversationId}`,
          (frame: IMessage) => {
            const msg: ChatMessage = JSON.parse(frame.body);
            setMessages((prev) => {
              // tránh duplicate
              if (prev.some((m) => m.messageId === msg.messageId)) return prev;
              return [...prev, msg];
            });
          }
        );

        // Subscribe thông báo staff tiếp nhận (dành cho User/Seller)
        client.subscribe(
          `/user/queue/conversation-assigned`,
          (frame: IMessage) => {
            console.info("Conversation assigned:", frame.body);
          }
        );
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error("STOMP error", frame);
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, currentUserId]);

  // Gửi tin nhắn qua STOMP
  const sendMessage = useCallback(
    (content: string) => {
      if (!clientRef.current?.connected || !conversationId || !content.trim())
        return;

      clientRef.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify({ conversationId, content: content.trim() }),
      });
    },
    [conversationId]
  );

  return { messages, connected, loading, sendMessage };
}

/**
 * Lấy conversation hiện có của user (nếu có), hoặc tạo mới.
 * Trả về conversationId.
 */
export async function getOrCreateConversation(userId: number): Promise<number> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Thử lấy conversation đã có
  const listRes = await fetch(`${BACKEND_URL}/api/v1/conversations/my`, {
    headers,
  });
  if (listRes.ok) {
    const list: { conversationId: number; status: string }[] =
      await listRes.json();
    const open = list.find((c) => c.status !== "CLOSED");
    if (open) return open.conversationId;
  }

  // Tạo conversation mới
  const createRes = await fetch(`${BACKEND_URL}/api/v1/conversations`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      subject: "Hỗ trợ khách hàng",
      firstMessage: "Xin chào, tôi cần hỗ trợ.",
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create conversation: ${createRes.status}`);
  }

  const data: { conversationId: number } = await createRes.json();
  return data.conversationId;
}
