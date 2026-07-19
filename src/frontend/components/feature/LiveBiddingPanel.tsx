"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ApiError,
  auctionApi,
  getToken,
  userApi,
  type AuctionEligibility,
  type AuctionState,
} from "@/lib/api";

type LiveBiddingPanelProps = {
  state: AuctionState;
  sellerId: number;
  onBidPlaced: () => Promise<void> | void;
};

type ViewerMode = "checking" | "anonymous" | "owner" | "buyer" | "error";

const VND = new Intl.NumberFormat("vi-VN");

function formatRemaining(endTime: string, endedText: string): string {
  const ms = new Date(endTime).getTime() - Date.now();
  if (ms <= 0) return endedText;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Countdown to a future instant, or null once it has passed. */
function formatUntil(time: string): string | null {
  const ms = new Date(time).getTime() - Date.now();
  if (ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function LiveBiddingPanel({
  state,
  sellerId,
  onBidPlaced,
}: LiveBiddingPanelProps) {
  const t = useTranslations("liveBidding");
  const [customAmount, setCustomAmount] = useState("");
  // Countdown texts start as null and are only computed on the client (in the
  // effect below) — computing them during SSR causes a hydration mismatch
  // because the server and client clocks differ by a second.
  const [remaining, setRemaining] = useState<string | null>(null);
  const [untilStart, setUntilStart] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [placing, setPlacing] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [viewerMode, setViewerMode] = useState<ViewerMode>("checking");
  const [eligibility, setEligibility] = useState<AuctionEligibility | null>(null);
  const [myBidAmount, setMyBidAmount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const token = getToken();

    if (!token) {
      const timeout = window.setTimeout(() => {
        if (!cancelled) setViewerMode("anonymous");
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(timeout);
      };
    }

    Promise.all([userApi.profile(), auctionApi.eligibility(state.auctionId)])
      .then(([profileResponse, eligibilityResponse]) => {
        if (cancelled) return;
        const ownsProduct = profileResponse.data.userId === sellerId;
        setViewerMode(ownsProduct ? "owner" : "buyer");
        setEligibility(eligibilityResponse);
      })
      .catch(() => {
        if (!cancelled) setViewerMode("error");
      });

    auctionApi
      .myBid(state.auctionId)
      .then((mine) => {
        if (!cancelled && mine.hasBid) setMyBidAmount(mine.bidAmount);
      })
      .catch(() => {
        /* No bid yet or no signed-in user. */
      });

    return () => {
      cancelled = true;
    };
  }, [sellerId, state.auctionId]);

  useEffect(() => {
    const tick = () => {
      setRemaining(formatRemaining(state.endTime, t("ended")));
      setUntilStart(formatUntil(state.startTime));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [state.endTime, state.startTime, t]);

  const isActive = state.status === "ACTIVE";
  const isUpcoming = state.status === "UPCOMING";
  const canBid =
    isActive &&
    viewerMode === "buyer" &&
    Boolean(eligibility?.alreadyDeposited);

  async function placeDeposit() {
    setMessage(null);
    setDepositing(true);
    try {
      const result = await auctionApi.deposit(state.auctionId);
      const nextEligibility = await auctionApi.eligibility(state.auctionId);
      setEligibility(nextEligibility);
      setMessage({
        kind: "success",
        text: t("depositLocked", { amount: VND.format(result.depositAmount) }),
      });
    } catch (err) {
      setMessage({
        kind: "error",
        text:
          err instanceof ApiError
            ? err.message
            : t("depositError"),
      });
    } finally {
      setDepositing(false);
    }
  }

  async function placeBid(amount: number) {
    setMessage(null);
    setPlacing(true);
    try {
      const res = await auctionApi.placeBid(state.auctionId, amount);
      if (res.success) {
        setMessage({
          kind: "success",
          text: t("bidSuccess", { amount: VND.format(amount) }),
        });
        setCustomAmount("");
        setMyBidAmount((prev) => (prev === null ? amount : Math.max(prev, amount)));
        await onBidPlaced();
      } else {
        setMessage({
          kind: "error",
          text: res.message ?? t("bidError"),
        });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setMessage({
          kind: "error",
          text: t("loginToBid"),
        });
      } else if (err instanceof ApiError) {
        setMessage({ kind: "error", text: err.message });
      } else {
        setMessage({ kind: "error", text: t("serverError") });
      }
    } finally {
      setPlacing(false);
    }
  }

  function handleCustomBid() {
    const parsed = Number(customAmount);
    if (!customAmount || Number.isNaN(parsed)) {
      setMessage({ kind: "error", text: t("invalidAmount") });
      return;
    }
    if (parsed < state.minNextBid) {
      setMessage({
        kind: "error",
        text: t("minBid", { amount: VND.format(state.minNextBid) }),
      });
      return;
    }
    placeBid(parsed);
  }

  return (
    <div className="glass-panel sticky top-24 flex flex-col gap-6 rounded-2xl p-6">
      <div>
        <p className="text-xs text-white/50">
          {state.priceHidden ? t("hiddenStartingPrice") : t("currentPrice")}
        </p>
        <p className="font-display-lg mt-1 text-3xl text-[var(--luxora-gold-light)]">
          {VND.format(state.currentHighestBid)} ₫
        </p>
        <p className="mt-1 text-xs text-white/40">
          {isActive
            ? t("endsIn", { time: remaining ?? "--:--:--" })
            : isUpcoming
              ? untilStart
                ? t("startsIn", { time: untilStart })
                : t("startingSoon")
              : t("closed")}
        </p>
        {!state.priceHidden && state.winnerUsername ? (
          <p className="mt-1 text-xs text-white/40">
            {t("leading", { username: state.winnerUsername })}
          </p>
        ) : null}
      </div>

      {message ? (
        <p
          className={`rounded-lg border px-3 py-2 text-xs ${
            message.kind === "success"
              ? "border-green-400/30 bg-green-500/10 text-green-200"
              : "border-red-400/30 bg-red-500/10 text-red-200"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      {viewerMode === "checking" ? (
        <p className="text-center text-xs text-white/40">
          {t("checkingEligibility")}
        </p>
      ) : null}

      {viewerMode === "owner" ? (
        <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm text-blue-100">
          <p className="font-semibold">{t("ownerTitle")}</p>
          <p className="mt-1 text-xs leading-5 text-blue-100/65">
            {state.priceHidden
              ? t("ownerSealedDesc")
              : t("ownerOpenDesc")}
          </p>
          <p className="mt-2 text-xs font-semibold text-blue-100/85">
            {t("totalBids", { count: state.totalBids })}
          </p>
        </div>
      ) : null}

      {false && viewerMode === "buyer" && (isUpcoming || isActive) ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          {!eligibility?.kycVerified ? (
            <Link
              href="/kyc"
              className="block rounded-xl border border-yellow-400/30 bg-yellow-500/10 py-2.5 text-center text-xs font-semibold text-yellow-200"
            >
              {t("kycToJoin")}
            </Link>
          ) : (
            <>
              <p className="text-xs leading-5 text-white/55">
                {t("timedPolicyBefore")}<b>{t("timedPolicyStrong")}</b>{t("timedPolicyAfter")}
              </p>
              {myBidAmount !== null ? (
                <p className="mt-2 text-xs text-white/70">
                  {t("yourLockedBid")}{" "}
                  <span className="font-semibold text-[var(--luxora-gold-light)]">
                    {VND.format(myBidAmount ?? 0)} ₫
                  </span>
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {viewerMode === "buyer" && eligibility && (isUpcoming || isActive) ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          {eligibility.alreadyDeposited ? (
            <div>
              <div className="flex items-center gap-2 text-sm text-green-300">
                <span className="material-symbols-outlined text-lg">verified</span>
                <span className="font-semibold">
                  {t("alreadyDeposited", { amount: VND.format(eligibility.depositAmount ?? 0) })}
                </span>
              </div>
              {myBidAmount !== null ? (
                <p className="mt-2 text-xs text-white/70">
                  {state.priceHidden ? t("yourSealedBid") : t("yourHighestBid")}
                  <span className="font-semibold text-[var(--luxora-gold-light)]">
                    {VND.format(myBidAmount ?? 0)} ₫
                  </span>
                </p>
              ) : null}
            </div>
          ) : eligibility.depositAllowed ? (
            <>
              <p className="text-xs leading-5 text-white/55">
                {t("depositInfo")}
              </p>
              {!eligibility.kycVerified ? (
                <Link
                  href="/kyc"
                  className="mt-3 block rounded-xl border border-yellow-400/30 bg-yellow-500/10 py-2.5 text-center text-xs font-semibold text-yellow-200"
                >
                  {t("kycToDeposit")}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={depositing}
                  onClick={() => {
                    void placeDeposit();
                  }}
                  className="mt-3 w-full rounded-xl bg-[var(--luxora-gold,#f0c982)] py-2.5 text-xs font-bold text-black disabled:opacity-60"
                >
                  {depositing
                    ? t("depositing")
                    : t("depositNow", { amount: VND.format(eligibility.depositAmount ?? 0) })}
                </button>
              )}
            </>
          ) : (
            <p className="text-xs leading-5 text-yellow-200/80">
              {eligibility.message || t("depositClosed")}
            </p>
          )}
        </div>
      ) : null}

      {canBid ? (
        <>
          <div>
            <p className="mb-2 text-xs font-medium text-white/50">
              {state.priceHidden ? t("sealedBidLabel") : t("quickBidLabel")}
            </p>
            {!state.priceHidden ? (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((steps) => {
                  const amount = state.minNextBid + (steps - 1) * state.bidStep;
                  return (
                    <button
                      key={steps}
                      type="button"
                      disabled={placing}
                      onClick={() => {
                        void placeBid(amount);
                      }}
                      className="rounded-xl border border-white/10 py-2 text-xs font-semibold text-white/80 hover:border-[var(--luxora-gold)] hover:text-[var(--luxora-gold-light)] disabled:opacity-50"
                    >
                      {VND.format(amount)} ₫
                    </button>
                  );
                })}
              </div>
            ) : null}

            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder={t("minPlaceholder", { amount: VND.format(state.minNextBid) })}
              className={`${state.priceHidden ? "" : "mt-3"} w-full rounded-xl border border-white/10 bg-[var(--luxora-bg-soft)] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]`}
            />
          </div>

          <button
            type="button"
            disabled={placing}
            onClick={handleCustomBid}
            className="rounded-xl bg-[var(--luxora-gold,#f0c982)] py-3 text-sm font-bold text-black transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placing ? t("placing") : t("placeBidNow")}
          </button>

          <p className="text-center text-[11px] text-white/35">
            {state.priceHidden
              ? t("sealedBidCount", { count: state.totalBids })
              : t("bidStepCount", { amount: VND.format(state.bidStep), count: state.totalBids })}
          </p>
        </>
      ) : null}

      {(isActive || isUpcoming) && viewerMode === "anonymous" ? (
        <Link
          href={`/auth?next=/auctions/${state.auctionId}`}
          className="rounded-xl bg-[var(--luxora-gold,#f0c982)] py-3 text-center text-sm font-bold text-black transition-colors hover:opacity-90"
        >
          {t("loginToDeposit")}
        </Link>
      ) : null}

      {viewerMode === "error" ? (
        <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-200">
          {t("eligibilityError")}
        </p>
      ) : null}

      {!isActive && !isUpcoming ? (
        <p className="text-center text-xs text-white/40">
          {t("auctionEnded")}
        </p>
      ) : null}
    </div>
  );
}
