"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

function splitRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { hours, minutes, seconds };
}

function pad(value: number | null) {
  return value === null ? "--" : value.toString().padStart(2, "0");
}

type CountdownProps = {
  endsAt: number;
  prefix?: string;
  className?: string;
  expiredLabel?: string;
};

export default function Countdown({
  endsAt,
  prefix,
  className = "flex items-center gap-1 font-mono text-sm font-semibold text-white",
  expiredLabel,
}: CountdownProps) {
  const t = useTranslations("common");
  const expiredLabelLocal = expiredLabel ?? t("expired");
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRemaining(endsAt - Date.now());
    }, 0);
    const interval = setInterval(() => {
      setRemaining(endsAt - Date.now());
    }, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [endsAt]);

  const { hours, minutes, seconds } =
    remaining === null
      ? { hours: null, minutes: null, seconds: null }
      : splitRemaining(remaining);

  if (remaining !== null && remaining <= 0) {
    return <span className={className}>{expiredLabelLocal}</span>;
  }

  return (
    <span className={className}>
      {prefix ? <span>{prefix}</span> : null}
      <span>{pad(hours)}</span>
      <span className="text-white/30">:</span>
      <span>{pad(minutes)}</span>
      <span className="text-white/30">:</span>
      <span>{pad(seconds)}</span>
    </span>
  );
}
