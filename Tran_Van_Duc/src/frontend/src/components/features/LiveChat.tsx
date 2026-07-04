"use client";

import { useState } from "react";

const INITIAL_MESSAGES = [
  { from: "agent" as const, text: "Good evening, Mr. Sterling. How can I assist you with your bids today?", time: "8:42 PM" },
  { from: "user" as const, text: "I'm interested in the status of Lot #18. Is there any private treaty information?", time: "8:45 PM" },
  { from: "agent" as const, text: "Absolutely. Let me fetch the specialist for you. One moment.", time: "8:46 PM" },
];

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input, time: "Now" }]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center soft-shadow glow-accent hover:scale-105 transition-transform z-50"
      >
        <span className="material-symbols-outlined text-[28px]">forum</span>
      </button>

      {open && (
        <div className="fixed bottom-24 right-8 w-80 md:w-96 h-[500px] bg-primary-container border border-secondary/30 rounded-xl soft-shadow flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-secondary p-md flex justify-between items-center">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-on-secondary">support_agent</span>
              <div>
                <p className="font-label-md text-on-secondary">Live Support</p>
                <p className="text-[10px] text-on-secondary/80">Auction Concierge</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-on-secondary">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-md space-y-md overflow-y-auto bg-[#0d1c32] bg-opacity-95 no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.from === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`p-sm rounded-lg max-w-[80%] shadow-sm ${
                    msg.from === "user"
                      ? "bg-secondary text-on-secondary rounded-tr-none"
                      : "bg-surface-container text-on-surface rounded-tl-none"
                  }`}
                >
                  <p className="text-xs">{msg.text}</p>
                </div>
                <span className="text-[10px] text-outline-variant mt-1 mx-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-md bg-primary-container border-t border-outline-variant/30">
            <div className="flex items-center gap-sm bg-on-primary/5 rounded-lg border border-outline-variant/30 px-3 py-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-on-primary text-sm p-2 outline-none"
              />
              <button onClick={send} className="text-secondary">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
