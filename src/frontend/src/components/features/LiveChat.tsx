"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import { getStoredUser, getUserDisplayName, subscribeStoredUser } from "@/lib/userSession";

export default function LiveChat() {
  const t = useTranslations("liveChat");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [displayName, setDisplayName] = useState("Collector");

  useEffect(() => {
    const syncUser = () => setDisplayName(getUserDisplayName(getStoredUser()));
    syncUser();
    return subscribeStoredUser(syncUser);
  }, []);

  const initialMessages = useMemo(
    () => [
      { from: "agent" as const, text: t("initialAgent1", { name: displayName }), time: "8:42 PM" },
      { from: "user" as const, text: t("initialUser1"), time: "8:45 PM" },
      { from: "agent" as const, text: t("initialAgent2"), time: "8:46 PM" },
    ],
    [displayName, t],
  );

  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const send = () => {
    if (!input.trim()) {
      return;
    }

    setMessages((prev) => [...prev, { from: "user", text: input, time: "Now" }]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-6 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[#f0d68f]/40 bg-gradient-to-br from-[#dabb6d] to-[#a57c2c] text-[#071626] shadow-[0_14px_38px_rgba(7,22,38,.26)] transition-all duration-300 hover:scale-105 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#dabb6d] sm:bottom-8 sm:right-8"
        aria-label={open ? "Close luxury concierge" : "Open luxury concierge"}
      >
        <span className="material-symbols-outlined text-[28px]">forum</span>
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[500px] w-[calc(100vw-2rem)] max-w-96 flex-col overflow-hidden rounded-3xl border border-[#cfb36b]/30 bg-[#0b1d2f] shadow-[0_24px_80px_rgba(0,0,0,.35)] sm:right-8">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#10283d] p-md">
            <div className="flex items-center gap-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d6b866]/15 material-symbols-outlined text-[#e2c477]">support_agent</span>
              <div>
                <p className="font-label-md text-white">{t("liveSupport")}</p>
                <p className="text-[10px] text-[#9babb7]">{t("auctionConcierge")}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-[#9babb7] hover:bg-white/10 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="no-scrollbar flex-1 space-y-md overflow-y-auto bg-[#091827] p-md">
            {messages.map((message, index) => (
              <div key={index} className={`flex flex-col ${message.from === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-sm shadow-sm ${
                    message.from === "user"
                      ? "rounded-tr-none bg-[#d3b463] text-[#071626]"
                      : "rounded-tl-none border border-white/10 bg-white/[.07] text-white"
                  }`}
                >
                  <p className="text-xs">{message.text}</p>
                </div>
                <span className="mx-1 mt-1 text-[10px] text-outline-variant">{message.time}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 bg-[#10283d] p-md">
            <div className="flex items-center gap-sm rounded-xl border border-white/10 bg-white/[.05] px-3 py-1 focus-within:border-[#c4a75c]">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && send()}
                placeholder={t("typeMessage")}
                className="flex-1 border-none bg-transparent p-2 text-sm text-white outline-none placeholder:text-[#728493] focus:ring-0"
              />
              <button onClick={send} className="text-[#d8ba6e] hover:text-[#f0d994]">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
