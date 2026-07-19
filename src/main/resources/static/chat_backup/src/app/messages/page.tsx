"use client";

import { useState, useEffect, useRef } from "react";
import CollectorShell from "@/components/layout/CollectorShell";
import { useWebSocket, getOrCreateConversation } from "@/lib/useWebSocket";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function MessagesPage() {
  const currentUser = useCurrentUser();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, connected, loading, sendMessage } = useWebSocket({
    conversationId,
    currentUserId: currentUser?.userId ?? 0,
  });

  useEffect(() => {
    if (!currentUser) return;
    getOrCreateConversation(currentUser.userId)
      .then(setConversationId)
      .catch(console.error);
  }, [currentUser?.userId]);

  // Tự động scroll xuống tin nhắn mới nhất
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    if (!connected) {
      setSendError("Not connected — please wait...");
      setTimeout(() => setSendError(""), 3000);
      return;
    }
    sendMessage(input);
    setInput("");
    setSendError("");
  };

  const formatTime = (sentAt: string) => {
    const d = new Date(sentAt);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <CollectorShell mainClass="flex-1 ml-0 md:ml-64 h-screen overflow-hidden flex bg-background">
      {/* Sidebar trái — chỉ 1 conversation (room của user này) */}
      <aside className="w-[30%] border-r border-outline-variant flex flex-col h-full bg-surface-container-low">
        <div className="p-md border-b border-outline-variant">
          <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Messages</h2>
          <div className="mt-sm relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-sm focus:border-secondary outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hiển thị room duy nhất của user với Staff Support */}
          <button className="w-full flex items-center gap-md p-md border-b border-outline-variant/30 bg-surface-container-high border-r-2 border-r-secondary text-left">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-end mb-1">
                <span className="font-label-md text-primary truncate">Support Staff</span>
                <span className="text-[10px] text-outline flex-shrink-0 ml-2">
                  {messages.length > 0
                    ? formatTime(messages[messages.length - 1].sentAt)
                    : ""}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant truncate">
                {messages.length > 0
                  ? messages[messages.length - 1].content
                  : "Chưa có tin nhắn"}
              </p>
            </div>
            {/* Unread indicator */}
            {messages.filter((m) => !m.isRead && m.senderId !== currentUser?.userId).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
            )}
          </button>
        </div>
      </aside>

      {/* Khu vực chat chính */}
      <section className="flex-1 flex flex-col h-full bg-surface-container-lowest overflow-hidden">
        {/* Header */}
        <header className="p-md border-b border-outline-variant bg-surface flex justify-between items-center">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <div>
              <h4 className="font-label-md text-primary font-bold">Support Liaison</h4>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${connected ? "bg-on-tertiary-container animate-pulse" : "bg-outline"}`} />
                <span className="text-[10px] text-on-surface-variant">
                  {connected ? "Active Now" : "Connecting..."}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">more_vert</button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-md space-y-lg bg-surface-container-lowest/50 no-scrollbar flex flex-col">
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full bg-surface-container text-[10px] text-outline uppercase tracking-widest">Today</span>
          </div>

          {loading && (
            <div className="flex justify-center py-4">
              <span className="text-sm text-outline">Đang tải tin nhắn...</span>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 gap-sm text-outline">
              <span className="material-symbols-outlined text-[48px]">chat_bubble</span>
              <p className="text-sm">Bắt đầu cuộc trò chuyện với Staff hỗ trợ</p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.userId;
            return (
              <div
                key={msg.messageId}
                className={`flex flex-col max-w-[80%] ${isMe ? "items-end self-end ml-auto" : "items-start"}`}
              >
                <div
                  className={`p-md rounded-2xl soft-shadow ${
                    isMe
                      ? "bg-secondary text-on-secondary rounded-tr-none glow-accent"
                      : "bg-surface-container text-on-surface rounded-tl-none border border-outline-variant/20"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
                <span className="text-[10px] text-outline mt-1 mx-2">{formatTime(msg.sentAt)}</span>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <footer className="p-md bg-primary-container border-t border-outline-variant/20">
          {sendError && (
            <p className="text-xs text-error mb-sm px-1">{sendError}</p>
          )}
          <div className="flex items-center gap-md bg-surface/5 rounded-xl border border-outline-variant/30 px-md py-sm">
            <input
              id="chat-input-user"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Write your message..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-on-primary text-sm p-2 outline-none"
            />
            <button
              id="chat-send-user"
              onClick={handleSend}
              disabled={!input.trim()}
              className="text-secondary hover:scale-110 active:scale-95 transition-transform disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </div>
        </footer>
      </section>
    </CollectorShell>
  );
}
