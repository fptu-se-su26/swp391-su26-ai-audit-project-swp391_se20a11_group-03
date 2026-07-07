"use client";

import { useState } from "react";
import { mockMessages } from "@/lib/mock-data";

type ChatBubble = {
  id: string;
  from: "user" | "agent";
  text: string;
};

const INITIAL_CHAT: ChatBubble[] = [
  { id: "1", from: "agent", text: "Chào bạn, tôi có thể hỗ trợ gì cho bạn hôm nay?" },
  { id: "2", from: "user", text: "Tôi muốn hỏi về tình trạng đơn hàng LOT 041." },
  { id: "3", from: "agent", text: "Đơn hàng của bạn đang được đóng gói và sẽ giao trong 3-5 ngày." },
];

export default function MessagesClient() {
  const [activeId, setActiveId] = useState(mockMessages[0].id);
  const [messages, setMessages] = useState<ChatBubble[]>(INITIAL_CHAT);
  const [input, setInput] = useState("");

  const active = mockMessages.find((m) => m.id === activeId) ?? mockMessages[0];

  function sendMessage() {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), from: "user", text: input.trim() },
    ]);
    setInput("");
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border border-white/10 m-4">
      {/* Aside trái */}
      <aside className="flex w-full max-w-xs flex-col border-r border-white/10">
        <div className="border-b border-white/10 p-4">
          <h1 className="font-headline-md text-lg">Tin nhắn</h1>
          <input
            type="text"
            placeholder="Tìm kiếm hội thoại..."
            className="mt-3 w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
          />
        </div>
        <div className="custom-scrollbar flex-1 overflow-y-auto">
          {mockMessages.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveId(m.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeId === m.id ? "bg-white/5" : "hover:bg-white/[0.03]"
              }`}
            >
              <div
                className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${m.avatar})` }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-semibold">{m.sender}</p>
                  <span className="shrink-0 text-[10px] text-white/30">
                    {m.time}
                  </span>
                </div>
                <p className="truncate text-xs text-white/40">{m.preview}</p>
              </div>
              {m.unread && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--luxora-gold)]" />
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Khung chat phải */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-sm font-semibold">{active.sender}</p>
            <p className="text-[11px] text-green-300">Đang hoạt động</p>
          </div>
          <div className="flex gap-2 text-white/40">
            <span className="material-symbols-outlined">call</span>
            <span className="material-symbols-outlined">videocam</span>
            <span className="material-symbols-outlined">more_vert</span>
          </div>
        </div>

        <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                m.from === "user"
                  ? "ml-auto bg-[var(--luxora-gold)] text-black"
                  : "bg-white/10 text-white/80"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
          />
          <button
            type="button"
            onClick={sendMessage}
            className="gradient-cta flex h-11 w-11 items-center justify-center rounded-full text-black"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
