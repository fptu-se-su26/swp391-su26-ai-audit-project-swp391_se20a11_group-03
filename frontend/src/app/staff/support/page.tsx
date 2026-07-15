"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PortalShell from "@/components/layout/PortalShell";
import SupportChatPanel from "@/components/features/SupportChatPanel";
import { useTranslations } from "@/i18n/I18nProvider";
import { apiClient } from "@/lib/apiClient";
import { getStoredUser, subscribeStoredUser, StoredUser } from "@/lib/userSession";
import { RealtimeChatMessage, useChatRealtime } from "@/lib/hooks/useChatRealtime";
import { appendChatMessage } from "@/lib/chatMessages";

type ConversationType = "BUYER_SELLER" | "BUYER_STAFF" | "SELLER_STAFF";

type Conversation = {
  conversationId: number;
  userId: number;
  userName: string;
  assignedStaffId: number | null;
  assignedStaffName: string | null;
  sellerId: number | null;
  sellerName: string | null;
  productId: number | null;
  type: ConversationType;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  lastMessage: string | null;
  unreadCount: number;
};

type Message = {
  messageId: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  isRead: boolean;
  sentAt: string;
};

type ConversationDetail = {
  info: Conversation;
  messages: Message[];
};

const STATUS_CFG: Record<Conversation["status"], string> = {
  OPEN: "bg-[#d4aa61]/20 text-[#efcf88]",
  IN_PROGRESS: "bg-blue-500/20 text-blue-300",
  CLOSED: "bg-white/10 text-[#9d948a]",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return iso;
  }
}

