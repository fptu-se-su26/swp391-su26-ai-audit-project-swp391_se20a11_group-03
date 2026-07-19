"use client";

import { useEffect, useRef, useState } from "react";

type Variant = "live" | "timed";

interface CountdownTimerProps {
  /** ISO 8601 string or anything `new Date()` accepts. */
  endsAt: string | Date | null | undefined;
  /** Variant drives display format and color thresholds. */
  variant?: Variant;
  /** Called once when the countdown reaches zero. */
  onExpire?: () => void;
  /** Optional className passthrough. */
  className?: string;
}

function diffSeconds(target: Date, now: Date): number {
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
}

function formatTime(totalSeconds: number, variant: Variant): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (variant === "live") {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }
  const hh = Math.floor(s / 3600).toString().padStart(2, "0");
  const mm = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function colorFor(totalSeconds: number, variant: Variant): string {
  if (variant === "timed") {
    if (totalSeconds < 60 * 60) return "text-error";
    if (totalSeconds < 6 * 60 * 60) return "text-secondary";
    return "text-primary";
  }
  if (totalSeconds <= 0) return "text-on-surface-variant";
  if (totalSeconds <= 10) return "text-error animate-pulse";
  if (totalSeconds <= 30) return "text-secondary";
  return "text-primary";
}

export function CountdownTimer({
  endsAt,
  variant = "live",
  onExpire,
  className,
}: CountdownTimerProps) {
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

  useEffect(() => {
    if (remaining === 0 && !firedExpireRef.current && onExpire) {
      firedExpireRef.current = true;
      onExpire();
    }
  }, [remaining, onExpire]);

  if (!targetDate) {
    return (
      <span className={`font-mono text-on-surface-variant ${className ?? ""}`}>
        --
      </span>
    );
  }

  return (
    <span
      className={`font-mono text-2xl font-bold tabular-nums ${colorFor(remaining, variant)} ${className ?? ""}`}
      aria-live="polite"
    >
      {formatTime(remaining, variant)}
    </span>
  );
}

export default CountdownTimer;
