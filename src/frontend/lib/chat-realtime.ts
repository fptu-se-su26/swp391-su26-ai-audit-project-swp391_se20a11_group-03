"use client";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_BASE_URL, getToken, type Conversation, type ConversationMessage } from "@/lib/api";
const CHAT_SOCKET_URL = `${API_BASE_URL.replace(/\/api\/?$/, "")}/ws/chat`;
type Options = { conversationId?: number | null; staffInbox?: boolean; onMessage?: (m: ConversationMessage) => void; onConversation?: (c: Conversation) => void; onConnectionChange?: (v: boolean) => void };
export function connectChatRealtime(options: Options) {
  const token = getToken();
  if (!token) return () => undefined;
  let subscriptions: StompSubscription[] = [];
  const parse = <T,>(frame: IMessage): T => JSON.parse(frame.body) as T;
  const client = new Client({
    webSocketFactory: () => new SockJS(CHAT_SOCKET_URL),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      options.onConnectionChange?.(true);
      if (options.conversationId != null) subscriptions.push(client.subscribe(`/topic/conversation/${options.conversationId}`, frame => options.onMessage?.(parse<ConversationMessage>(frame))));
      subscriptions.push(client.subscribe("/user/queue/conversation-new", frame => options.onConversation?.(parse<Conversation>(frame))));
      if (options.staffInbox) subscriptions.push(client.subscribe("/topic/staff/new-conversation", frame => options.onConversation?.(parse<Conversation>(frame))));
    },
    onWebSocketClose: () => options.onConnectionChange?.(false),
    onStompError: () => options.onConnectionChange?.(false),
  });
  client.activate();
  return () => { subscriptions.forEach(s => s.unsubscribe()); subscriptions = []; void client.deactivate(); };
}
