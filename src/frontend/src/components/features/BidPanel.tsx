"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/i18n/I18nProvider";
import { AuctionState, placeBid } from "@/lib/services/auctionService";
import { forceRefresh, subscribeAuction } from "@/lib/services/auctionPolling";
import { useKycStatus } from "@/lib/hooks/useKycStatus";
import {
  calculateBidStep,
  computeMinNextBid,
  isOnBidGrid,
} from "@/lib/bidStep";

interface BidPanelProps {
  auctionId: number;
  currentBid: number;
  startingPrice: number;
  bidStep?: number;
  /** Called after a successful bid so the parent can re-fetch history. */
  onBidPlaced?: (newBid: number) => void;
  /** When false, disables the input/button (e.g. user not deposited yet). */
  canBid?: boolean;
  /** Show a disabled state with a reason. */
  disabledReason?: string | null;
}

function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BidPanel({
  auctionId,
  currentBid,
  startingPrice,
  bidStep,
  onBidPlaced,
  canBid = true,
  disabledReason,
}: BidPanelProps) {
  const t = useTranslations("bidPanel");
  const kyc = useKycStatus();
  const [liveState, setLiveState] = useState<AuctionState | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    return subscribeAuction(auctionId, (state) => setLiveState(state));
  }, [auctionId]);

  const effectiveStarting = liveState?.startingPrice ?? startingPrice;
  const effectiveStep = liveState?.bidStep ?? bidStep ?? calculateBidStep(effectiveStarting);
  const effectiveCurrentBid =
    liveState?.currentHighestBid != null ? liveState.currentHighestBid : currentBid;
  const minRequired = useMemo(
    () =>
      liveState?.minNextBid ??
      computeMinNextBid(effectiveStarting, effectiveCurrentBid, effectiveStep),
    [liveState?.minNextBid, effectiveStarting, effectiveCurrentBid, effectiveStep],
  );

  useEffect(() => {
    setAmount(String(minRequired));
  }, [minRequired]);

  const auctionActive = useMemo(() => {
    if (!liveState) return true;
    if (["ENDED", "PAID", "FORFEITED"].includes(liveState.status)) return false;
    if (!liveState.endTime) return true;
    return new Date(liveState.endTime).getTime() > Date.now();
  }, [liveState]);
  const kycOk = kyc.status === "verified";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);
    const num = Number(amount);
    if (!Number.isFinite(num) || num < minRequired) {
      setFeedback({
        tone: "error",
        message: t("bidMustBeAtLeast", { amount: formatVnd(minRequired) }),
      });
      return;
    }
    if (!isOnBidGrid(effectiveStarting, num, effectiveStep)) {
      setFeedback({
        tone: "error",
        message: t("bidMustBeAtLeast", { amount: formatVnd(minRequired) }),
      });
      return;
    }
    setSubmitting(true);
    try {
      const result = await placeBid(auctionId, num);
      if (result.success) {
        setFeedback({ tone: "success", message: t("bidPlaced") });
        forceRefresh(auctionId);
        onBidPlaced?.(num);
      } else {
        setFeedback({ tone: "error", message: result.message || t("bidFailed") });
      }
    } catch (err) {
      setFeedback({
        tone: "error",
        message: err instanceof Error ? err.message : t("bidFailed"),
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!canBid) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-md text-sm text-on-surface-variant">
        {disabledReason ?? t("placeDepositToEnter")}
      </div>
    );
  }

  if (kyc.status === "loading") {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-md text-sm text-on-surface-variant">
        {t("checkingKyc")}
      </div>
    );
  }

  if (kyc.status !== "verified") {
    return (
      <div className="space-y-sm rounded-xl border border-secondary/30 bg-secondary-container/40 p-md">
        <p className="font-label-md text-label-md text-on-secondary-container">
          {t("kycRequiredToBid")}
        </p>
        <Link
          href="/kyc"
          className="inline-flex items-center gap-xs rounded-lg bg-secondary px-md py-sm font-label-md text-label-md text-on-secondary hover:bg-secondary-fixed-dim"
        >
          {t("verifyNow")}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-sm rounded-xl border border-surface-variant bg-surface p-md soft-shadow"
    >
      <div className="flex items-baseline justify-between">
        <span className="font-label-md text-label-md text-on-surface-variant">{t("currentBid")}</span>
        <span className="font-headline-sm text-headline-sm text-primary">
          {formatVnd(effectiveCurrentBid)}
        </span>
      </div>
      <div className="flex items-baseline justify-between text-xs text-on-surface-variant">
        <span>{t("minimumNextBid")}</span>
        <span>{formatVnd(minRequired)}</span>
      </div>
      <p className="text-xs text-on-surface-variant">
        {t("stepHint", { step: formatVnd(effectiveStep) })}
      </p>
      <div className="flex gap-sm">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={String(minRequired)}
          min={minRequired}
          step={effectiveStep}
          disabled={submitting || !auctionActive}
          className="flex-1 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={submitting || !auctionActive}
          className="rounded-xl bg-tertiary-fixed px-lg py-md font-headline-sm text-headline-sm text-on-tertiary-fixed-variant transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? t("placing") : t("placeBid")}
        </button>
      </div>
      {!auctionActive && liveState && (
        <p className="text-xs text-on-surface-variant">
          {t("auctionClosed", { status: liveState.status.toLowerCase() })}
        </p>
      )}
      {feedback && (
        <p
          className={`text-sm ${feedback.tone === "success" ? "text-tertiary" : "text-error"}`}
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}

export default BidPanel;
