"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  userApi,
  type Conversation,
  type ConversationMessage,
} from "@/lib/api";
import { connectChatRealtime } from "@/lib/chat-realtime";

const STATUS_CLASS: Record<string, string> = {
  OPEN: "bg-blue-500/10 text-blue-300",
  CLOSED: "bg-green-500/10 text-green-300",
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Đang mở",
  CLOSED: "Đã đóng",
};

function fmt(date: string | null) {
  return date
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(date))
    : "";
}

export default function SupportClient() {
  const [unassigned, setUnassigned] = useState<Conversation[]>([]);
  const [assigned, setAssigned] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadLists = useCallback(async () => {
    setError(null);
    try {
      const [un, mine] = await Promise.all([
        userApi.unassignedConversations(),
        userApi.assignedConversations(),
      ]);
      setUnassigned(un);
      setAssigned(mine);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể tải hộp thư hỗ trợ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void loadLists(), 0);
    return () => {
      window.clearTimeout(initialTimer);
    };
  }, [loadLists]);

  useEffect(() => connectChatRealtime({
    conversationId: selected?.conversationId,
    staffInbox: true,
    onConnectionChange: setRealtimeConnected,
    onConversation: () => { void loadLists(); },
    onMessage: (message) => {
      setMessages((current) => current.some((item) => item.messageId === message.messageId)
        ? current : [...current, message]);
      setAssigned((current) => current.map((conversation) =>
        conversation.conversationId === message.conversationId
          ? { ...conversation, lastMessage: message.content, updatedAt: message.sentAt, unreadCount: 0 }
          : conversation));
      if (selected?.conversationId === message.conversationId) void userApi.markConversationRead(message.conversationId);
    },
  }), [selected?.conversationId, loadLists]);

  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      const list = await userApi.conversationMessages(conversationId);
      setMessages(list);
      userApi.markConversationRead(conversationId).catch(() => {});
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function select(conv: Conversation) {
    setSelected(conv);
    setReply("");
    setError(null);
    void loadMessages(conv.conversationId);
  }

  async function claim(conv: Conversation) {
    setBusy(true);
    setError(null);
    try {
      const updated = await userApi.assignConversation(conv.conversationId);
      setSelected(updated);
      await loadLists();
      void loadMessages(updated.conversationId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể nhận ticket này.");
    } finally {
      setBusy(false);
    }
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const sent = await userApi.sendMessage(selected.conversationId, reply.trim());
      setMessages((current) => current.some((item) => item.messageId === sent.messageId)
        ? current : [...current, sent]);
      setReply("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không gửi được phản hồi.");
    } finally {
      setBusy(false);
    }
  }

  async function closeTicket() {
    if (!selected) return;
    if (!window.confirm("Đóng ticket này? Người dùng sẽ không gửi thêm tin nhắn được.")) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await userApi.closeConversation(selected.conversationId);
      setSelected(updated);
      await loadLists();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể đóng ticket.");
    } finally {
      setBusy(false);
    }
  }

  const q = query.trim().toLowerCase();
  const matches = (c: Conversation) =>
    !q ||
    c.subject?.toLowerCase().includes(q) ||
    c.userName?.toLowerCase().includes(q);

  const isMine = selected
    ? assigned.some((c) => c.conversationId === selected.conversationId)
    : false;
  const isOpen = (selected?.status ?? "").toUpperCase() === "OPEN";

  function renderItem(c: Conversation, section: "unassigned" | "mine") {
    const active = selected?.conversationId === c.conversationId;
    return (
      <button
        key={`${section}-${c.conversationId}`}
        type="button"
        onClick={() => select(c)}
        className={`flex w-full flex-col gap-1.5 border-b border-white/5 px-4 py-3 text-left transition-colors ${
          active ? "bg-white/5" : "hover:bg-white/[0.03]"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{c.userName ?? `#${c.userId}`}</p>
          {c.unreadCount > 0 && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--luxora-gold)]" />
          )}
        </div>
        <p className="truncate text-xs text-white/50">{c.subject || "(không có tiêu đề)"}</p>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[(c.status ?? "").toUpperCase()] ?? "bg-white/10 text-white/50"}`}
          >
            {STATUS_LABEL[(c.status ?? "").toUpperCase()] ?? c.status}
          </span>
          <span className="text-[10px] text-white/35">{fmt(c.updatedAt)}</span>
        </div>
      </button>
    );
  }

  return (
    <div className="m-4 flex h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-white/10">
      {/* Sidebar */}
      <aside className="w-80 shrink-0 overflow-y-auto border-r border-white/10">
        <div className="border-b border-white/10 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Hộp thư hỗ trợ
          </p>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc tiêu đề..."
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
          />
        </div>

        <p className="px-4 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-yellow-300/70">
          Chưa nhận ({unassigned.filter(matches).length})
        </p>
        {unassigned.filter(matches).map((c) => renderItem(c, "unassigned"))}
        {!loading && unassigned.length === 0 && (
          <p className="px-4 py-2 text-xs text-white/35">Không có ticket chờ nhận.</p>
        )}

        <p className="px-4 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-blue-300/70">
          Của tôi ({assigned.filter(matches).length})
        </p>
        {assigned.filter(matches).map((c) => renderItem(c, "mine"))}
        {!loading && assigned.length === 0 && (
          <p className="px-4 py-2 text-xs text-white/35">Bạn chưa nhận ticket nào.</p>
        )}
        {loading && <p className="px-4 py-3 text-xs text-white/40">Đang tải...</p>}
      </aside>

      {/* Detail */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!selected ? (
          <div className="flex flex-1 items-center justify-center text-sm text-white/40">
            Chọn một ticket để xem nội dung.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">
                  {selected.subject || "(không có tiêu đề)"}
                </p>
                <p className="text-sm text-white/40">
                  {selected.userName} · {fmt(selected.createdAt)} · {realtimeConnected ? "Realtime" : "Đang kết nối..."}
                  {selected.assignedStaffName ? ` · Phụ trách: ${selected.assignedStaffName}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!isMine && isOpen && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void claim(selected)}
                    className="rounded-full bg-[var(--luxora-gold)] px-5 py-2 text-xs font-bold text-black disabled:opacity-50"
                  >
                    {busy ? "..." : "Nhận xử lý"}
                  </button>
                )}
                {isMine && isOpen && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void closeTicket()}
                    className="rounded-full bg-green-500/10 px-5 py-2 text-xs font-semibold text-green-300 hover:bg-green-500/20 disabled:opacity-50"
                  >
                    Đóng ticket
                  </button>
                )}
                {!isOpen && (
                  <span className="rounded-full bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300">
                    Đã đóng
                  </span>
                )}
              </div>
            </div>

            {error && (
              <p className="mx-5 mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </p>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {messages.map((m) => {
                const fromCustomer = m.senderId === selected.userId;
                return (
                  <div
                    key={m.messageId}
                    className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                      fromCustomer
                        ? "bg-white/5 text-white/85"
                        : "ml-auto bg-[var(--luxora-gold)]/85 text-black"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <p
                      className={`mt-1 text-[10px] ${fromCustomer ? "text-white/35" : "text-black/50"}`}
                    >
                      {m.senderName} · {fmt(m.sentAt)}
                    </p>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <p className="py-10 text-center text-sm text-white/35">Chưa có tin nhắn.</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            {isMine && isOpen ? (
              <div className="border-t border-white/10 p-5">
                <textarea
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Nhập phản hồi..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
                />
                <button
                  type="button"
                  disabled={busy || !reply.trim()}
                  onClick={() => void sendReply()}
                  className="gradient-cta mt-3 rounded-full px-8 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
                >
                  {busy ? "Đang gửi..." : "Trả lời"}
                </button>
              </div>
            ) : isOpen ? (
              <p className="border-t border-white/10 p-5 text-center text-xs text-white/40">
                Bấm &quot;Nhận xử lý&quot; để trả lời ticket này.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
