"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CollectorShell from "@/components/layout/CollectorShell";
import ChatMessageList from "@/components/features/ChatMessageList";
import { useTranslations } from "@/i18n/I18nProvider";
import { apiClient } from "@/lib/apiClient";
import {
  StoredUser,
  getStoredUser,
  isAdmin,
  isBuyer,
  isSeller,
  isStaff,
  subscribeStoredUser,
} from "@/lib/userSession";
import { RealtimeChatMessage, useChatRealtime } from "@/lib/hooks/useChatRealtime";
import { appendChatMessage } from "@/lib/chatMessages";

type Conversation = {
  conversationId: number;
  userId: number;
  userName: string;
  assignedStaffId: number | null;
  assignedStaffName: string | null;
  sellerId: number | null;
  sellerName: string | null;
  productId: number | null;
  type: "BUYER_SELLER" | "BUYER_STAFF" | "SELLER_STAFF";
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: string | null;
  unreadCount: number;
};

type ConversationDetail = {
  info: Conversation;
  messages: Message[];
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

type CreateConversationRequest = {
  subject: string;
  firstMessage: string;
  type: "BUYER_SELLER" | "BUYER_STAFF" | "SELLER_STAFF";
  sellerId?: number;
  sellerEmail?: string;
  productId?: number;
};

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesPageInner />
    </Suspense>
  );
}

