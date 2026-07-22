"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ApiError, userApi, type Conversation, type ConversationMessage, type UserProfile } from "@/lib/api";
import { UNREAD_REFRESH_EVENT } from "@/components/shells/CollectorSidebar";
import { useApiData } from "@/lib/use-api-data";
import { connectChatRealtime } from "@/lib/chat-realtime";

type InboxData = { conversations: Conversation[]; profile: UserProfile };

async function loadInbox(): Promise<InboxData> {
  const [conversations, profile] = await Promise.all([
    userApi.myConversations(),
    userApi.profile(),
  ]);
  return { conversations, profile: profile.data };
}

const EMPTY_INBOX: InboxData = { conversations: [], profile: { userId: 0, fullName: "", email: "", emailVerified: false, phone: null, phoneVerified: false, phoneVerifiedAt: null, identityNumber: null, roleName: "", status: "", identityVerified: false, profileStatus: null, identityVerifiedAt: null, active: false, paymentStrikeCount: 0, lockedByPaymentStrikes: false } };

export default function MessagesClient() {
  const t = useTranslations("messagesPage");
  const locale = useLocale();
  const { data, setData, loading, error } = useApiData(loadInbox, EMPTY_INBOX);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [sentMessages, setSentMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [sendError, setSendError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newFirstMessage, setNewFirstMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const selectedId = activeId ?? data.conversations[0]?.conversationId ?? null;

  const loadMessages = useCallback(async () => {
    if (selectedId == null) return [];
    return userApi.conversationMessages(selectedId);
  }, [selectedId]);
  const messageData = useApiData(loadMessages, [] as ConversationMessage[]);
  const messages = Array.from(new Map(
    [...messageData.data, ...sentMessages].map((message) => [message.messageId, message]),
  ).values());
  const active = data.conversations.find((item) => item.conversationId === selectedId) ?? null;

  // Mark the active conversation as read and refresh the sidebar badge.
  useEffect(() => {
    if (selectedId == null) return;
    userApi
      .markConversationRead(selectedId)
      .then(() => {
        setData((current) => ({
          ...current,
          conversations: current.conversations.map((item) =>
            item.conversationId === selectedId
              ? { ...item, unreadCount: 0 }
              : item,
          ),
        }));
        window.dispatchEvent(new Event(UNREAD_REFRESH_EVENT));
      })
      .catch(() => {
        /* The next refresh will update the badge if marking as read fails. */
      });
  }, [selectedId, setData]);

  useEffect(() => connectChatRealtime({
    conversationId: selectedId,
    onConnectionChange: setRealtimeConnected,
    onMessage: (message) => {
      setSentMessages((items) => items.some((item) => item.messageId === message.messageId)
        ? items : [...items, message]);
      setData((current) => ({
        ...current,
        conversations: current.conversations.map((conversation) =>
          conversation.conversationId === message.conversationId
            ? { ...conversation, lastMessage: message.content, updatedAt: message.sentAt,
                unreadCount: message.senderId === current.profile.userId || message.conversationId === selectedId
                  ? 0 : conversation.unreadCount + 1 }
            : conversation),
      }));
      if (message.conversationId === selectedId) void userApi.markConversationRead(selectedId);
      window.dispatchEvent(new Event(UNREAD_REFRESH_EVENT));
    },
    onConversation: () => { void loadInbox().then(setData); },
  }), [selectedId, setData]);

  async function sendMessage() {
    if (!selectedId || !input.trim()) return;
    setSendError("");
    try {
      const sent = await userApi.sendMessage(selectedId, input.trim());
      setSentMessages((items) => [...items, sent]);
      setInput("");
    } catch (cause) {
      setSendError(
        cause instanceof ApiError
          ? cause.message
          : t("sendError"),
      );
    }
  }

  async function createConversation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError("");

    const isSeller = data.profile.roleName?.toLowerCase() === "seller";
    setCreating(true);
    try {
      const conversation = await userApi.createConversation({
        type: isSeller ? "SELLER_STAFF" : "BUYER_STAFF",
        subject: newSubject.trim() || "Yêu cầu hỗ trợ",
        firstMessage: newFirstMessage.trim(),
      });
      const inbox = await loadInbox();
      setData(inbox);
      setActiveId(conversation.conversationId);
      setSentMessages([]);
      setShowNew(false);
      setNewSubject("");
      setNewFirstMessage("");
    } catch (cause) {
      setCreateError(
        cause instanceof ApiError
          ? cause.message
          : t("createError"),
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="m-4 flex min-h-[calc(100vh-2rem)] overflow-x-hidden rounded-3xl border border-white/10">
      <aside className="flex w-full max-w-xs flex-col border-r border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h1 className="font-headline-md text-lg">{t("title")}</h1>
          <button
            type="button"
            onClick={() => {
              setShowNew(true);
              setCreateError("");
            }}
            className="gradient-cta flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold text-black"
          >
            <span className="material-symbols-outlined text-base">add</span>
            {t("new")}
          </button>
        </div>
        <div className="custom-scrollbar flex-1 overflow-y-auto">
          {data.conversations.map((conversation) => (
            <button key={conversation.conversationId} type="button" onClick={() => { setActiveId(conversation.conversationId); setSentMessages([]); setSendError(""); }} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${selectedId === conversation.conversationId ? "bg-white/5" : "hover:bg-white/[0.03]"}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">{conversation.subject?.[0]?.toUpperCase() ?? "?"}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between"><p className="truncate text-sm font-semibold">{conversation.subject}</p><span className="text-[10px] text-white/30">{new Intl.DateTimeFormat(locale).format(new Date(conversation.updatedAt))}</span></div>
                <p className="truncate text-xs text-white/40">{conversation.lastMessage ?? t("noLastMessage")}</p>
              </div>
              {conversation.unreadCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--luxora-gold)] px-1 text-[10px] font-semibold text-black">{conversation.unreadCount}</span>}
            </button>
          ))}
          {!loading && data.conversations.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm text-white/45">{error ?? t("noConversations")}</p>
              {!error ? (
                <button
                  type="button"
                  onClick={() => setShowNew(true)}
                  className="mt-3 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold hover:border-[var(--luxora-gold)]"
                >
                  {t("startFirst")}
                </button>
              ) : null}
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="border-b border-white/10 px-5 py-4"><p className="text-sm font-semibold">{active?.subject ?? "Chọn một hội thoại"}</p><p className="text-[11px] text-white/40">{active?.status ?? ""}{active ? ` · ${realtimeConnected ? "Realtime" : "Đang kết nối..."}` : ""}</p></div>
        <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((message) => {
            const mine = message.senderId === data.profile.userId;
            return <div key={message.messageId} className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${mine ? "ml-auto bg-[var(--luxora-gold)] text-black" : "bg-white/10 text-white/80"}`}>{message.content}</div>;
          })}
          {active && !messageData.loading && messages.length === 0 && <p className="text-center text-sm text-white/40">{t("emptyThread")}</p>}
        </div>
        {sendError ? (
          <p className="border-t border-white/10 px-5 py-2 text-xs text-red-300">
            {sendError}
          </p>
        ) : null}
        <div className="flex items-center gap-3 border-t border-white/10 p-4">
          <input type="text" value={input} disabled={!active || active.status === "CLOSED"} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void sendMessage()} placeholder={!active ? "Tạo hội thoại mới để bắt đầu nhắn tin" : active.status === "CLOSED" ? "Hội thoại đã đóng — chỉ xem lại" : "Nhập tin nhắn..."} className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)] disabled:opacity-50" />
          <button type="button" onClick={() => void sendMessage()} disabled={!active || active.status === "CLOSED" || !input.trim()} aria-label="Gửi tin nhắn" className="gradient-cta flex h-11 w-11 items-center justify-center rounded-full text-black disabled:opacity-40"><span className="material-symbols-outlined">send</span></button>
        </div>
      </div>

      {showNew ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-conversation-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowNew(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-lg border border-white/15 bg-[#111] p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={() => setShowNew(false)}
              aria-label={t("close")}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 id="new-conversation-title" className="font-headline-md pr-12 text-xl">
              {t("newTitle")}
            </h2>

            <form onSubmit={createConversation} className="mt-5 flex flex-col gap-4">
              <p className="text-xs text-white/50">
                Hội thoại sẽ được gửi đến đội ngũ hỗ trợ BidZone.
              </p>

              <label className="block">
                <span className="mb-1.5 block text-xs text-white/50">
                  {t("subject")}
                </span>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(event) => setNewSubject(event.target.value)}
                  placeholder={t("subjectPlaceholder")}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs text-white/50">
                  {t("firstMessage")}
                </span>
                <textarea
                  required
                  rows={3}
                  value={newFirstMessage}
                  onChange={(event) => setNewFirstMessage(event.target.value)}
                  placeholder={t("firstMessagePlaceholder")}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
                />
              </label>

              {createError ? (
                <p className="text-xs text-red-300">{createError}</p>
              ) : null}

              <button
                type="submit"
                disabled={creating}
                className="gradient-cta h-11 w-full rounded-full text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? t("creating") : t("create")}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
