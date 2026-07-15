"use client";

import { useCallback, useState } from "react";
import { userApi, type Conversation, type ConversationMessage, type UserProfile } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

type InboxData = { conversations: Conversation[]; profile: UserProfile };

async function loadInbox(): Promise<InboxData> {
  const [conversations, profile] = await Promise.all([
    userApi.myConversations(),
    userApi.profile(),
  ]);
  return { conversations, profile: profile.data };
}

const EMPTY_INBOX: InboxData = { conversations: [], profile: { userId: 0, fullName: "", email: "", phone: "", identityNumber: null, roleName: "", status: "", identityVerified: false, profileStatus: null, identityVerifiedAt: null, active: false, paymentStrikeCount: 0, lockedByPaymentStrikes: false } };

export default function MessagesClient() {
  const { data, loading, error } = useApiData(loadInbox, EMPTY_INBOX);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [sentMessages, setSentMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const selectedId = activeId ?? data.conversations[0]?.conversationId ?? null;

  const loadMessages = useCallback(async () => {
    if (selectedId == null) return [];
    return userApi.conversationMessages(selectedId);
  }, [selectedId]);
  const messageData = useApiData(loadMessages, [] as ConversationMessage[]);
  const messages = [...messageData.data, ...sentMessages];
  const active = data.conversations.find((item) => item.conversationId === selectedId) ?? null;

  async function sendMessage() {
    if (!selectedId || !input.trim()) return;
    const sent = await userApi.sendMessage(selectedId, input.trim());
    setSentMessages((items) => [...items, sent]);
    setInput("");
  }

  return (
    <div className="m-4 flex h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-white/10">
      <aside className="flex w-full max-w-xs flex-col border-r border-white/10">
        <div className="border-b border-white/10 p-4"><h1 className="font-headline-md text-lg">Tin nhắn</h1></div>
        <div className="custom-scrollbar flex-1 overflow-y-auto">
          {data.conversations.map((conversation) => (
            <button key={conversation.conversationId} type="button" onClick={() => { setActiveId(conversation.conversationId); setSentMessages([]); }} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${selectedId === conversation.conversationId ? "bg-white/5" : "hover:bg-white/[0.03]"}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">{conversation.subject?.[0]?.toUpperCase() ?? "?"}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between"><p className="truncate text-sm font-semibold">{conversation.subject}</p><span className="text-[10px] text-white/30">{new Intl.DateTimeFormat("vi-VN").format(new Date(conversation.updatedAt))}</span></div>
                <p className="truncate text-xs text-white/40">{conversation.lastMessage ?? "Chưa có tin nhắn"}</p>
              </div>
              {conversation.unreadCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--luxora-gold)] px-1 text-[10px] font-semibold text-black">{conversation.unreadCount}</span>}
            </button>
          ))}
          {!loading && data.conversations.length === 0 && <p className="p-6 text-center text-sm text-white/45">{error ?? "Chưa có hội thoại nào."}</p>}
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="border-b border-white/10 px-5 py-4"><p className="text-sm font-semibold">{active?.subject ?? "Chọn một hội thoại"}</p><p className="text-[11px] text-white/40">{active?.status ?? ""}</p></div>
        <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((message) => {
            const mine = message.senderId === data.profile.userId;
            return <div key={message.messageId} className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${mine ? "ml-auto bg-[var(--luxora-gold)] text-black" : "bg-white/10 text-white/80"}`}>{message.content}</div>;
          })}
          {active && !messageData.loading && messages.length === 0 && <p className="text-center text-sm text-white/40">Chưa có tin nhắn.</p>}
        </div>
        <div className="flex items-center gap-3 border-t border-white/10 p-4">
          <input type="text" value={input} disabled={!active} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void sendMessage()} placeholder="Nhập tin nhắn..." className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)] disabled:opacity-50" />
          <button type="button" onClick={() => void sendMessage()} disabled={!active || !input.trim()} aria-label="Gửi tin nhắn" className="gradient-cta flex h-11 w-11 items-center justify-center rounded-full text-black disabled:opacity-40"><span className="material-symbols-outlined">send</span></button>
        </div>
      </div>
    </div>
  );
}