export default function SupportPage() {
  const t = useTranslations("staffSupport");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    syncUser();
    return subscribeStoredUser(syncUser);
  }, []);

  const currentUserId = currentUser?.userId ?? null;

  const refreshConversations = useCallback(async () => {
    try {
      const data = await apiClient<Conversation[]>("/v1/conversations/my");
      const supportOnly = (data ?? []).filter(
        (c) => c.type === "BUYER_STAFF" || c.type === "SELLER_STAFF",
      );
      setConversations(supportOnly);
      if (supportOnly.length > 0) {
        setSelectedId((prev) => prev ?? supportOnly[0].conversationId);
      } else {
        setSelectedId(null);
        setMessages([]);
      }
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.userName.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        (c.lastMessage ?? "").toLowerCase().includes(q),
    );
  }, [conversations, search]);

  const selected = useMemo(
    () => conversations.find((c) => c.conversationId === selectedId) ?? null,
    [conversations, selectedId],
  );

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoadingMessages(true);
      try {
        const data = await apiClient<ConversationDetail>(
          `/v1/conversations/${selectedId}`,
        );
        if (!cancelled) {
          setMessages(data.messages ?? []);
          // Refresh list to update assignedStaffName / unreadCount
          refreshConversations();
        }
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedId, refreshConversations]);

  const handleRealtimeMessage = useCallback(
    (msg: RealtimeChatMessage) => {
      if (msg.conversationId !== selectedId) {
        void refreshConversations();
        return;
      }
      setMessages((current) => appendChatMessage(current, msg));
      void refreshConversations();
    },
    [selectedId, refreshConversations],
  );

  const { connected: chatConnected } = useChatRealtime({
    conversationId: selectedId,
    onMessage: handleRealtimeMessage,
    onConversationEvent: refreshConversations,
    subscribeStaffTopic: true,
  });

  async function sendReply() {
    if (!reply.trim() || !selectedId) return;
    const content = reply.trim();
    setSending(true);
    setReply("");
    try {
      const created = await apiClient<Message>("/v1/messages", {
        method: "POST",
        body: { conversationId: selectedId, content },
      });
      if (!chatConnected) {
        setMessages((cur) => appendChatMessage(cur, created));
      }
      refreshConversations();
    } catch {
      setReply(content);
    } finally {
      setSending(false);
    }
  }

  async function closeTicket() {
    if (!selectedId) return;
    try {
      await apiClient<Conversation>(`/v1/conversations/${selectedId}/close`, {
        method: "PATCH",
      });
      refreshConversations();
    } catch {
      // ignore
    }
  }

  return (
    <PortalShell>
      <div className="flex h-full overflow-hidden bg-[#070706]">
        <aside className="flex h-full w-80 shrink-0 flex-col border-r border-white/10 bg-[#080706]">
          <div className="border-b border-white/10 p-md">
            <h2 className="font-headline-sm text-headline-sm font-bold text-[#f0dfa0]">
              {t("pageTitle")}
            </h2>
            <div className="relative mt-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#9d948a]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full rounded-lg border border-white/15 bg-[#0e0d0b] py-2 pl-9 pr-3 text-sm text-white/90 outline-none focus:border-[#d4aa61]"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-md text-center text-[#9d948a]">
                {t("loading")}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-md text-center text-[#9d948a]">
                <p className="mb-sm">{t("emptyTitle")}</p>
                <p className="text-sm">{t("emptyDesc")}</p>
              </div>
            ) : (
              filteredConversations.map((c) => (
                <button
                  key={c.conversationId}
                  onClick={() => setSelectedId(c.conversationId)}
                  className={`w-full border-b border-white/10 p-md text-left transition-colors hover:bg-white/5 ${
                    selectedId === c.conversationId
                      ? "border-r-2 border-r-[#d4aa61] bg-white/5"
                      : ""
                  }`}
                >
                  <div className="mb-xs flex items-center justify-between">
                    <span className="flex-1 truncate text-sm font-medium text-white/90">
                      {c.type === "BUYER_STAFF" ? c.userName : c.userName}
                      {c.assignedStaffId == null && (
                        <span className="ml-2 inline-block rounded-full bg-[#d4aa61]/20 px-2 py-0.5 text-[9px] font-label-sm text-[#efcf88]">
                          {t("unassignedBadge")}
                        </span>
                      )}
                    </span>
                    {c.unreadCount > 0 && (
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#d4aa61] text-[10px] text-[#100d08]">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="mb-xs truncate text-xs text-[#9d948a]">
                    {c.subject}
                  </p>
                  <div className="flex gap-xs">
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${STATUS_CFG[c.status]}`}
                    >
                      {t(`status${c.status.charAt(0) + c.status.slice(1).toLowerCase()}`)}
                    </span>
                    <span className="text-[10px] text-[#756d64]">
                      {formatDate(c.updatedAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex h-full flex-1 flex-col overflow-hidden">
          {selected ? (
            <SupportChatPanel
              theme="dark"
              className="!rounded-none !border-0"
              header={
                <header className="flex items-start justify-between border-b border-white/10 bg-[#0e0d0b] p-md">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selected.subject}</h3>
                    <div className="mt-xs flex items-center gap-sm">
                      <span className="text-sm text-[#9d948a]">{selected.userName}</span>
                      <span className="text-[#756d64]">·</span>
                      <span className="text-sm text-[#9d948a]">{formatDate(selected.createdAt)}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${STATUS_CFG[selected.status]}`}
                      >
                        {t(`status${selected.status.charAt(0) + selected.status.slice(1).toLowerCase()}`)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    {selected.status !== "CLOSED" && (
                      <button
                        onClick={closeTicket}
                        className="flex items-center gap-xs rounded-lg bg-[#3f9d78] px-md py-sm text-sm font-semibold text-white hover:opacity-90"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        {t("resolve")}
                      </button>
                    )}
                  </div>
                </header>
              }
              messages={messages}
              currentUserId={currentUserId}
              loading={loadingMessages}
              loadingLabel={t("loadingMessages")}
              emptyLabel={t("noMessagesYet")}
              inputValue={reply}
              onInputChange={setReply}
              onSend={sendReply}
              inputPlaceholder={t("replyPlaceholder")}
              multiline
              sendDisabled={sending}
              sending={sending}
              footer={selected.status === "CLOSED" ? null : undefined}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-md bg-[#080807] p-md text-[#9d948a]">
              <span className="material-symbols-outlined text-5xl text-[#d4aa61]">forum</span>
              <p>{t("selectConversation")}</p>
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}
