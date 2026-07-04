"use client";

import { useState } from "react";
import { mockMessages } from "@/lib/mock-data";
import CollectorShell from "@/components/layout/CollectorShell";

const CHAT_MESSAGES = [
  { from: "agent" as const, text: "Good evening, Mr. Sterling. How can I assist you with your bids today?", time: "8:42 PM" },
  { from: "user" as const, text: "I'm interested in the status of Lot #18. Is there any private treaty information available for verified collectors?", time: "8:45 PM" },
  { from: "agent" as const, text: "Absolutely. Let me fetch the specialist for you. One moment while I pull up the provenance documents.", time: "8:46 PM" },
];

export default function MessagesPage() {
  const [activeId, setActiveId] = useState(mockMessages[0].id);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(CHAT_MESSAGES);

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input, time: "Now" }]);
    setInput("");
  };

  return (
    <CollectorShell mainClass="flex-1 ml-0 md:ml-64 h-screen overflow-hidden flex bg-background">
      {/* Conversation List */}
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
          {mockMessages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => setActiveId(msg.id)}
              className={`w-full flex items-center gap-md p-md border-b border-outline-variant/30 hover:bg-surface-container-high transition-colors text-left ${
                activeId === msg.id ? "bg-surface-container-high border-r-2 border-r-secondary" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined">{msg.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-label-md text-primary truncate">{msg.sender}</span>
                  <span className="text-[10px] text-outline flex-shrink-0 ml-2">{msg.time}</span>
                </div>
                <p className="text-sm text-on-surface-variant truncate">{msg.preview}</p>
              </div>
              {msg.unread && <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />}
            </button>
          ))}
        </div>
      </aside>

      {/* Active Chat */}
      <section className="flex-1 flex flex-col h-full bg-surface-container-lowest overflow-hidden">
        <header className="p-md border-b border-outline-variant bg-surface flex justify-between items-center">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <div>
              <h4 className="font-label-md text-primary font-bold">Support Liaison</h4>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse" />
                <span className="text-[10px] text-on-surface-variant">Active Now</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">call</button>
            <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">videocam</button>
            <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">more_vert</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-md space-y-lg bg-surface-container-lowest/50 no-scrollbar flex flex-col">
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full bg-surface-container text-[10px] text-outline uppercase tracking-widest">Today</span>
          </div>
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col max-w-[80%] ${msg.from === "user" ? "items-end self-end ml-auto" : "items-start"}`}>
              <div
                className={`p-md rounded-2xl soft-shadow ${
                  msg.from === "user"
                    ? "bg-secondary text-on-secondary rounded-tr-none glow-accent"
                    : "bg-surface-container text-on-surface rounded-tl-none border border-outline-variant/20"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              <span className="text-[10px] text-outline mt-1 mx-2">{msg.time}</span>
            </div>
          ))}
        </div>

        <footer className="p-md bg-primary-container border-t border-outline-variant/20">
          <div className="flex items-center gap-md bg-surface/5 rounded-xl border border-outline-variant/30 px-md py-sm">
            <button className="text-outline-variant hover:text-secondary transition-colors">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <button className="text-outline-variant hover:text-secondary transition-colors">
              <span className="material-symbols-outlined">image</span>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Write your message..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-on-primary text-sm p-2 outline-none"
            />
            <button onClick={send} className="text-secondary hover:scale-110 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </div>
        </footer>
      </section>
    </CollectorShell>
  );
}
