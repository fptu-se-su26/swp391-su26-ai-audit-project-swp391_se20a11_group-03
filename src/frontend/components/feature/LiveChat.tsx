"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { chatbotApi } from "@/lib/api";

type ChatMessage = {
  id: string;
  from: "user" | "agent";
  text: string;
};

export default function LiveChat() {
  const t = useTranslations("liveChat");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "1", from: "agent", text: t("hello") },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Messages has its own chat surface, so the floating button is hidden there.
  if (pathname === "/messages" || pathname.startsWith("/messages/")) {
    return null;
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const response = await chatbotApi.reply(text);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), from: "agent", text: response.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          from: "agent",
          text: t("fallback"),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="glass-panel mb-3 flex h-96 w-80 flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-semibold">{t("title")}</span>
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
            {sending && (
              <div className="max-w-[85%] rounded-2xl bg-white/10 px-3.5 py-2 text-xs text-white/60">
                {t("replying")}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 p-3">
            <input
              type="text"
              value={input}
              disabled={sending}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void sendMessage()}
              placeholder={t("placeholder")}
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={sending || !input.trim()}
              aria-label={t("send")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--luxora-gold)] text-black disabled:cursor-not-allowed disabled:opacity-40"
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
