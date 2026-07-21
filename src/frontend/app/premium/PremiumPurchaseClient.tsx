"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, premiumApi, type PremiumStatus } from "@/lib/api";

const BENEFITS = [
  ["verified", "Thẩm định chuyên gia", "Gửi yêu cầu định giá và nhận mức giá đề xuất từ chuyên gia."],
  ["smart_toy", "Đặt giá tự động", "Thiết lập giá tối đa để hệ thống đấu giá an toàn thay bạn."],
  ["percent", "Hoa hồng chỉ 5%", "Giảm từ mức phí tiêu chuẩn 20% xuống còn 5% khi bán thành công."],
  ["all_inclusive", "Đăng bán không giới hạn", "Không còn giới hạn 5 sản phẩm trong mỗi tháng."],
  ["savings", "Ưu đãi tiền đặt cọc", "Miễn cọc dưới 1 triệu và giảm 50% cho phiên có giá cao hơn."],
] as const;

const USER_BENEFITS = [BENEFITS[1], BENEFITS[4]] as const;

function money(value: number) { return `${value.toLocaleString("vi-VN")} ₫`; }

export default function PremiumPurchaseClient() {
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const selectedPrice = status
    ? selectedPlan === "YEARLY" ? status.yearlyPrice : status.monthlyPrice
    : 0;

  useEffect(() => {
    premiumApi.status().then(setStatus)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Không thể tải thông tin Premium."))
      .finally(() => setLoading(false));
  }, []);

  async function purchase() {
    if (!status || status.premium || purchasing) return;
    setPurchasing(true); setError(""); setSuccess("");
    try {
      const result = await premiumApi.purchase(selectedPlan);
      setStatus(result);
      setSuccess(result.message);
      setConfirmOpen(false);
    } catch (reason: unknown) {
      setError(reason instanceof ApiError ? reason.message : "Thanh toán Premium thất bại.");
    } finally { setPurchasing(false); }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-7 lg:py-14">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[var(--luxora-bg-elevated)] bg-[radial-gradient(circle_at_top_right,rgba(215,173,78,.16),transparent_38%)] shadow-[0_24px_70px_rgba(80,59,25,.14)]">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_.9fr] lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ad4e]/40 bg-[#f8e9bd] px-3 py-1.5 text-xs font-bold uppercase tracking-[.2em] text-[#79580f]">
              <span className="material-symbols-outlined text-base">workspace_premium</span> BidZone Premium
            </div>
            <h1 className="mt-5 max-w-xl text-4xl font-bold leading-tight text-[var(--luxora-text)] sm:text-5xl">
              {status?.accountType === "USER" ? "Đấu giá thông minh hơn với Premium" : "Nâng tầm tài khoản người bán"}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--luxora-text-muted)] opacity-75">
              {status?.accountType === "USER"
                ? "Mở khóa đặt giá tự động và ưu đãi tiền đặt cọc dành riêng cho người mua."
                : "Mở khóa toàn bộ công cụ chuyên nghiệp dành cho Seller với một lần thanh toán."}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {(status?.accountType === "USER" ? USER_BENEFITS : BENEFITS).map(([icon, title, description]) => (
                <div key={title} className="glass-panel rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-[#d7ad4e]/55">
                  <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbefcc] text-2xl text-[#a8780d]">{icon}</span>
                  <h2 className="mt-3 font-bold text-[var(--luxora-text)]">{title}</h2>
                  <p className="mt-1 text-sm leading-5 text-[var(--luxora-text-muted)] opacity-75">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="glass-panel self-start rounded-3xl p-6 shadow-[0_18px_50px_rgba(96,69,19,.12)] lg:sticky lg:top-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b77c08] to-[#edcb75] text-[#211605] shadow-[0_10px_24px_rgba(183,124,8,.22)]"><span className="material-symbols-outlined text-2xl">workspace_premium</span></div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#8a7962]">Chọn chu kỳ</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setSelectedPlan("MONTHLY")} className={`rounded-xl border p-3 text-left transition ${selectedPlan === "MONTHLY" ? "border-[#c89418] bg-[#c89418]/15" : "border-white/10 bg-white/5"}`}>
                <span className="block text-xs text-[var(--luxora-text-muted)] opacity-70">Hàng tháng</span><strong className="mt-1 block text-[var(--luxora-text)]">{status ? money(status.monthlyPrice) : "--"}</strong>
              </button>
              <button type="button" onClick={() => setSelectedPlan("YEARLY")} className={`relative rounded-xl border p-3 text-left transition ${selectedPlan === "YEARLY" ? "border-[#c89418] bg-[#c89418]/15" : "border-white/10 bg-white/5"}`}>
                <span className="absolute -right-1 -top-2 rounded-full bg-[#9b6a08] px-2 py-0.5 text-[10px] font-bold text-white">Giảm {status ? `${status.yearlySaving / 1_000_000}tr` : "--"}</span>
                <span className="block text-xs text-[var(--luxora-text-muted)] opacity-70">Hàng năm</span><strong className="mt-1 block text-[var(--luxora-text)]">{status ? money(status.yearlyPrice) : "--"}</strong>
              </button>
            </div>
            <div className="mt-5 flex items-end gap-2"><strong className="text-4xl text-[#9b6a08]">{money(selectedPrice)}</strong></div>
            <p className="mt-2 text-sm text-[var(--luxora-text-muted)] opacity-70">{selectedPlan === "YEARLY" ? `12 tháng · tiết kiệm ${money(status?.yearlySaving ?? 0)}` : "Gia hạn mỗi tháng"}</p>
            <div className="my-6 h-px bg-white/10" />
            {loading ? <p className="text-[var(--luxora-text-muted)] opacity-70">Đang kiểm tra tài khoản...</p> : status && (
              <>
                <div className="rounded-xl bg-white/5 px-4 py-3"><div className="flex justify-between text-sm"><span className="text-[var(--luxora-text-muted)] opacity-70">Số dư khả dụng</span><span className="font-bold text-[var(--luxora-text)]">{money(status.remainingBalance)}</span></div></div>
                {status.premium && (
                  <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center text-emerald-700">
                    <span className="material-symbols-outlined text-3xl">verified</span><p className="mt-1 font-bold">Premium đang hoạt động</p>
                    {status.expiresAt && <p className="mt-1 text-xs">Hết hạn: {new Date(status.expiresAt).toLocaleDateString("vi-VN")}</p>}
                  </div>
                )}
                <button type="button" onClick={() => setConfirmOpen(true)} disabled={purchasing || status.remainingBalance < selectedPrice} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c89418] to-[#f2d987] px-5 py-4 font-bold text-[#171008] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45">
                  <span className="material-symbols-outlined">workspace_premium</span>{purchasing ? "Đang thanh toán..." : status.premium ? "Gia hạn Premium" : "Đăng ký Premium"}
                </button>
                {status.remainingBalance < selectedPrice && <p className="mt-3 text-center text-sm text-[#9a6907]">Số dư chưa đủ. <Link href="/wallet" className="font-bold underline">Nạp thêm tiền</Link></p>}
              </>
            )}
            {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {success && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}
            <p className="mt-5 text-center text-xs leading-5 text-[var(--luxora-text-muted)] opacity-60">Giao dịch không thể hoàn tác sau khi Premium được kích hoạt.</p>
          </aside>
        </div>
      </div>

      {confirmOpen && status && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#211b13]/55 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !purchasing) setConfirmOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-confirm-title"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-[#dfc98f] bg-[#fffdf9] shadow-[0_35px_100px_rgba(43,31,12,.32)]"
          >
            <div className="bg-[radial-gradient(circle_at_top_right,rgba(215,173,78,.24),transparent_45%),linear-gradient(135deg,#fffaf0,#f7ecd2)] px-6 pb-5 pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b77c08] to-[#edcb75] text-[#211605] shadow-[0_10px_24px_rgba(183,124,8,.22)]">
                  <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                </div>
                <button
                  type="button"
                  aria-label="Đóng"
                  disabled={purchasing}
                  onClick={() => setConfirmOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#766d62] transition hover:bg-black/5 hover:text-[#211b13] disabled:opacity-40"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <h2 id="premium-confirm-title" className="mt-5 text-2xl font-bold text-[#211b13]">Xác nhận {status.premium ? "gia hạn" : "đăng ký"} Premium</h2>
              <p className="mt-2 text-sm leading-6 text-[#71675b]">Premium được kích hoạt ngay sau khi thanh toán thành công và giao dịch không thể hoàn tác.</p>
            </div>

            <div className="space-y-3 px-6 py-5">
              <div className="flex items-center justify-between rounded-xl bg-[#f6f1e9] px-4 py-3 text-sm">
                <span className="text-[#80766a]">Giá gói</span>
                <strong className="text-[#9b6a08]">{money(selectedPrice)}</strong>
              </div>
              <div className="flex items-center justify-between px-4 py-1 text-sm">
                <span className="text-[#80766a]">Số dư hiện tại</span>
                <strong className="text-[#282116]">{money(status.remainingBalance)}</strong>
              </div>
              <div className="flex items-center justify-between border-t border-[#ece2d2] px-4 pt-4 text-sm">
                <span className="font-semibold text-[#5f5548]">Số dư sau thanh toán</span>
                <strong className="text-[#282116]">{money(status.remainingBalance - selectedPrice)}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-[#eee4d5] bg-[#fbf8f2] p-5">
              <button
                type="button"
                disabled={purchasing}
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-[#d9cdbb] bg-white px-4 py-3 font-bold text-[#5e5549] transition hover:bg-[#f4efe7] disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={purchasing}
                onClick={purchase}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c89418] to-[#f2d987] px-4 py-3 font-bold text-[#171008] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[19px]">lock</span>
                {purchasing ? "Đang xử lý..." : "Xác nhận mua"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
