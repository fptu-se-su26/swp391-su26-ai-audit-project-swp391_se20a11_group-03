"use client";

import { useEffect, useRef, useState } from "react";
import { getStoredToken } from "@/lib/apiClient";
import { useTranslations } from "@/i18n/I18nProvider";

export type AiChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ValuationPayload = {
  productName: string;
  description: string;
  startingPrice: number;
  message?: string;
  images: { mimeType: string; base64: string }[];
};

type Props = {
  productName: string;
  description: string;
  startingPrice: number;
  imageFiles: File[];
  imagePreviews: string[];
  imageCount: number;
  maxImages: number;
  onAddImages: (files: FileList | File[]) => void;
  onRemoveImage: (index: number) => void;
};

const COOLDOWN_MS = 60_000;

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isRateLimitMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("429") ||
    lower.includes("giới hạn") ||
    lower.includes("rate") ||
    lower.includes("bận")
  );
}

async function fileToBase64Payload(file: File): Promise<{ mimeType: string; base64: string }> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return {
    mimeType: file.type || "image/jpeg",
    base64: btoa(binary),
  };
}

export default function AiValuationChat({
  productName,
  description,
  startingPrice,
  imageFiles,
  imagePreviews,
  imageCount,
  maxImages,
  onAddImages,
  onRemoveImage,
}: Props) {
  const t = useTranslations("sell");
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t("aiChatWelcome"),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) {
      setCooldownSeconds(0);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownSeconds(remaining);
      if (remaining <= 0) {
        setError(null);
      }
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [cooldownUntil]);

  const isCoolingDown = cooldownUntil > Date.now();
  const actionsDisabled = loading || isCoolingDown;

  function hasValuationContent(userText: string) {
    return Boolean(description.trim() || userText.trim() || imageFiles.length > 0);
  }

  async function callValuation(payload: ValuationPayload) {
    const token = getStoredToken();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8096/api"}/ai/valuation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || t("aiChatError"));
    }
    const reply =
      data?.data?.reply ??
      data?.data?.summary ??
      data?.message;
    if (!reply || typeof reply !== "string") {
      throw new Error(t("aiChatError"));
    }
    return reply as string;
  }

  async function buildImages() {
    const files = imageFiles.slice(0, 3);
    const images: { mimeType: string; base64: string }[] = [];
    for (const file of files) {
      images.push(await fileToBase64Payload(file));
    }
    return images;
  }

  function resolveApiMessage(userText: string, isFormValuation: boolean) {
    const trimmed = userText.trim();
    if (trimmed) return trimmed;
    if (isFormValuation) return t("aiChatValueFromForm");
    return undefined;
  }

  function resolveDisplayUser(userText: string, isFormValuation: boolean) {
    const trimmed = userText.trim();
    if (trimmed) return trimmed;
    if (isFormValuation) return t("getAiValuation");
    return t("getAiValuation");
  }

  async function runValuation(userText: string, isFormValuation: boolean) {
    if (inFlightRef.current || isCoolingDown) return;

    const desc = description.trim();
    if (!hasValuationContent(userText)) {
      setError(t("aiChatNeedContent"));
      return;
    }
    if (isFormValuation && !desc && imageFiles.length === 0) {
      setError(t("aiChatNeedContent"));
      return;
    }

    inFlightRef.current = true;
    setError(null);
    setLoading(true);
    const displayUser = resolveDisplayUser(userText, isFormValuation);
    setMessages((prev) => [...prev, { id: uid(), role: "user", content: displayUser }]);

    try {
      const images = await buildImages();
      const reply = await callValuation({
        productName: productName.trim(),
        description: desc,
        startingPrice: startingPrice || 0,
        message: resolveApiMessage(userText, isFormValuation),
        images,
      });
      setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("aiChatError");
      if (isRateLimitMessage(msg)) {
        setCooldownUntil(Date.now() + COOLDOWN_MS);
        setError(t("aiChatRateLimited", { seconds: Math.ceil(COOLDOWN_MS / 1000) }));
      } else {
        setError(msg);
      }
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }

  async function handleSend() {
    if (actionsDisabled) return;
    const text = input.trim();
    if (!text) return;
    setInput("");
    await runValuation(text, false);
  }

  async function handleFormValuation() {
    if (actionsDisabled) return;
    await runValuation(t("aiChatValueFromForm"), true);
  }

  function handleAttachClick() {
    if (imageCount >= maxImages || actionsDisabled) return;
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    onAddImages(list);
    e.target.value = "";
  }

  const canSend = !actionsDisabled && Boolean(input.trim());
  const canAttach = !actionsDisabled && imageCount < maxImages;

  const errorDisplay =
    isCoolingDown && cooldownSeconds > 0
      ? t("aiChatRateLimited", { seconds: cooldownSeconds })
      : error;

  return (
    <div className="sticky top-base flex h-[min(720px,calc(100vh-6rem))] flex-col overflow-hidden rounded-xl border border-[#d4aa61]/25 bg-[#12100c] soft-shadow">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#e7c57c]">smart_toy</span>
          <h2 className="font-headline-md text-lg font-semibold text-[#f5ead9]">{t("aiValuation")}</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#cfc5b8]">{t("aiValuationDesc")}</p>
      </div>

      <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                m.role === "user"
                  ? "rounded-br-md bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] text-[#100d08]"
                  : "rounded-bl-md border border-white/10 bg-white/[.06] text-[#f5ead9]"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-[#b7aea3]">
            <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
            {t("analyzing")}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {errorDisplay && (
        <div className="mx-4 mb-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {errorDisplay}
        </div>
      )}

      <div className="space-y-2 border-t border-white/10 bg-[#0e0d0b] p-4">
        {imagePreviews.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-[#b7aea3]">
              {t("aiChatPhotosAttached", { count: imageCount, max: maxImages })}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {imagePreviews.map((src, idx) => (
                <div
                  key={src}
                  className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-[#080706]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute left-0.5 top-0.5 rounded bg-[#d4aa61] px-1 text-[9px] font-semibold text-[#100d08]">
                      {t("primary")}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveImage(idx)}
                    disabled={actionsDisabled}
                    className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-white transition hover:bg-black/90 disabled:opacity-50"
                    aria-label={t("aiChatRemoveImage")}
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleFormValuation}
          disabled={actionsDisabled}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#d4aa61]/50 bg-[#d4aa61]/10 px-3 py-2.5 text-sm font-semibold text-[#efcf88] transition hover:bg-[#d4aa61]/20 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">analytics</span>
          {t("getAiValuation")}
        </button>

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={handleAttachClick}
            disabled={!canAttach}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-[#080706] text-[#efcf88] transition hover:border-[#d4aa61]/50 hover:bg-[#d4aa61]/10 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("aiChatAttachImage")}
          >
            <span className="material-symbols-outlined text-[22px]">add_photo_alternate</span>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder={t("aiChatPlaceholder")}
            disabled={actionsDisabled}
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#080706] px-3 py-2.5 text-sm text-[#f5ead9] outline-none placeholder:text-[#9d948a] focus:border-[#d4aa61] disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!canSend}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#d4aa61] text-[#100d08] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("aiChatSend")}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
        <p className="text-[11px] text-[#9d948a]">{t("aiChatHint")}</p>
      </div>
    </div>
  );
}