function MessagesPageInner() {
  const t = useTranslations("messagesPage");
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("conversationId");
  const sellerIdParam = searchParams.get("sellerId");
  const productIdParam = searchParams.get("productId");

  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    syncUser();
    return subscribeStoredUser(syncUser);
  }, []);

  const currentUserId = currentUser?.userId ?? null;
  const isUserAdmin = isAdmin(currentUser);
  const isUserStaff = isStaff(currentUser);
  const isUserBuyer = isBuyer(currentUser);
  const isUserSeller = isSeller(currentUser);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.conversationId === activeId) ?? null,
    [activeId, conversations],
  );

  const refreshConversations = useCallback(async (preferredId?: number | null) => {
    try {
      const data = await apiClient<Conversation[]>("/v1/conversations/my");
      setConversations(data ?? []);
      if (data && data.length > 0) {
        const target = preferredId
          ?? Number(requestedId)
          ?? data[0].conversationId;
        const exists = data.find((c) => c.conversationId === target);
        setActiveId(exists ? exists.conversationId : data[0].conversationId);
      } else {
        setActiveId(null);
      }
    } catch {
      setConversations([]);
      setActiveId(null);
    } finally {
      setLoading(false);
    }
  }, [requestedId]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Auto-open create-staff-support modal if no conversations
  useEffect(() => {
    if (!loading && conversations.length === 0 && !isUserStaff && !isUserAdmin) {
      if (sellerIdParam) {
        setShowNewModal(true);
      }
    }
  }, [loading, conversations.length, isUserStaff, isUserAdmin, sellerIdParam]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    async function fetchMessages() {
      setLoadingMessages(true);
      try {
        const data = await apiClient<ConversationDetail>(`/v1/conversations/${activeId}`);
        if (!cancelled) setMessages(data.messages ?? []);
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    }

    fetchMessages();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // Update URL khi đổi active conversation
  useEffect(() => {
    if (activeId) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("conversationId") !== String(activeId)) {
        params.set("conversationId", String(activeId));
        router.replace(`/messages?${params.toString()}`);
      }
    }
  }, [activeId, router]);

  const handleRealtimeMessage = useCallback(
    (msg: RealtimeChatMessage) => {
      if (msg.conversationId !== activeId) {
        void refreshConversations(activeId);
        return;
      }
      setMessages((current) => appendChatMessage(current, msg));
      void refreshConversations(activeId);
    },
    [activeId, refreshConversations],
  );

  const { connected: chatConnected } = useChatRealtime({
    conversationId: activeId,
    onMessage: handleRealtimeMessage,
    onConversationEvent: () => refreshConversations(activeId),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeId]);

  async function send() {
    if (!input.trim() || !activeId) return;
    const content = input.trim();
    setInput("");
    try {
      const created = await apiClient<Message>("/v1/messages", {
        method: "POST",
        body: { conversationId: activeId, content },
      });
      if (!chatConnected) {
        setMessages((current) => appendChatMessage(current, created));
      }
    } catch (err) {
      setInput(content);
      alert(err instanceof Error ? err.message : t("sendFailed"));
    }
  }

  async function handleCreateConversation(req: CreateConversationRequest) {
    try {
      const created = await apiClient<Conversation>("/v1/conversations", {
        method: "POST",
        body: req,
      });
      setShowNewModal(false);
      await refreshConversations(created.conversationId);
    } catch (error) {
      alert(error instanceof Error ? error.message : t("createFailed"));
    }
  }

  return (
    <CollectorShell mainClass="overflow-hidden">
      <div className="flex h-screen flex-col gap-0 p-4 sm:p-6 lg:flex-row lg:p-8">
      <aside className="flex h-full w-full flex-col overflow-hidden rounded-t-3xl border border-[#ddd6c9] bg-[#f8f5ee] lg:w-[330px] lg:rounded-l-3xl lg:rounded-tr-none">
        <div className="flex items-center justify-between gap-sm border-b border-[#e2dbcf] p-5">
          <div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#9a7429]">Private inbox</p><h2 className="mt-1 font-display-lg text-lg font-semibold text-[#071626]">{t("title")}</h2></div>
          {!isUserStaff && !isUserAdmin && (
            <button
              type="button"
              onClick={() => setShowNewModal(true)}
               className="flex items-center gap-1 rounded-full bg-[#071626] px-3 py-2 text-[11px] font-bold text-[#e4c77b] transition hover:bg-[#102a42]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              {t("newChat")}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-md text-center text-on-surface-variant">{t("loading")}</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-[#707a82]">
              <span className="material-symbols-outlined text-3xl text-[#b39858]">forum</span><p className="mb-2 mt-3 font-display-lg font-semibold text-[#071626]">{t("emptyTitle")}</p>
              <p className="text-xs leading-5">{t("emptyDesc")}</p>
            </div>
          ) : (
            conversations.map((c) => (
              <ConversationListItem
                key={c.conversationId}
                conversation={c}
                active={activeId === c.conversationId}
                onClick={() => setActiveId(c.conversationId)}
                currentUserId={currentUserId}
                isStaff={isUserStaff}
              />
            ))
          )}
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-3xl border border-t-0 border-[#ddd6c9] bg-[#fffdf9] lg:rounded-r-3xl lg:rounded-bl-none lg:border-l-0 lg:border-t">
        {activeConversation ? (
          <>
            <ConversationHeader
              conversation={activeConversation}
              currentUserId={currentUserId}
            />

            <div className="flex-1 space-y-md overflow-y-auto bg-[radial-gradient(circle_at_80%_15%,rgba(190,157,78,.06),transparent_25%)] p-md">
              {loadingMessages ? (
                <div className="text-center text-on-surface-variant">{t("loadingMessages")}</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-on-surface-variant">
                  <p>{t("noMessagesYet")}</p>
                </div>
              ) : (
                <ChatMessageList messages={messages} currentUserId={currentUserId} />
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-3 border-t border-[#e3ddd2] bg-white p-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={t("typeMessage")}
                className="flex-1 rounded-xl border border-[#d8d1c5] bg-[#faf7f1] px-4 py-3 text-sm outline-none focus:border-[#b9974f]"
              />
              <button
                type="button"
                onClick={send}
                className="grid h-11 w-11 place-items-center rounded-full bg-[#071626] text-[#e3c67a] transition hover:bg-[#102a42]"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-md text-[#707a82]">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f1ead9] material-symbols-outlined text-3xl text-[#977229]">chat</span>
            <p className="font-display-lg font-semibold text-[#071626]">{t("selectConversation")}</p>
            {!isUserStaff && !isUserAdmin && (
              <button
                type="button"
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-xs rounded-lg bg-secondary px-4 py-2 font-label-md text-on-secondary hover:bg-secondary-fixed-dim"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                {t("startNewChat")}
              </button>
            )}
          </div>
        )}
      </main>

      {showNewModal && (
        <NewConversationModal
          isBuyer={isUserBuyer}
          isSeller={isUserSeller}
          preselectedSellerId={sellerIdParam ? Number(sellerIdParam) : undefined}
          preselectedProductId={productIdParam ? Number(productIdParam) : undefined}
          onClose={() => setShowNewModal(false)}
          onSubmit={handleCreateConversation}
        />
      )}
      </div>
    </CollectorShell>
  );
}

function ConversationListItem({
  conversation: c,
  active,
  onClick,
  currentUserId,
  isStaff,
}: {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
  currentUserId: number | null;
  isStaff: boolean;
}) {
  const t = useTranslations("messagesPage");
  const counterpart = resolveCounterpart(c, currentUserId);
  const isUnassignedStaffCase =
    isStaff && c.assignedStaffId == null && c.type !== "BUYER_SELLER";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-md p-md border-b border-outline-variant/30 hover:bg-surface-container-high transition-colors text-left ${
        active ? "bg-surface-container-high border-r-2 border-r-secondary" : ""
      }`}
    >
      <ConversationAvatar type={c.type} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-end mb-1">
          <span className="font-label-md text-primary truncate">{counterpart}</span>
          <span className="text-[10px] text-outline flex-shrink-0 ml-2">
            {new Date(c.updatedAt).toLocaleString("vi-VN")}
          </span>
        </div>
        <div className="flex items-center gap-xs">
          <span className="text-[10px] uppercase font-label-sm text-secondary">
            {labelForType(c.type, t)}
          </span>
          <p className="text-sm text-on-surface-variant truncate flex-1">
            {c.lastMessage || c.subject}
          </p>
        </div>
        {isUnassignedStaffCase && (
          <span className="mt-1 inline-block rounded-full bg-tertiary-container px-2 py-0.5 text-[10px] font-label-sm text-on-tertiary-container">
            {t("unassignedBadge")}
          </span>
        )}
      </div>
      {c.unreadCount > 0 && (
        <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
      )}
    </button>
  );
}

function ConversationHeader({
  conversation: c,
  currentUserId,
}: {
  conversation: Conversation;
  currentUserId: number | null;
}) {
  const t = useTranslations("messagesPage");
  const counterpart = resolveCounterpart(c, currentUserId);
  return (
    <div className="p-md border-b border-outline-variant flex items-center gap-md">
      <ConversationAvatar type={c.type} />
      <div>
        <p className="font-label-md text-primary">{counterpart}</p>
        <p className="text-xs text-on-surface-variant">
          {labelForType(c.type, t)} · {c.subject}
        </p>
      </div>
    </div>
  );
}

function ConversationAvatar({ type }: { type: Conversation["type"] }) {
  const icon = type === "BUYER_SELLER" ? "handshake" : "support_agent";
  return (
    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-secondary shrink-0">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
  );
}

function resolveCounterpart(c: Conversation, currentUserId: number | null): string {
  if (c.type === "BUYER_SELLER") {
    if (currentUserId !== null && c.userId === currentUserId) {
      return c.sellerName || "Seller";
    }
    return c.userName;
  }
  return c.assignedStaffName || "Đội hỗ trợ";
}

function labelForType(type: Conversation["type"], t: (k: string) => string): string {
  if (type === "BUYER_SELLER") return t("typeBuyerSeller");
  if (type === "BUYER_STAFF") return t("typeBuyerStaff");
  return t("typeSellerStaff");
}

function NewConversationModal({
  isBuyer,
  isSeller,
  preselectedSellerId,
  preselectedProductId,
  onClose,
  onSubmit,
}: {
  isBuyer: boolean;
  isSeller: boolean;
  preselectedSellerId?: number;
  preselectedProductId?: number;
  onClose: () => void;
  onSubmit: (req: CreateConversationRequest) => void;
}) {
  const t = useTranslations("messagesPage");
  const [type, setType] = useState<CreateConversationRequest["type"]>(
    preselectedSellerId ? "BUYER_SELLER" : "BUYER_STAFF",
  );
  const [subject, setSubject] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [sellerEmail, setSellerEmail] = useState<string>("");
  const [productId, setProductId] = useState<string>(preselectedProductId ? String(preselectedProductId) : "");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = subject.trim() && firstMessage.trim() && (
    type !== "BUYER_SELLER" || sellerEmail.trim()
  );

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const req: CreateConversationRequest = {
        subject: subject.trim(),
        firstMessage: firstMessage.trim(),
        type,
        productId: productId ? Number(productId) : undefined,
      };
      if (type === "BUYER_SELLER") {
        const value = sellerEmail.trim();
        if (/^\d+$/.test(value)) {
          req.sellerId = Number(value);
        } else {
          req.sellerEmail = value;
        }
      }
      await onSubmit(req);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-md" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-surface shadow-xl border border-outline-variant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-md border-b border-outline-variant flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-primary">{t("newChat")}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-md space-y-md">
          <div>
            <label className="mb-xs block font-label-sm text-label-sm text-on-surface-variant">
              {t("chooseRecipient")}
            </label>
            <div className="grid gap-xs">
              {isBuyer && (
                <button
                  type="button"
                  onClick={() => setType("BUYER_STAFF")}
                  className={`flex items-center gap-sm rounded-lg border px-3 py-2 text-left ${
                    type === "BUYER_STAFF" ? "border-secondary bg-secondary-container" : "border-outline-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-secondary">support_agent</span>
                  <div>
                    <p className="font-label-md">{t("contactSupport")}</p>
                    <p className="text-xs text-on-surface-variant">{t("contactSupportDesc")}</p>
                  </div>
                </button>
              )}
              {isSeller && (
                <button
                  type="button"
                  onClick={() => setType("SELLER_STAFF")}
                  className={`flex items-center gap-sm rounded-lg border px-3 py-2 text-left ${
                    type === "SELLER_STAFF" ? "border-secondary bg-secondary-container" : "border-outline-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-secondary">support_agent</span>
                  <div>
                    <p className="font-label-md">{t("contactSupport")}</p>
                    <p className="text-xs text-on-surface-variant">{t("sellerContactSupportDesc")}</p>
                  </div>
                </button>
              )}
              <button
                type="button"
                onClick={() => setType("BUYER_SELLER")}
                className={`flex items-center gap-sm rounded-lg border px-3 py-2 text-left ${
                  type === "BUYER_SELLER" ? "border-secondary bg-secondary-container" : "border-outline-variant"
                }`}
              >
                <span className="material-symbols-outlined text-secondary">handshake</span>
                <div>
                  <p className="font-label-md">{t("contactSeller")}</p>
                  <p className="text-xs text-on-surface-variant">{t("contactSellerDesc")}</p>
                </div>
              </button>
            </div>
          </div>

          {type === "BUYER_SELLER" && (
            <div>
              <label className="mb-xs block font-label-sm text-label-sm text-on-surface-variant">
                {t("sellerEmailLabel")}
              </label>
              <input
                type="text"
                value={sellerEmail}
                onChange={(e) => setSellerEmail(e.target.value)}
                placeholder={t("sellerEmailPlaceholder")}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 outline-none focus:border-secondary"
              />
            </div>
          )}

          <div>
            <label className="mb-xs block font-label-sm text-label-sm text-on-surface-variant">
              {t("subjectLabel")}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("subjectPlaceholder")}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 outline-none focus:border-secondary"
            />
          </div>

          <div>
            <label className="mb-xs block font-label-sm text-label-sm text-on-surface-variant">
              {t("firstMessageLabel")}
            </label>
            <textarea
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              rows={4}
              placeholder={t("firstMessagePlaceholder")}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 outline-none focus:border-secondary resize-none"
            />
          </div>

          {productId && (
            <p className="text-xs text-on-surface-variant">
              {t("linkedProduct")}: #{productId}
            </p>
          )}
        </div>

        <div className="p-md border-t border-outline-variant flex justify-end gap-sm">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant px-4 py-2 font-label-md text-on-surface hover:bg-surface-container-high"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="rounded-lg bg-secondary px-4 py-2 font-label-md text-on-secondary hover:bg-secondary-fixed-dim disabled:opacity-50"
          >
            {submitting ? t("sending") : t("startChat")}
          </button>
        </div>
      </div>
    </div>
  );
}
