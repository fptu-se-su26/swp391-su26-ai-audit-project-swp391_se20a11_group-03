"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import ChatMessageList, { ChatMessageItem } from "./ChatMessageList";

type SupportChatPanelProps = {
  header: ReactNode;
  messages: ChatMessageItem[];
  currentUserId: number | null;
  loading?: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  inputPlaceholder?: string;
  sendDisabled?: boolean;
  footer?: ReactNode;
  /** textarea for staff (multiline) vs input for user */
  multiline?: boolean;
  sendLabel?: string;
  sending?: boolean;
  className?: string;
  theme?: "light" | "dark";
};

export default function SupportChatPanel({
  header,
  messages,
  currentUserId,
  loading = false,
  loadingLabel,
  emptyLabel,
  inputValue,
  onInputChange,
  onSend,
  inputPlaceholder,
  sendDisabled = false,
  footer,
  multiline = false,
  sendLabel,
  sending = false,
  className = "",
  theme = "light",
}: SupportChatPanelProps) {
  const tMsg = useTranslations("messagesPage");
  const tCommon = useTranslations("common");
  const resolvedLoading = loadingLabel ?? tMsg("loadingMessages");
  const resolvedEmpty = emptyLabel ?? tMsg("noMessagesYet");
  const resolvedPlaceholder = inputPlaceholder ?? tMsg("typeMessage");
  const resolvedSendLabel = sendLabel ?? tCommon("send");
  const isDark = theme === "dark";

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (multiline) {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onSend();
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      onSend();
    }
  };

  const shellClass = isDark
    ? "border-white/10 bg-[#0a0908] lg:border-t lg:border-l-0"
    : "border-[#ddd6c9] bg-[#fffdf9] lg:border-l-0 lg:border-t";

  const messagesAreaClass = isDark
    ? "bg-[radial-gradient(circle_at_80%_15%,rgba(212,170,97,0.08),transparent_28%)] bg-[#080807]"
    : "bg-[radial-gradient(circle_at_80%_15%,rgba(190,157,78,.06),transparent_25%)]";

  const mutedText = isDark ? "text-[#9d948a]" : "text-[#707a82]";

  const inputClass = isDark
    ? "flex-1 resize-none rounded-xl border border-white/15 bg-[#0e0d0b] px-4 py-2.5 text-sm text-white/90 outline-none focus:border-[#d4aa61]"
    : "flex-1 resize-none rounded-xl border border-[#d8d1c5] bg-[#faf7f1] px-4 py-2.5 text-sm text-[#263544] outline-none focus:border-[#b9974f]";

  const inputClassSingle = isDark
    ? "flex-1 rounded-xl border border-white/15 bg-[#0e0d0b] px-4 py-3 text-sm text-white/90 outline-none focus:border-[#d4aa61]"
    : "flex-1 rounded-xl border border-[#d8d1c5] bg-[#faf7f1] px-4 py-3 text-sm text-[#263544] outline-none focus:border-[#b9974f]";

  const footerClass = isDark
    ? "flex gap-3 border-t border-white/10 bg-[#0e0d0b] p-4"
    : "flex gap-3 border-t border-[#e3ddd2] bg-white p-4";

  const sendBtnClass = isDark
    ? "grid h-11 w-11 shrink-0 place-items-center self-end rounded-full bg-[#d4aa61] text-[#100d08] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    : "grid h-11 w-11 shrink-0 place-items-center self-end rounded-full bg-[#071626] text-[#e3c67a] transition hover:bg-[#102a42] disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <main
      className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-3xl border border-t-0 lg:rounded-r-3xl lg:rounded-bl-none ${shellClass} ${className}`}
    >
      {header}

      <div className={`flex-1 space-y-md overflow-y-auto p-md ${messagesAreaClass}`}>
        {loading ? (
          <div className={`text-center ${mutedText}`}>{resolvedLoading}</div>
        ) : messages.length === 0 ? (
          <div className={`text-center ${mutedText}`}>
            <p>{resolvedEmpty}</p>
          </div>
        ) : (
          <ChatMessageList messages={messages} currentUserId={currentUserId} theme={theme} />
        )}
        <div ref={endRef} />
      </div>

      {footer !== undefined ? (
        footer
      ) : (
        <div className={footerClass}>
          {multiline ? (
            <textarea
              rows={3}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={resolvedPlaceholder}
              className={inputClass}
            />
          ) : (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={resolvedPlaceholder}
              className={inputClassSingle}
            />
          )}
          <button
            type="button"
            onClick={onSend}
            disabled={sendDisabled || !inputValue.trim() || sending}
            className={sendBtnClass}
            aria-label={resolvedSendLabel}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      )}
    </main>
  );
}
