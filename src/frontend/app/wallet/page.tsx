"use client";

import Image from "next/image";
import { useState } from "react";
import CollectorShell from "@/components/shells/CollectorShell";
import {
  ApiError,
  walletApi,
  type DepositQrResponse,
  type WalletInfo,
  type WalletTransaction,
} from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

type WalletData = { wallet: WalletInfo; transactions: WalletTransaction[] };

async function loadWallet(): Promise<WalletData> {
  const [wallet, transactions] = await Promise.all([
    walletApi.get(),
    walletApi.transactions(),
  ]);
  return { wallet, transactions };
}

const EMPTY_WALLET: WalletData = {
  wallet: {
    walletId: 0,
    userId: 0,
    balance: 0,
    holdBalance: 0,
    availableBalance: 0,
    status: "",
  },
  transactions: [],
};

const DEPOSIT_PRESETS = [100_000, 500_000, 1_000_000, 5_000_000];

function formatVnd(value: number) {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

export default function WalletPage() {
  const { data, setData, loading, error } = useApiData(
    loadWallet,
    EMPTY_WALLET,
  );
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [amount, setAmount] = useState("100000");
  const [depositQr, setDepositQr] = useState<DepositQrResponse | null>(null);
  const [balanceBeforeDeposit, setBalanceBeforeDeposit] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [actionError, setActionError] = useState("");
  const [depositStatus, setDepositStatus] = useState("");
  const [copiedField, setCopiedField] = useState("");

  const numericAmount = Number(amount.replace(/\D/g, ""));

  function openDeposit() {
    setShowDeposit(true);
    setDepositQr(null);
    setActionError("");
    setDepositStatus("");
    setCopiedField("");
  }

  function closeDeposit() {
    setShowDeposit(false);
    setDepositQr(null);
    setActionError("");
    setDepositStatus("");
  }

  async function createDepositQr(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Number.isSafeInteger(numericAmount) || numericAmount < 1_000) {
      setActionError("Số tiền nạp tối thiểu là 1.000 ₫.");
      return;
    }

    setSubmitting(true);
    setActionError("");
    setDepositStatus("");
    try {
      const qr = await walletApi.deposit(numericAmount);
      setBalanceBeforeDeposit(data.wallet.balance);
      setDepositQr(qr);
    } catch (cause) {
      setActionError(
        cause instanceof ApiError
          ? cause.message
          : "Không thể tạo mã nạp tiền. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const numericWithdrawAmount = Number(withdrawAmount.replace(/\D/g, ""));

  function openWithdraw() {
    setShowWithdraw(true);
    setWithdrawError("");
    setWithdrawSuccess("");
  }

  async function submitWithdraw(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess("");

    if (!Number.isSafeInteger(numericWithdrawAmount) || numericWithdrawAmount < 10_000) {
      setWithdrawError("Số tiền rút tối thiểu là 10.000 ₫.");
      return;
    }
    if (numericWithdrawAmount > data.wallet.availableBalance) {
      setWithdrawError("Số tiền rút vượt quá số dư khả dụng.");
      return;
    }

    setWithdrawing(true);
    try {
      await walletApi.withdraw({
        amount: numericWithdrawAmount,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
      });
      setWithdrawSuccess(
        "Đã gửi yêu cầu rút tiền. Nhân viên sẽ xử lý trong thời gian sớm nhất.",
      );
      setWithdrawAmount("");
      const nextData = await loadWallet();
      setData(nextData);
    } catch (cause) {
      setWithdrawError(
        cause instanceof ApiError
          ? cause.message
          : "Không thể gửi yêu cầu rút tiền. Vui lòng thử lại.",
      );
    } finally {
      setWithdrawing(false);
    }
  }

  async function copyValue(field: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(""), 1500);
    } catch {
      setActionError("Không thể sao chép tự động trên trình duyệt này.");
    }
  }

  async function checkDeposit() {
    setChecking(true);
    setActionError("");
    try {
      const nextData = await loadWallet();
      setData(nextData);
      if (nextData.wallet.balance > balanceBeforeDeposit) {
        setDepositStatus(
          `Đã nhận ${formatVnd(nextData.wallet.balance - balanceBeforeDeposit)} vào ví.`,
        );
      } else {
        setDepositStatus(
          "Chưa nhận được giao dịch. Ngân hàng có thể cần vài phút để xử lý.",
        );
      }
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : "Không thể kiểm tra số dư ví.",
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">Ví BidZone</h1>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">Số dư khả dụng</p>
            <p className="mt-2 text-2xl font-bold text-[var(--luxora-gold-light)]">
              {data.wallet.availableBalance.toLocaleString("vi-VN")} ₫
            </p>
            <button
              type="button"
              onClick={openDeposit}
              className="gradient-cta mt-4 w-full rounded-full py-2.5 text-xs font-semibold text-black"
            >
              Nạp tiền
            </button>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">Tiền cọc đang khóa</p>
            <p className="mt-2 text-2xl font-bold">
              {data.wallet.holdBalance.toLocaleString("vi-VN")} ₫
            </p>
            <button
              type="button"
              onClick={openWithdraw}
              className="mt-4 w-full rounded-full border border-white/15 py-2.5 text-xs font-semibold hover:border-[var(--luxora-gold)]"
            >
              Rút tiền
            </button>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <p className="text-xs text-white/40">Tổng giá trị tài sản</p>
            <p className="mt-2 text-2xl font-bold">
              {data.wallet.balance.toLocaleString("vi-VN")} ₫
            </p>
          </div>
        </div>

        <h2 className="font-headline-md mt-10 mb-4 text-lg">
          Lịch sử giao dịch
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">Ngày</th>
                <th className="px-5 py-3 font-medium">Loại</th>
                <th className="px-5 py-3 font-medium">Mô tả</th>
                <th className="px-5 py-3 font-medium">Số tiền</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((tx) => (
                <tr key={tx.transactionId} className="border-b border-white/5">
                  <td className="px-5 py-4 text-white/60">
                    {new Intl.DateTimeFormat("vi-VN").format(
                      new Date(tx.createdAt),
                    )}
                  </td>
                  <td className="px-5 py-4">{tx.transactionTypeLabel}</td>
                  <td className="px-5 py-4 text-white/60">{tx.description}</td>
                  <td
                    className={`px-5 py-4 font-semibold ${
                      tx.signedAmount >= 0 ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {tx.signedAmount >= 0 ? "+" : ""}
                    {tx.signedAmount.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        tx.status.toUpperCase() === "COMPLETED"
                          ? "bg-green-500/10 text-green-300"
                          : "bg-yellow-500/10 text-yellow-300"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && data.transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-white/45">
                    {error ?? "Chưa có giao dịch nào."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDeposit ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deposit-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDeposit();
          }}
        >
          <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-white/15 bg-[#111] p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={closeDeposit}
              title="Đóng"
              aria-label="Đóng"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 id="deposit-title" className="font-headline-md pr-12 text-xl">
              Nạp tiền vào ví
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Quét VietQR hoặc chuyển khoản đúng nội dung để hệ thống nhận diện.
            </p>

            {!depositQr ? (
              <form onSubmit={createDepositQr} className="mt-6">
                <label
                  htmlFor="deposit-amount"
                  className="text-xs font-semibold uppercase tracking-wider text-white/60"
                >
                  Số tiền nạp
                </label>
                <div className="mt-2 flex h-12 items-center rounded-lg border border-white/15 bg-black/40 px-4 focus-within:border-[var(--luxora-gold)]">
                  <input
                    id="deposit-amount"
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={numericAmount ? numericAmount.toLocaleString("vi-VN") : ""}
                    onChange={(event) =>
                      setAmount(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Tối thiểu 1.000"
                    className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none"
                  />
                  <span className="text-sm text-white/45">₫</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DEPOSIT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(String(preset))}
                      className={`h-10 rounded-lg border text-xs font-semibold transition-colors ${
                        numericAmount === preset
                          ? "border-[var(--luxora-gold)] bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold-light)]"
                          : "border-white/10 text-white/65 hover:border-white/25"
                      }`}
                    >
                      {preset.toLocaleString("vi-VN")}
                    </button>
                  ))}
                </div>

                {actionError ? (
                  <p className="mt-4 text-sm text-red-300">{actionError}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="gradient-cta mt-6 h-11 w-full rounded-full text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "ĐANG TẠO MÃ..." : "TẠO MÃ VIETQR"}
                </button>
              </form>
            ) : (
              <div className="mt-5">
                <div className="mx-auto w-fit overflow-hidden rounded-lg bg-white p-2">
                  <Image
                    src={depositQr.qrUrl}
                    alt={`Mã VietQR nạp ${formatVnd(depositQr.amount)}`}
                    width={280}
                    height={280}
                    priority
                    className="h-auto w-[260px] sm:w-[280px]"
                  />
                </div>

                <dl className="mt-5 divide-y divide-white/10 border-y border-white/10 text-sm">
                  <DepositDetail label="Số tiền" value={formatVnd(depositQr.amount)} />
                  <DepositDetail
                    label="Số tài khoản"
                    value={depositQr.bankAccount}
                    onCopy={() =>
                      void copyValue("account", depositQr.bankAccount)
                    }
                    copied={copiedField === "account"}
                  />
                  <DepositDetail
                    label="Chủ tài khoản"
                    value={depositQr.accountName}
                  />
                  <DepositDetail
                    label="Nội dung"
                    value={depositQr.content}
                    emphasize
                    onCopy={() => void copyValue("content", depositQr.content)}
                    copied={copiedField === "content"}
                  />
                </dl>

                {actionError ? (
                  <p className="mt-4 text-sm text-red-300">{actionError}</p>
                ) : null}
                {depositStatus ? (
                  <p
                    className={`mt-4 text-sm ${
                      depositStatus.startsWith("Đã nhận")
                        ? "text-green-300"
                        : "text-yellow-200"
                    }`}
                  >
                    {depositStatus}
                  </p>
                ) : null}

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDepositQr(null);
                      setDepositStatus("");
                    }}
                    className="h-11 flex-1 rounded-full border border-white/15 text-sm font-semibold hover:border-white/30"
                  >
                    Đổi số tiền
                  </button>
                  <button
                    type="button"
                    onClick={() => void checkDeposit()}
                    disabled={checking}
                    className="gradient-cta h-11 flex-1 rounded-full text-sm font-bold text-black disabled:opacity-50"
                  >
                    {checking ? "ĐANG KIỂM TRA..." : "KIỂM TRA SỐ DƯ"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
      {showWithdraw ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="withdraw-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowWithdraw(false);
          }}
        >
          <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-white/15 bg-[#111] p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={() => setShowWithdraw(false)}
              title="Đóng"
              aria-label="Đóng"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 id="withdraw-title" className="font-headline-md pr-12 text-xl">
              Rút tiền về tài khoản ngân hàng
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Số dư khả dụng: {formatVnd(data.wallet.availableBalance)}. Yêu cầu
              sẽ được nhân viên duyệt trước khi chuyển khoản.
            </p>

            <form onSubmit={submitWithdraw} className="mt-6 flex flex-col gap-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Số tiền rút
                </span>
                <div className="mt-2 flex h-12 items-center rounded-lg border border-white/15 bg-black/40 px-4 focus-within:border-[var(--luxora-gold)]">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={
                      numericWithdrawAmount
                        ? numericWithdrawAmount.toLocaleString("vi-VN")
                        : ""
                    }
                    onChange={(event) =>
                      setWithdrawAmount(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Tối thiểu 10.000"
                    className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none"
                  />
                  <span className="text-sm text-white/45">₫</span>
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Ngân hàng
                </span>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  placeholder="VD: Vietcombank"
                  className="mt-2 h-12 w-full rounded-lg border border-white/15 bg-black/40 px-4 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Số tài khoản
                </span>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(event) =>
                    setAccountNumber(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Nhập số tài khoản nhận tiền"
                  className="mt-2 h-12 w-full rounded-lg border border-white/15 bg-black/40 px-4 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Chủ tài khoản
                </span>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  placeholder="Tên chủ tài khoản (không dấu)"
                  className="mt-2 h-12 w-full rounded-lg border border-white/15 bg-black/40 px-4 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
                />
              </label>

              {withdrawError ? (
                <p className="text-sm text-red-300">{withdrawError}</p>
              ) : null}
              {withdrawSuccess ? (
                <p className="text-sm text-green-300">{withdrawSuccess}</p>
              ) : null}

              <button
                type="submit"
                disabled={withdrawing}
                className="gradient-cta h-11 w-full rounded-full text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {withdrawing ? "ĐANG GỬI YÊU CẦU..." : "GỬI YÊU CẦU RÚT TIỀN"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </CollectorShell>
  );
}

function DepositDetail({
  label,
  value,
  emphasize = false,
  onCopy,
  copied = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-white/45">{label}</dt>
      <dd className="flex min-w-0 items-center justify-end gap-2 text-right">
        <span
          className={`break-all font-semibold ${
            emphasize ? "text-[var(--luxora-gold-light)]" : "text-white"
          }`}
        >
          {value}
        </span>
        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            title={copied ? "Đã sao chép" : `Sao chép ${label.toLowerCase()}`}
            aria-label={copied ? "Đã sao chép" : `Sao chép ${label.toLowerCase()}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">
              {copied ? "check" : "content_copy"}
            </span>
          </button>
        ) : null}
      </dd>
    </div>
  );
}
