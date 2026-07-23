"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  eventApi,
  userApi,
  type EventProduct,
  type ShippingAddress,
} from "@/lib/api";

const VND = new Intl.NumberFormat("vi-VN");

type Props = {
  eventId: number;
  status: string;
  moneyMode: "REAL" | "VIRTUAL";
  depositAmount: number | null;
  biddingMode: string;
};

const emptyAddress: ShippingAddress = {
  receiverName: "",
  receiverPhone: "",
  addressLine: "",
  ward: "",
  district: "",
  province: "",
  note: "",
};

export default function EventParticipation({
  eventId,
  status,
  moneyMode,
  depositAmount,
  biddingMode,
}: Props) {
  const [me, setMe] = useState<number | null>(null);
  const [registered, setRegistered] = useState(false);
  const [products, setProducts] = useState<EventProduct[]>([]);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [payFor, setPayFor] = useState<number | null>(null);
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const reloadProducts = useCallback(async () => {
    try {
      const res = await eventApi.products(eventId);
      setProducts(res.data ?? []);
    } catch {
      /* ignore */
    }
  }, [eventId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [prods, profile, mine] = await Promise.allSettled([
        eventApi.products(eventId),
        userApi.profile(),
        eventApi.myEvents(),
      ]);
      if (cancelled) return;
      if (prods.status === "fulfilled") setProducts(prods.value.data ?? []);
      setMe(profile.status === "fulfilled" ? profile.value.data.userId : null);
      setRegistered(
        mine.status === "fulfilled" && (mine.value.data ?? []).some((e) => e.eventId === eventId),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  async function run(action: () => Promise<unknown>, okText: string) {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ kind: "ok", text: okText });
      await reloadProducts();
    } catch (err) {
      setMessage({ kind: "err", text: err instanceof ApiError ? err.message : "Có lỗi xảy ra" });
    } finally {
      setBusy(false);
    }
  }

  async function register() {
    if (
      moneyMode === "VIRTUAL" &&
      depositAmount &&
      !window.confirm(`Sự kiện tiền ảo: cần đặt cọc ${VND.format(depositAmount)} ₫ (khóa trong ví). Tiếp tục?`)
    ) {
      return;
    }
    await run(async () => {
      await eventApi.register(eventId);
      setRegistered(true);
    }, "Đăng ký tham gia thành công");
  }

  function setAmount(epId: number, value: string) {
    setAmounts((prev) => ({ ...prev, [epId]: value }));
  }

  async function submitPay(epId: number) {
    await run(() => eventApi.pay(epId, address), "Thanh toán thành công, đơn hàng đã được tạo");
    setPayFor(null);
    setAddress(emptyAddress);
  }

  const canRegister = status === "PUBLISHED" || status === "ONGOING";
  // Winners must still be able to pay after the event has ENDED (72h window),
  // so show the products/payment section for ONGOING and ENDED events too.
  const showProducts = registered && (status === "ONGOING" || status === "ENDED");

  if (status === "DRAFT" || status === "CANCELLED" || status === "ARCHIVED") {
    return (
      <button className="w-full cursor-not-allowed rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-white/50">
        Sự kiện đã đóng
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p
          className={`rounded-lg border px-3 py-2 text-xs ${
            message.kind === "ok"
              ? "border-green-400/30 bg-green-500/10 text-green-200"
              : "border-red-400/30 bg-red-500/10 text-red-200"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      {!registered && canRegister ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void register()}
          className="w-full rounded-full bg-[#f0c982] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#f4d79b] disabled:opacity-60"
        >
          {moneyMode === "VIRTUAL" && depositAmount
            ? `Đăng ký (cọc ${VND.format(depositAmount)} ₫)`
            : "Đăng ký tham gia"}
        </button>
      ) : null}

      {registered ? (
        <p className="rounded-lg border border-[#f0c982]/30 bg-[#f0c982]/5 px-3 py-2 text-center text-xs font-semibold text-[#f0c982]">
          Đã đăng ký · {moneyMode === "VIRTUAL" ? "Đấu bằng điểm ảo" : "Đấu bằng tiền thật (khóa ví)"}
        </p>
      ) : null}

      {showProducts ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Sản phẩm</p>
          {products
            .filter((p) => p.approvalStatus === "APPROVED")
            .map((p) => {
              const isWinner = me != null && p.winnerId === me;
              const awaitingPay = isWinner && p.paymentStatus === "AWAITING_PAYMENT";
              const active = p.sessionStatus === "ACTIVE";
              return (
                <div key={p.eventProductId} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>#{p.eventProductId}</span>
                    <span>{p.sessionStatus}</span>
                  </div>
                  <p className="mt-1 text-sm text-white">
                    Giá hiện tại:{" "}
                    <span className="font-semibold text-[#f0c982]">
                      {VND.format(p.currentPrice ?? p.startingPrice ?? 0)} ₫
                    </span>
                  </p>

                  {active ? (
                    <div className="mt-2 flex gap-2">
                      {(biddingMode === "STANDARD" || biddingMode === "SEALED_BID") && (
                        <>
                          <input
                            type="number"
                            value={amounts[p.eventProductId] ?? ""}
                            onChange={(e) => setAmount(p.eventProductId, e.target.value)}
                            placeholder="Số tiền"
                            className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm text-white outline-none"
                          />
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void run(
                                () =>
                                  biddingMode === "STANDARD"
                                    ? eventApi.standardBid(eventId, p.eventProductId, Number(amounts[p.eventProductId]))
                                    : eventApi.sealedBid(eventId, p.eventProductId, Number(amounts[p.eventProductId])),
                                "Đặt giá thành công",
                              )
                            }
                            className="shrink-0 rounded-lg bg-[#f0c982] px-3 py-1.5 text-xs font-bold text-black disabled:opacity-60"
                          >
                            {biddingMode === "SEALED_BID" ? "Gửi kín" : "Đặt giá"}
                          </button>
                        </>
                      )}
                      {biddingMode === "PENNY" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void run(() => eventApi.pennyBid(eventId, p.eventProductId), "Đặt giá xu thành công")}
                          className="w-full rounded-lg bg-[#f0c982] px-3 py-1.5 text-xs font-bold text-black disabled:opacity-60"
                        >
                          Đặt giá xu (+1 bước)
                        </button>
                      )}
                      {biddingMode === "DUTCH" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void run(() => eventApi.dutchCommit(eventId, p.eventProductId), "Mua ngay thành công")}
                          className="w-full rounded-lg bg-[#f0c982] px-3 py-1.5 text-xs font-bold text-black disabled:opacity-60"
                        >
                          Mua ngay giá hiện tại
                        </button>
                      )}
                    </div>
                  ) : null}

                  {awaitingPay ? (
                    payFor === p.eventProductId ? (
                      <div className="mt-2 space-y-2">
                        {(
                          [
                            ["receiverName", "Tên người nhận"],
                            ["receiverPhone", "Số điện thoại"],
                            ["addressLine", "Địa chỉ"],
                            ["ward", "Phường/Xã"],
                            ["district", "Quận/Huyện"],
                            ["province", "Tỉnh/TP"],
                          ] as const
                        ).map(([key, label]) => (
                          <input
                            key={key}
                            value={address[key] ?? ""}
                            onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                            placeholder={label}
                            className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white outline-none"
                          />
                        ))}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void submitPay(p.eventProductId)}
                          className="w-full rounded-lg bg-green-500/80 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                        >
                          Xác nhận thanh toán {VND.format(p.finalPrice ?? 0)} ₫
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPayFor(p.eventProductId)}
                        className="mt-2 w-full rounded-lg border border-green-400/40 px-3 py-1.5 text-xs font-bold text-green-200"
                      >
                        Bạn đã thắng — Thanh toán nhận hàng
                      </button>
                    )
                  ) : null}

                  {isWinner && p.paymentStatus === "PAID" ? (
                    <p className="mt-2 text-xs font-semibold text-green-300">Đã thanh toán · đơn hàng đã tạo</p>
                  ) : null}
                </div>
              );
            })}
          {products.filter((p) => p.approvalStatus === "APPROVED").length === 0 ? (
            <p className="text-xs text-white/40">Chưa có sản phẩm trong sự kiện.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
