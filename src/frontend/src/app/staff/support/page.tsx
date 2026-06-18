"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StaffShell from "@/components/layout/StaffShell";
import { useTranslations } from "@/i18n/I18nProvider";
import { apiClient } from "@/lib/apiClient";

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
  OPEN: "bg-secondary-container text-on-secondary-container",
  IN_PROGRESS: "bg-primary-fixed text-on-primary-fixed-variant",
  CLOSED: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
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

  async function sendReply() {
    if (!reply.trim() || !selectedId) return;
    setSending(true);
    try {
      const created = await apiClient<Message>("/v1/messages", {
        method: "POST",
        body: { conversationId: selectedId, content: reply.trim() },
      });
      setMessages((cur) => [...cur, created]);
      setReply("");
      refreshConversations();
    } catch {
      // keep page stable
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
    <StaffShell>
      <div className="flex h-full overflow-hidden">
        <aside className="w-80 border-r border-outline-variant flex flex-col h-full bg-surface-container-low shrink-0">
          <div className="p-md border-b border-outline-variant">
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
              {t("pageTitle")}
            </h2>
            <div className="mt-sm relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:border-secondary outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-md text-center text-on-surface-variant">
                {t("loading")}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-md text-center text-on-surface-variant">
                <p className="mb-sm">{t("emptyTitle")}</p>
                <p className="text-sm">{t("emptyDesc")}</p>
              </div>
            ) : (
              filteredConversations.map((c) => (
                <button
                  key={c.conversationId}
                  onClick={() => setSelectedId(c.conversationId)}
                  className={`w-full text-left p-md border-b border-outline-variant/30 hover:bg-surface-container-high transition-colors ${
                    selectedId === c.conversationId
                      ? "bg-surface-container-high border-r-2 border-r-secondary"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-xs">
                    <span className="font-label-md text-primary text-sm truncate flex-1">
                      {c.type === "BUYER_STAFF" ? c.userName : c.userName}
                      {c.assignedStaffId == null && (
                        <span className="ml-2 inline-block rounded-full bg-tertiary-container px-2 py-0.5 text-[9px] font-label-sm text-on-tertiary-container">
                          {t("unassignedBadge")}
                        </span>
                      )}
                    </span>
                    {c.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-[10px] flex items-center justify-center flex-shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant truncate mb-xs">
                    {c.subject}
                  </p>
                  <div className="flex gap-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${STATUS_CFG[c.status]}`}
                    >
                      {t(`status${c.status.charAt(0) + c.status.slice(1).toLowerCase()}`)}
                    </span>
                    <span className="text-[10px] text-outline">
                      {formatDate(c.updatedAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col h-full overflow-hidden bg-background">
          {selected ? (
            <>
              <header className="p-md border-b border-outline-variant bg-surface flex justify-between items-start">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    {selected.subject}
                  </h3>
                  <div className="flex items-center gap-sm mt-xs">
                    <span className="font-label-sm text-on-surface-variant text-sm">
                      {selected.userName}
                    </span>
                    <span className="text-outline">·</span>
                    <span className="font-label-sm text-on-surface-variant text-sm">
                      {formatDate(selected.createdAt)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${STATUS_CFG[selected.status]}`}
                    >
                      {t(`status${selected.status.charAt(0) + selected.status.slice(1).toLowerCase()}`)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  {selected.status !== "CLOSED" && (
                    <button
                      onClick={closeTicket}
                      className="px-md py-sm rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm flex items-center gap-xs hover:opacity-90 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        check_circle
                      </span>
                      {t("resolve")}
                    </button>
                  )}
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-md space-y-md no-scrollbar">
                {loadingMessages ? (
                  <div className="text-center text-on-surface-variant">
                    {t("loadingMessages")}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-on-surface-variant">
                    <p>{t("noMessagesYet")}</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isStaff = m.senderRole === "Staff";
                    return (
                      <div
                        key={m.messageId}
                        className={`flex items-start gap-md ${
                          isStaff ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isStaff
                              ? "bg-secondary-container text-secondary"
                              : "bg-primary-container text-secondary"
                          }`}
                        >
                          <span className="material-symbols-outlined">
                            {isStaff ? "support_agent" : "person"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div
                            className={`flex items-center gap-sm mb-xs ${
                              isStaff ? "flex-row-reverse" : ""
                            }`}
                          >
                            <span className="font-label-md text-primary">
                              {m.senderName}
                            </span>
                            <span className="text-[10px] text-outline">
                              {formatDate(m.sentAt)}
                            </span>
                          </div>
                          <div
                            className={`rounded-2xl p-md soft-shadow max-w-[80%] ${
                              isStaff
                                ? "bg-secondary text-on-secondary rounded-tr-none ml-auto glow-accent"
                                : "bg-surface border border-outline-variant/20 rounded-tl-none"
                            }`}
                          >
                            <p className="font-body-md text-sm whitespace-pre-wrap break-words">
                              {m.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {selected.status !== "CLOSED" && (
                <footer className="p-md border-t border-outline-variant bg-surface-container-low">
                  <div className="flex items-start gap-md">
                    <textarea
                      rows={3}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          sendReply();
                        }
                      }}
                      placeholder={t("replyPlaceholder")}
                      className="flex-1 px-4 py-2.5 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none font-body-md text-sm"
                    />
                    <button
                      onClick={sendReply}
                      disabled={!reply.trim() || sending}
                      className="bg-secondary text-on-secondary rounded-xl px-md py-sm font-label-md text-label-md flex items-center gap-xs hover:bg-secondary-fixed-dim transition-colors glow-accent self-end disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        send
                      </span>
                      {sending ? t("sending") : t("reply")}
                    </button>
                  </div>
                </footer>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-md gap-md">
              <span className="material-symbols-outlined text-5xl">forum</span>
              <p>{t("selectConversation")}</p>
            </div>
          )}
        </section>
      </div>
    </StaffShell>
  );
}
