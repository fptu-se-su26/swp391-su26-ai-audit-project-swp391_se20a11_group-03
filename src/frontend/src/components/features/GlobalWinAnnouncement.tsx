"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/I18nProvider";
import {
  useAuctionAnnouncements,
  type AuctionWinAnnouncement,
} from "@/lib/hooks/useAuctionAnnouncements";
import { getStoredUser } from "@/lib/userSession";

const AUTO_DISMISS_MS = 8000;

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

function WinToast({
  item,
  onDismiss,
  onNavigate,
}: {
  item: AuctionWinAnnouncement;
  onDismiss: (id: string) => void;
  onNavigate: (item: AuctionWinAnnouncement) => void;
}) {
  const t = useTranslations("announcement");
  const me = getStoredUser();
  const isWinner =
    me?.userId != null && Number(me.userId) === Number(item.winnerUserId);
  const price = formatVnd(item.finalPriceVnd);

  const message = isWinner
    ? t("winPersonal", { product: item.productName, price })
    : t("winBroadcast", {
        winner: item.winnerUsername,
        product: item.productName,
        price,
      });

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [item.id, onDismiss]);

  return (
    <div
      role="status"
      className={`pointer-events-auto w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border shadow-2xl motion-safe:animate-fade-up ${
        isWinner
          ? "border-[#d4aa61]/50 bg-[#1a1610]"
          : "border-white/10 bg-[#12100c]"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={`material-symbols-outlined mt-0.5 shrink-0 text-2xl ${
            isWinner ? "text-[#efcf88]" : "text-[#e7c57c]"
          }`}
        >
          emoji_events
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-[#f5ead9]">{message}</p>
          <button
            type="button"
            onClick={() => onNavigate(item)}
            className="mt-2 text-xs font-semibold text-[#efcf88] underline-offset-2 hover:underline"
          >
            {t("viewLot")}
          </button>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          className="shrink-0 rounded-lg p-1 text-[#9d948a] transition hover:bg-white/10 hover:text-[#f5ead9]"
          aria-label={t("dismiss")}
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}

export default function GlobalWinAnnouncement() {
  const router = useRouter();
  const { announcements, dismiss } = useAuctionAnnouncements();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleNavigate = (item: AuctionWinAnnouncement) => {
    dismiss(item.id);
    router.push(`/auctions/${item.auctionId}`);
  };

  if (!mounted || announcements.length === 0) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed top-[4.5rem] right-4 z-[250] flex flex-col gap-2">
      {announcements.map((item) => (
        <WinToast
          key={item.id}
          item={item}
          onDismiss={dismiss}
          onNavigate={handleNavigate}
        />
      ))}
    </div>,
    document.body,
  );
}
