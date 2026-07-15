"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ApiError,
  auctionApi,
  getToken,
  type AuctionState,
} from "@/lib/api";

type LiveBiddingPanelProps = {
  state: AuctionState;
  onBidPlaced: () => Promise<void> | void;
};

const VND = new Intl.NumberFormat("vi-VN");

function formatRemaining(endTime: string): string {
  const ms = new Date(endTime).getTime() - Date.now();
  if (ms <= 0) return "Đã kết thúc";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function LiveBiddingPanel({
  state,
  onBidPlaced,
}: LiveBiddingPanelProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [remaining, setRemaining] = useState(() =>
    formatRemaining(state.endTime),
  );
  const [message, setMessage] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [placing, setPlacing] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoggedIn(Boolean(getToken())), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setRemaining(formatRemaining(state.endTime)),
      1000,
    );
    return () => clearInterval(timer);
  }, [state.endTime]);

  const isActive = state.status === "ACTIVE";

  async function placeBid(amount: number) {
    setMessage(null);
    setPlacing(true);
    try {
      const res = await auctionApi.placeBid(state.auctionId, amount);
      if (res.success) {
        setMessage({
          kind: "success",
          text: `Đặt giá ${VND.format(amount)} ₫ thành công!`,
        });
        setCustomAmount("");
        await onBidPlaced();
      } else {
        setMessage({
          kind: "error",
          text: res.message ?? "Đặt giá không thành công.",
        });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setMessage({
          kind: "error",
          text: "Bạn cần đăng nhập để đấu giá.",
        });
      } else if (err instanceof ApiError) {
        setMessage({ kind: "error", text: err.message });
      } else {
        setMessage({ kind: "error", text: "Không kết nối được máy chủ." });
      }
    } finally {
      setPlacing(false);
    }
  }

  function handleCustomBid() {
    const parsed = Number(customAmount);
    if (!customAmount || Number.isNaN(parsed)) {
      setMessage({ kind: "error", text: "Nhập số tiền hợp lệ." });
      return;
    }
    if (parsed < state.minNextBid) {
      setMessage({
        kind: "error",
        text: `Giá tối thiểu là ${VND.format(state.minNextBid)} ₫.`,
      });
      return;
    }
    placeBid(parsed);
  }

  return (
    <div className="glass-panel sticky top-24 flex flex-col gap-6 rounded-2xl p-6">
      <div>
        <p className="text-xs text-white/50">
          {state.priceHidden ? "Giá khởi điểm" : "Giá hiện tại"}
        </p>
        <p className="font-display-lg mt-1 text-3xl text-[var(--luxora-gold-light)]">
          {VND.format(state.currentHighestBid)} ₫
        </p>
        <p className="mt-1 text-xs text-white/40">
          {isActive ? `Kết thúc sau ${remaining}` : "Phiên đã đóng"}
        </p>
        {!state.priceHidden && state.winnerUsername ? (
          <p className="mt-1 text-xs text-white/40">
            Dẫn đầu: {state.winnerUsername}
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

      {isActive && loggedIn ? (
        <>
          <div>
            <p className="mb-2 text-xs font-medium text-white/50">
              Đặt giá nhanh
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((steps) => {
                const amount = state.minNextBid + (steps - 1) * state.bidStep;
                return (
                  <button
                    key={steps}
                    type="button"
                    disabled={placing}
                    onClick={() => placeBid(amount)}
                    className="rounded-xl border border-white/10 py-2 text-xs font-semibold text-white/80 hover:border-[var(--luxora-gold)] hover:text-[var(--luxora-gold-light)] disabled:opacity-50"
                  >
                    {VND.format(amount)} ₫
                  </button>
                );
              })}
            </div>

            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder={`Tối thiểu ${VND.format(state.minNextBid)} ₫`}
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
            />
          </div>

          <button
            type="button"
            disabled={placing}
            onClick={handleCustomBid}
            className="rounded-xl bg-[var(--luxora-gold,#f0c982)] py-3 text-sm font-bold text-black transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placing ? "ĐANG ĐẶT GIÁ..." : "ĐẶT GIÁ NGAY"}
          </button>

          <p className="text-center text-[11px] text-white/35">
            Bước giá {VND.format(state.bidStep)} ₫ · {state.totalBids} lượt bid
          </p>
        </>
      ) : null}

      {isActive && !loggedIn ? (
        <Link
          href="/auth"
          className="rounded-xl bg-[var(--luxora-gold,#f0c982)] py-3 text-center text-sm font-bold text-black transition-colors hover:opacity-90"
        >
          ĐĂNG NHẬP ĐỂ ĐẤU GIÁ
        </Link>
      ) : null}

      {!isActive ? (
        <p className="text-center text-xs text-white/40">
          {state.status === "UPCOMING"
            ? "Phiên chưa bắt đầu."
            : "Phiên đấu giá đã kết thúc."}
        </p>
      ) : null}
    </div>
  );
}
