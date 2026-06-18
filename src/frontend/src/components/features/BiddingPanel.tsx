"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "@/i18n/I18nProvider";
import { getAuctionEligibility, createAuctionDeposit, AuctionEligibility, AuctionDeposit } from "@/lib/services/auctionService";
import { apiClient } from "@/lib/apiClient";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface BiddingPanelProps {
  auctionId: number;
  productName?: string;
  lotNumber?: string;
  currentBid?: number;
  timeRemaining?: string;
}

export default function BiddingPanel({
  auctionId,
  productName = "Auction Item",
  lotNumber = "1",
  currentBid: initialBid = 0,
  timeRemaining: initialTime = "00:00:00",
}: BiddingPanelProps) {
  const t = useTranslations("bidding");
  const [eligibility, setEligibility] = useState<AuctionEligibility | null>(null);
  const [depositResult, setDepositResult] = useState<AuctionDeposit | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [bidding, setBidding] = useState(false);

  useEffect(() => {
    async function fetchEligibility() {
      try {
        const data = await getAuctionEligibility(auctionId);
        setEligibility(data);
      } catch {
        setEligibility(null);
      } finally {
        setLoading(false);
      }
    }
    fetchEligibility();
  }, [auctionId]);

  const handleDeposit = async () => {
    setDepositing(true);
    try {
      const result = await createAuctionDeposit(auctionId);
      setDepositResult(result);
    } catch {
      alert(t("failedDeposit"));
    } finally {
      setDepositing(false);
    }
  };

  const handleBid = async () => {
    if (!customAmount.trim()) return;
    const amount = parseInt(customAmount.replace(/[^0-9]/g, ""), 10);
    if (isNaN(amount) || amount <= 0) return;

    setBidding(true);
    try {
      await apiClient(`/auctions/${auctionId}/bid`, {
        method: "POST",
        body: { bidAmount: amount },
      });
      setCustomAmount("");
      alert(t("bidPlacedSuccess"));
    } catch {
      alert(t("bidPlacedFailed"));
    } finally {
      setBidding(false);
    }
  };

  const canBid = eligibility?.alreadyDeposited || depositResult;
  const depositRequired = eligibility?.depositAmount || 1000000;

  if (loading) {
    return (
      <div className="sticky top-28 flex flex-col gap-sm">
        <div className="glass-panel rounded-xl p-md shadow-lg border border-outline-variant/30 flex flex-col gap-4 h-64">
          <div className="flex items-center justify-center h-full">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-28 flex flex-col gap-sm">
      {/* Main Bidding Card */}
      <div className="glass-panel rounded-xl p-md shadow-lg border border-outline-variant/30 flex flex-col gap-4">
        {/* Header */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Lot #{lotNumber}
            </span>
            {eligibility?.depositAllowed && (
              <div className="flex items-center gap-1 bg-error/10 text-error px-2 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-error pulse-live" />
                <span className="font-label-sm text-label-sm font-bold">LIVE</span>
              </div>
            )}
          </div>
          <h1 className="font-headline-md text-headline-md text-primary-container mb-1">{productName}</h1>
        </div>

        {/* Countdown */}
        <div className="bg-surface-container-highest p-3 rounded-lg border border-outline-variant/20 flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">timer</span>
            {t("timeRemaining")}
          </span>
          <span className="font-headline-sm text-headline-sm text-error font-bold font-mono">{initialTime}</span>
        </div>

        <hr className="border-outline-variant/20" />

        {/* Current Bid */}
        <div>
          <span className="font-label-md text-label-md text-on-surface-variant">{t("currentHighestBid")}</span>
          <div className="font-display-lg-mobile text-display-lg-mobile md:text-display-lg text-primary-container font-bold mt-1">
            {formatCurrency(initialBid)}
          </div>
          {eligibility?.alreadyDeposited && (
            <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">{t("reserveMet")}</div>
          )}
        </div>

        {!canBid ? (
          /* Deposit Required */
          <div className="bg-primary-container text-on-primary rounded-xl p-4 flex flex-col gap-3 mt-2 relative overflow-hidden shadow-md">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-container opacity-10 rounded-full blur-xl" />
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-md text-label-md font-bold text-secondary-container flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
                  {t("actionRequired")}
                </span>
                <span className="font-body-md text-body-md text-on-primary/80 mt-1 block">
                  {t("depositRequired")}
                </span>
              </div>
              <button className="text-on-primary/60 hover:text-on-primary" title="Why is a deposit required?">
                <span className="material-symbols-outlined">info</span>
              </button>
            </div>
            <button
              onClick={handleDeposit}
              disabled={depositing || eligibility?.alreadyDeposited}
              className="w-full bg-secondary-container hover:bg-secondary-fixed transition-colors text-primary-container font-label-md text-label-md font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {depositing ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  {t("processing")}
                </>
              ) : eligibility?.alreadyDeposited ? (
                t("depositAlreadyPaid")
              ) : (
                <>
                  {t("payDepositToJoin", { deposit: formatCurrency(depositRequired) })}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Active Bidding */
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface-variant">{t("placeABid")}</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-surface-container py-2 rounded-lg font-label-md text-label-md text-on-surface border border-outline-variant/30 hover:border-secondary transition-colors">
                + 1,000,000
              </button>
              <button className="flex-1 bg-surface-container py-2 rounded-lg font-label-md text-label-md text-on-surface border border-outline-variant/30 hover:border-secondary transition-colors">
                + 5,000,000
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={t("enterAmount")}
                className="flex-grow bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none"
              />
              <button
                onClick={handleBid}
                disabled={bidding}
                className="bg-secondary text-on-secondary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-secondary-fixed-dim transition-colors glow-accent disabled:opacity-50"
              >
                {bidding ? t("placing") : t("placeBid")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Status */}
      {depositResult && (
        <div className="bg-surface rounded-xl p-4 border border-outline-variant/20 shadow-sm">
          <h4 className="font-label-md text-label-md text-on-surface font-bold mb-3">{t("depositStatus")}</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">{t("depositAmount")}</span>
              <span className="text-on-surface font-semibold">{formatCurrency(depositResult.depositAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">{t("walletBalance")}</span>
              <span className="text-on-surface">{formatCurrency(depositResult.walletBalance)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant">{t("holdBalance")}</span>
              <span className="text-on-surface">{formatCurrency(depositResult.walletHoldBalance)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
