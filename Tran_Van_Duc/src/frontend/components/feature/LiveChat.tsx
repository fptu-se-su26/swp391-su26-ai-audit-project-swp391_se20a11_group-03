"use client";

import { useState } from "react";

type ChatMessage = {
  id: string;
  from: "user" | "agent";
  text: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "1", from: "agent", text: "Xin chào! BidZone có thể hỗ trợ gì cho bạn?" },
];

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  function sendMessage() {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), from: "user", text: input.trim() },
    ]);
    setInput("");
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="glass-panel mb-3 flex h-96 w-80 flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-semibold">Hỗ trợ trực tuyến</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/40 hover:text-white"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs ${
                  m.from === "user"
                    ? "ml-auto bg-[var(--luxora-gold)] text-black"
                    : "bg-white/10 text-white/80"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
            />
            <button
              type="button"
              onClick={sendMessage}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--luxora-gold)] text-black"
            >
              <span className="material-symbols-outlined text-base">
                send
              </span>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="glow-accent flex h-14 w-14 items-center justify-center rounded-full bg-[var(--luxora-gold)] text-black shadow-lg"
      >
        <span className="material-symbols-outlined text-2xl">
          {open ? "close" : "chat"}
        </span>
      </button>
    </div>
  );
}
