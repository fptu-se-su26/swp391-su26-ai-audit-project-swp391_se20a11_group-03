"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import { useAuctionChatRealtime } from "@/lib/hooks/useAuctionChatRealtime";
import { getStoredToken } from "@/lib/apiClient";
import {
  AuctionChatMessage,
  AuctionChatStatus,
  getAuctionChatMessages,
  getAuctionChatStatus,
  sendAuctionChatMessage,
} from "@/lib/services/auctionChatService";

type Props = {
  auctionId: number;
  endTime?: string | null;
};

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export default function AuctionRoomChat({ auctionId, endTime }: Props) {
  const t = useTranslations("auctionRoom");
  const [messages, setMessages] = useState<AuctionChatMessage[]>([]);
  const [status, setStatus] = useState<AuctionChatStatus | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const hasToken = Boolean(getStoredToken());

  const appendMessage = useCallback((msg: AuctionChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.messageId === msg.messageId)) return prev;
      return [...prev, msg];
    });
  }, []);

  const { connected, publish } = useAuctionChatRealtime(auctionId, appendMessage);

  const refreshStatus = useCallback(async () => {
    try {
      const next = await getAuctionChatStatus(auctionId);
      setStatus(next);
      return next;
    } catch {
      setStatus({ open: false, phase: "CLOSED", closesAt: null });
      return null;
    }
  }, [auctionId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([getAuctionChatMessages(auctionId), getAuctionChatStatus(auctionId)])
      .then(([list, nextStatus]) => {
        if (cancelled) return;
        setMessages(list);
        setStatus(nextStatus);
      })
      .catch(() => {
        if (!cancelled) setError(t("chatLoadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [auctionId, t]);

  useEffect(() => {
    const tick = () => {
      void refreshStatus();
    };
    tick();
    const handle = window.setInterval(tick, 15_000);
    return () => window.clearInterval(handle);
  }, [refreshStatus, endTime]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const chatOpen = status?.open ?? false;

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !chatOpen || sending) return;

    if (!hasToken) {
      setError(t("chatLoginRequired"));
      return;
    }

    setSending(true);
    setError("");
    try {
      const sentViaWs = publish(content);
      if (!sentViaWs) {
        const saved = await sendAuctionChatMessage(auctionId, content);
        appendMessage(saved);
      }
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("chatSendError"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[600px] lg:h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface">
      <div className="flex items-center justify-between border-b border-outline-variant px-md py-sm">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-secondary">forum</span>
          <h3 className="font-headline-sm text-headline-sm text-primary">{t("chatRoomTitle")}</h3>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            chatOpen
              ? "bg-tertiary-container text-on-tertiary-container"
              : "bg-surface-variant text-on-surface-variant"
          }`}
        >
          {chatOpen ? (status?.phase === "GRACE" ? t("chatClosingSoon") : t("chatLive")) : t("chatClosed")}
        </span>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-md">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            {t("chatLoading")}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-on-surface-variant">
            <span className="material-symbols-outlined mb-sm text-4xl text-secondary">forum</span>
            <p className="font-label-md text-label-md text-primary">{t("chatLiveRoom")}</p>
            <p className="mt-xs">{chatOpen ? t("chatEmptyOpen") : t("chatClosedMsg")}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {messages.map((msg) => (
              <li key={msg.messageId} className="rounded-xl bg-surface-container-low px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-primary">{msg.senderName}</p>
                  <span className="shrink-0 text-[10px] text-on-surface-variant">{formatTime(msg.sentAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-on-surface">{msg.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-outline-variant p-md">
        {!hasToken ? (
          <div className="rounded-xl bg-surface-container-low px-3 py-3 text-center text-sm text-on-surface-variant">
            <p>{t("chatLoginRequired")}</p>
            <Link href="/auth" className="mt-2 inline-block text-primary hover:underline">
              {t("chatLoginCta")}
            </Link>
          </div>
        ) : chatOpen ? (
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder={t("chatPlaceholder")}
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-on-primary transition hover:opacity-90 disabled:opacity-50"
              title={t("chatSend")}
            >
              <span className="material-symbols-outlined text-[20px]">
                {sending ? "progress_activity" : "send"}
              </span>
            </button>
          </form>
        ) : (
          <div className="rounded-xl bg-error-container/20 px-3 py-3 text-sm text-on-surface-variant">
            <p className="font-medium text-error">{t("chatClosedTitle")}</p>
            <p className="mt-1">{t("chatClosedMsg")}</p>
          </div>
        )}
        {error && <p className="mt-2 text-xs text-error">{error}</p>}
        {hasToken && !connected && chatOpen && (
          <p className="mt-2 text-[10px] text-on-surface-variant">{t("chatReconnecting")}</p>
        )}
      </div>
    </div>
  );
}
