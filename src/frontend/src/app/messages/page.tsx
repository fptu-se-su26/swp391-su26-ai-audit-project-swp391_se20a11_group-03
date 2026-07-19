"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CollectorShell from "@/components/layout/CollectorShell";
import SupportChatPanel from "@/components/features/SupportChatPanel";
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
      <aside className="flex h-full w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#080706] lg:w-[330px] lg:rounded-l-3xl lg:rounded-tr-none">
        <div className="flex items-center justify-between gap-sm border-b border-white/10 p-5">
          <div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#d4aa61]">Private inbox</p><h2 className="mt-1 font-display-lg text-lg font-semibold text-white">{t("title")}</h2></div>
          {!isUserStaff && !isUserAdmin && (
            <button
              type="button"
              onClick={() => setShowNewModal(true)}
               className="flex items-center gap-1 rounded-full bg-[#d4aa61] px-3 py-2 text-[11px] font-bold text-[#100d08] transition hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              {t("newChat")}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-md text-center text-[#9d948a]">{t("loading")}</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-[#9d948a]">
              <span className="material-symbols-outlined text-3xl text-[#d4aa61]">forum</span><p className="mb-2 mt-3 font-display-lg font-semibold text-white">{t("emptyTitle")}</p>
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

      {activeConversation ? (
        <SupportChatPanel
          theme="dark"
          className="!rounded-none !border-0 lg:!rounded-r-3xl"
          header={
            <ConversationHeader
              conversation={activeConversation}
              currentUserId={currentUserId}
            />
          }
          messages={messages}
          currentUserId={currentUserId}
          loading={loadingMessages}
          loadingLabel={t("loadingMessages")}
          emptyLabel={t("noMessagesYet")}
          inputValue={input}
          onInputChange={setInput}
          onSend={send}
          inputPlaceholder={t("typeMessage")}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-b-3xl border border-t-0 border-white/10 bg-[#0a0908] p-md text-[#9d948a] lg:rounded-r-3xl lg:rounded-bl-none lg:border-l-0 lg:border-t">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 material-symbols-outlined text-3xl text-[#d4aa61]">chat</span>
          <p className="font-display-lg font-semibold text-white">{t("selectConversation")}</p>
          {!isUserStaff && !isUserAdmin && (
            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-xs rounded-lg bg-[#d4aa61] px-4 py-2 font-label-md text-[#100d08] hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {t("startNewChat")}
            </button>
          )}
        </div>
      )}

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
      className={`w-full flex items-center gap-md p-md border-b border-white/10 hover:bg-white/5 transition-colors text-left ${
        active ? "bg-white/5 border-r-2 border-r-[#d4aa61]" : ""
      }`}
    >
      <ConversationAvatar type={c.type} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-end mb-1">
          <span className="font-label-md text-white/90 truncate">{counterpart}</span>
          <span className="text-[10px] text-[#756d64] flex-shrink-0 ml-2">
            {new Date(c.updatedAt).toLocaleString("vi-VN")}
          </span>
        </div>
        <div className="flex items-center gap-xs">
          <span className="text-[10px] uppercase font-label-sm text-[#d4aa61]">
            {labelForType(c.type, t)}
          </span>
          <p className="text-sm text-[#9d948a] truncate flex-1">
            {c.lastMessage || c.subject}
          </p>
        </div>
        {isUnassignedStaffCase && (
          <span className="mt-1 inline-block rounded-full bg-[#d4aa61]/20 px-2 py-0.5 text-[10px] font-label-sm text-[#efcf88]">
            {t("unassignedBadge")}
          </span>
        )}
      </div>
      {c.unreadCount > 0 && (
        <span className="w-2 h-2 rounded-full bg-[#d4aa61] flex-shrink-0" />
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
    <div className="border-b border-white/10 p-md flex items-center gap-md bg-[#0e0d0b]">
      <ConversationAvatar type={c.type} />
      <div>
        <p className="font-label-md text-white">{counterpart}</p>
        <p className="text-xs text-[#9d948a]">
          {labelForType(c.type, t)} · {c.subject}
        </p>
      </div>
    </div>
  );
}

function ConversationAvatar({ type }: { type: Conversation["type"] }) {
  const icon = type === "BUYER_SELLER" ? "handshake" : "support_agent";
  return (
    <div className="w-10 h-10 rounded-full bg-[#d4aa61]/15 flex items-center justify-center text-[#d4aa61] shrink-0">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-md" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-[#0e0d0b] shadow-xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-md border-b border-white/10 flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-white">{t("newChat")}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9d948a] hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-md space-y-md">
          <div>
            <label className="mb-xs block font-label-sm text-label-sm text-[#9d948a]">
              {t("chooseRecipient")}
            </label>
            <div className="grid gap-xs">
              {isBuyer && (
                <button
                  type="button"
                  onClick={() => setType("BUYER_STAFF")}
                  className={`flex items-center gap-sm rounded-lg border px-3 py-2 text-left ${
                    type === "BUYER_STAFF" ? "border-[#d4aa61] bg-[#d4aa61]/10" : "border-white/10"
                  }`}
                >
                  <span className="material-symbols-outlined text-[#d4aa61]">support_agent</span>
                  <div>
                    <p className="font-label-md text-white">{t("contactSupport")}</p>
                    <p className="text-xs text-[#9d948a]">{t("contactSupportDesc")}</p>
                  </div>
                </button>
              )}
              {isSeller && (
                <button
                  type="button"
                  onClick={() => setType("SELLER_STAFF")}
                  className={`flex items-center gap-sm rounded-lg border px-3 py-2 text-left ${
                    type === "SELLER_STAFF" ? "border-[#d4aa61] bg-[#d4aa61]/10" : "border-white/10"
                  }`}
                >
                  <span className="material-symbols-outlined text-[#d4aa61]">support_agent</span>
                  <div>
                    <p className="font-label-md text-white">{t("contactSupport")}</p>
                    <p className="text-xs text-[#9d948a]">{t("sellerContactSupportDesc")}</p>
                  </div>
                </button>
              )}
              <button
                type="button"
                onClick={() => setType("BUYER_SELLER")}
                className={`flex items-center gap-sm rounded-lg border px-3 py-2 text-left ${
                  type === "BUYER_SELLER" ? "border-[#d4aa61] bg-[#d4aa61]/10" : "border-white/10"
                }`}
              >
                <span className="material-symbols-outlined text-[#d4aa61]">handshake</span>
                <div>
                  <p className="font-label-md text-white">{t("contactSeller")}</p>
                  <p className="text-xs text-[#9d948a]">{t("contactSellerDesc")}</p>
                </div>
              </button>
            </div>
          </div>

          {type === "BUYER_SELLER" && (
            <div>
              <label className="mb-xs block font-label-sm text-label-sm text-[#9d948a]">
                {t("sellerEmailLabel")}
              </label>
              <input
                type="text"
                value={sellerEmail}
                onChange={(e) => setSellerEmail(e.target.value)}
                placeholder={t("sellerEmailPlaceholder")}
                className="w-full rounded-lg border border-white/15 bg-[#080706] px-3 py-2 text-white outline-none focus:border-[#d4aa61]"
              />
            </div>
          )}

          <div>
            <label className="mb-xs block font-label-sm text-label-sm text-[#9d948a]">
              {t("subjectLabel")}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("subjectPlaceholder")}
              className="w-full rounded-lg border border-white/15 bg-[#080706] px-3 py-2 text-white outline-none focus:border-[#d4aa61]"
            />
          </div>

          <div>
            <label className="mb-xs block font-label-sm text-label-sm text-[#9d948a]">
              {t("firstMessageLabel")}
            </label>
            <textarea
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              rows={4}
              placeholder={t("firstMessagePlaceholder")}
              className="w-full rounded-lg border border-white/15 bg-[#080706] px-3 py-2 text-white outline-none focus:border-[#d4aa61] resize-none"
            />
          </div>

          {productId && (
            <p className="text-xs text-[#9d948a]">
              {t("linkedProduct")}: #{productId}
            </p>
          )}
        </div>

        <div className="p-md border-t border-white/10 flex justify-end gap-sm">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-4 py-2 font-label-md text-[#9d948a] hover:bg-white/5"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="rounded-lg bg-[#d4aa61] px-4 py-2 font-label-md text-[#100d08] hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? t("sending") : t("startChat")}
          </button>
        </div>
      </div>
    </div>
  );
}
