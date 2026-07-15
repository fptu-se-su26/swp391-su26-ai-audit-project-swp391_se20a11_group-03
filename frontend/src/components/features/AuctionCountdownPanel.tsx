"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";

type Mode = "upcoming" | "live";

interface AuctionCountdownPanelProps {
  endsAt: string | Date | null | undefined;
  /** upcoming = waiting for session start (HH:MM:SS); live = active session (MM:SS) */
  mode: Mode;
  label?: string;
  auctionMode?: "LIVE" | "TIMED" | string | null;
  onExpire?: () => void;
  className?: string;
}

function diffSeconds(target: Date, now: Date): number {
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
}

function splitTime(totalSeconds: number, mode: Mode) {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (mode === "live") {
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return { hours: 0, minutes: mm, seconds: ss, showHours: false };
  }
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return { hours, minutes, seconds, showHours: true };
}

function TimeCell({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-[3.5rem] rounded-xl border border-[#d4aa61]/35 bg-[#1a1610] px-3 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <span className="font-mono text-3xl font-bold tabular-nums text-[#efcf88] sm:text-4xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9d948a]">{unit}</span>
    </div>
  );
}

export default function AuctionCountdownPanel({
  endsAt,
  mode,
  label,
  auctionMode,
  onExpire,
  className = "",
}: AuctionCountdownPanelProps) {
  const t = useTranslations("countdown");
  const targetDate = endsAt ? new Date(endsAt) : null;
  const targetTime = targetDate?.getTime() ?? null;
  const [now, setNow] = useState<Date>(() => new Date());
  const firedExpireRef = useRef(false);

  useEffect(() => {
    firedExpireRef.current = false;
  }, [endsAt]);

  useEffect(() => {
    if (!targetTime) return;
    const tick = () => {
      if (!document.hidden) setNow(new Date());
    };
    tick();
    const handle = setInterval(tick, 1_000);
    const onVisible = () => setNow(new Date());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(handle);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [targetTime]);

  const remaining = targetDate ? diffSeconds(targetDate, now) : 0;
  const urgent = mode === "live" && remaining > 0 && remaining <= 30;
  const { hours, minutes, seconds, showHours } = splitTime(remaining, mode);

  useEffect(() => {
    if (remaining === 0 && !firedExpireRef.current && onExpire) {
      firedExpireRef.current = true;
      onExpire();
    }
  }, [remaining, onExpire]);

  if (!targetDate) {
    return (
      <div className={`rounded-2xl border border-[#d4aa61]/30 bg-[#0e0d0b] p-4 ${className}`}>
        <p className="text-sm text-[#9d948a]">--</p>
      </div>
    );
  }

  const displayLabel = label ?? (mode === "upcoming" ? t("startsIn") : t("timeLeft"));

  return (
    <div
      className={`mt-4 rounded-2xl border border-[#d4aa61]/40 bg-[#0e0d0b] p-4 sm:p-5 ${urgent ? "animate-pulse border-red-500/50" : ""} ${className}`}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b7aea3]">
          {displayLabel}
        </p>
        {auctionMode && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              auctionMode === "LIVE"
                ? "bg-red-600/25 text-red-300"
                : "bg-[#d4aa61]/20 text-[#efcf88]"
            }`}
          >
            {auctionMode}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3">
        {showHours && (
          <>
            <TimeCell value={hours} unit={t("hours")} />
            <span className="mb-5 font-mono text-2xl font-bold text-[#d4aa61]">:</span>
          </>
        )}
        <TimeCell value={minutes} unit={t("minutes")} />
        <span className="mb-5 font-mono text-2xl font-bold text-[#d4aa61]">:</span>
        <TimeCell value={seconds} unit={t("seconds")} />
      </div>

      {urgent && (
        <p className="mt-2 text-center text-xs font-semibold text-red-300">{t("endingSoon")}</p>
      )}
    </div>
  );
}
