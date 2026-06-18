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
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-on-secondary soft-shadow transition-transform hover:scale-105"
      >
        <span className="material-symbols-outlined text-[28px]">forum</span>
      </button>

      {open && (
        <div className="fixed bottom-24 right-8 z-50 flex h-[500px] w-80 flex-col overflow-hidden rounded-xl border border-secondary/30 bg-primary-container soft-shadow md:w-96">
          <div className="flex items-center justify-between bg-secondary p-md">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-on-secondary">support_agent</span>
              <div>
                <p className="font-label-md text-on-secondary">{t("liveSupport")}</p>
                <p className="text-[10px] text-on-secondary/80">{t("auctionConcierge")}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-on-secondary">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="no-scrollbar flex-1 space-y-md overflow-y-auto bg-[#0d1c32] bg-opacity-95 p-md">
            {messages.map((message, index) => (
              <div key={index} className={`flex flex-col ${message.from === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-sm shadow-sm ${
                    message.from === "user"
                      ? "rounded-tr-none bg-secondary text-on-secondary"
                      : "rounded-tl-none bg-surface-container text-on-surface"
                  }`}
                >
                  <p className="text-xs">{message.text}</p>
                </div>
                <span className="mx-1 mt-1 text-[10px] text-outline-variant">{message.time}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-outline-variant/30 bg-primary-container p-md">
            <div className="flex items-center gap-sm rounded-lg border border-outline-variant/30 bg-on-primary/5 px-3 py-1">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && send()}
                placeholder={t("typeMessage")}
                className="flex-1 border-none bg-transparent p-2 text-sm text-on-primary outline-none focus:ring-0"
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
