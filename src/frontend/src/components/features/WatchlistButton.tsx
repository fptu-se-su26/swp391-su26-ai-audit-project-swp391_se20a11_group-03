"use client";

import { MouseEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/I18nProvider";
import { getStoredToken } from "@/lib/apiClient";
import { isWatchlisted, refreshWatchlistIds, subscribeWatchlist, toggleWatchlist } from "@/lib/watchlist";

type Props = {
  productId: number;
  className?: string;
  filledClassName?: string;
  unfilledClassName?: string;
};

export default function WatchlistButton({
  productId,
  className = "absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-on-surface shadow-sm backdrop-blur-sm transition-all hover:bg-surface hover:scale-110",
  filledClassName = "text-error",
  unfilledClassName = "text-on-surface-variant",
}: Props) {
  const t = useTranslations("watchlistButton");
  const router = useRouter();
  const [watchlisted, setWatchlisted] = useState(false);

  useEffect(() => {
    const sync = () => setWatchlisted(isWatchlisted(productId));
    sync();
    refreshWatchlistIds().then(sync);
    return subscribeWatchlist(sync);
  }, [productId]);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!getStoredToken()) {
      router.push("/auth");
      return;
    }

    try {
      setWatchlisted(await toggleWatchlist(productId));
    } catch {
      setWatchlisted(isWatchlisted(productId));
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={watchlisted ? t("removeFromWatchlist") : t("addToWatchlist")}
      title={watchlisted ? t("removeFromWatchlist") : t("addToWatchlist")}
      className={className}
    >
      <span
        className={`material-symbols-outlined text-[20px] ${watchlisted ? filledClassName : unfilledClassName}`}
        style={watchlisted ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        favorite
      </span>
    </button>
  );
}
