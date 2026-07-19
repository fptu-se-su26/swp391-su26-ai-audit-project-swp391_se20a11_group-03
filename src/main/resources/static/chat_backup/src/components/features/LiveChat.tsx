"use client";

import { useState, useEffect, useRef } from "react";
import { useWebSocket, getOrCreateRoom } from "@/lib/useWebSocket";
import { useCurrentUser } from "@/lib/useCurrentUser";

export default function LiveChat() {
  const currentUser = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [roomId, setRoomId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, connected, sendMessage } = useWebSocket({
    roomId: open ? roomId : null,
    currentUserId: currentUser?.userId ?? 0,
  });

  useEffect(() => {
    if (open && !roomId && currentUser) {
      getOrCreateRoom(currentUser.userId).then(setRoomId).catch(console.error);
    }
  }, [open, roomId, currentUser?.userId]);

  // Auto scroll
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const formatTime = (sentAt: string) => {
    const d = new Date(sentAt);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const unreadCount = messages.filter(
    (m) => !m.isRead && m.senderId !== currentUser?.userId
  ).length;

  return (
    <>
      {/* Floating button */}
      <button
        id="livechat-toggle"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center soft-shadow glow-accent hover:scale-105 transition-transform z-50"
      >
        <span className="material-symbols-outlined text-[28px]">forum</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-8 w-80 md:w-96 h-[500px] bg-primary-container border border-secondary/30 rounded-xl soft-shadow flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-secondary p-md flex justify-between items-center">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-on-secondary">support_agent</span>
              <div>
                <p className="font-label-md text-on-secondary">Live Support</p>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-on-secondary/80 animate-pulse" : "bg-on-secondary/40"}`} />
                  <p className="text-[10px] text-on-secondary/80">
                    {connected ? "Connected" : "Connecting..."}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-on-secondary">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-md space-y-md overflow-y-auto bg-[#0d1c32] bg-opacity-95 no-scrollbar flex flex-col">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center flex-1 gap-2 text-outline/60">
                <span className="material-symbols-outlined text-[36px]">chat_bubble_outline</span>
                <p className="text-xs text-center">Gửi tin nhắn để bắt đầu chat với Staff hỗ trợ</p>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.senderId === currentUser?.userId;
              return (
                <div
                  key={msg.messageId}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`p-sm rounded-lg max-w-[80%] shadow-sm ${
                      isMe
                        ? "bg-secondary text-on-secondary rounded-tr-none"
                        : "bg-surface-container text-on-surface rounded-tl-none"
                    }`}
                  >
                    <p className="text-xs">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-outline-variant mt-1 mx-1">
                    {formatTime(msg.sentAt)}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-md bg-primary-container border-t border-outline-variant/30">
            <div className="flex items-center gap-sm bg-on-primary/5 rounded-lg border border-outline-variant/30 px-3 py-1">
              <input
                id="livechat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={connected ? "Type a message..." : "Đang kết nối..."}
                disabled={!connected}
                className="flex-1 bg-transparent border-none focus:ring-0 text-on-primary text-sm p-2 outline-none disabled:opacity-50"
              />
              <button
                id="livechat-send"
                onClick={handleSend}
                disabled={!connected || !input.trim()}
                className="text-secondary disabled:opacity-40 hover:scale-110 transition-transform"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
