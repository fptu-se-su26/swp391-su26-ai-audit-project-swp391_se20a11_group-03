"use client";

import Link from "next/link";
import { useState } from "react";
import CollectorShell from "@/components/shells/CollectorShell";
import { ApiError, auctionApi, type PurchaseContractPreview, type ShippingAddress, type WonAuction } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

async function loadWonItems(): Promise<WonAuction[]> {
  return (await auctionApi.wonAuctions()).data;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

const VND = new Intl.NumberFormat("vi-VN");
const SHIPPING_FEE = 30_000;
const EMPTY_ADDRESS: ShippingAddress = { receiverName: "", receiverPhone: "", addressLine: "", ward: "", district: "", province: "", note: "" };

export default function WonItemsPage() {
  const { data: wonItems, setData, loading, error } = useApiData(
    loadWonItems,
    [],
  );
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");
  const [contractItem, setContractItem] = useState<WonAuction | null>(null);
  const [contract, setContract] = useState<PurchaseContractPreview | null>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractError, setContractError] = useState("");
  const [acceptedContract, setAcceptedContract] = useState(false);
  const [signingContract, setSigningContract] = useState(false);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);

  async function openContract(item: WonAuction) {
    setContractItem(item);
    setContract(null);
    setContractError("");
    setAcceptedContract(false);
    setContractLoading(true);
    try {
      setContract(await auctionApi.purchaseContract(item.auctionId));
    } catch (cause) {
      setContractError(
        cause instanceof ApiError
          ? cause.message
          : "Không thể tải hợp đồng mua bán.",
      );
    } finally {
      setContractLoading(false);
    }
  }

  async function signContract() {
    if (!contractItem) return;
    setContractError("");
    setSigningContract(true);
    try {
      await auctionApi.signPurchaseContract(contractItem.auctionId);
      setContract(await auctionApi.purchaseContract(contractItem.auctionId));
      setAcceptedContract(false);
    } catch (cause) {
      setContractError(
        cause instanceof ApiError
          ? cause.message
          : "Không thể ký hợp đồng. Vui lòng thử lại.",
      );
    } finally {
      setSigningContract(false);
    }
  }

  async function viewContractPdf() {
    if (!contractItem) return;
    setContractError("");
    try {
      const blob = await auctionApi.purchaseContractPdf(contractItem.auctionId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause) {
      setContractError(
        cause instanceof ApiError
          ? cause.message
          : "Không thể mở file PDF hợp đồng.",
      );
    }
  }

  async function handlePay(item: WonAuction) {
    setPayError("");
    setPaySuccess("");
    setPayingId(item.auctionId);
    try {
      await auctionApi.pay(item.auctionId, address);
      setPaySuccess(
        `Đã thanh toán "${item.productName}" thành công từ ví BidZone.`,
      );
      setData(await loadWonItems());
      setContractItem(null);
      setContract(null);
    } catch (cause) {
      setPayError(
        cause instanceof ApiError
          ? cause.message
          : "Không thể thanh toán. Vui lòng thử lại.",
      );
    } finally {
      setPayingId(null);
    }
  }

  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">Vật phẩm đã thắng</h1>

        {payError ? (
          <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {payError}
          </p>
        ) : null}
        {paySuccess ? (
          <p className="mt-4 rounded-lg border border-green-400/30 bg-green-500/10 px-3 py-2 text-xs text-green-200">
            {paySuccess}
          </p>
        ) : null}

        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">Ngày</th>
                <th className="px-5 py-3 font-medium">Lot &amp; Sản phẩm</th>
                <th className="px-5 py-3 font-medium">Giá thắng</th>
                <th className="px-5 py-3 font-medium">Trạng thái thanh toán</th>
                <th className="px-5 py-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {wonItems.map((item) => (
                <tr key={item.id} className="border-b border-white/5">
                  <td className="px-5 py-4 text-white/60">{formatDate(item.wonDate)}</td>
                  <td className="px-5 py-4">
                    <p className="text-[10px] text-[var(--luxora-gold)]">
                      {item.lotNumber}
                    </p>
                    <p className="font-medium">{item.productName}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[var(--luxora-gold-light)]">
                    {item.finalPrice.toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        item.status === "paid"
                          ? "bg-green-500/10 text-green-300"
                          : item.status === "forfeited"
                            ? "bg-red-500/10 text-red-300"
                            : "bg-yellow-500/10 text-yellow-300"
                      }`}
                    >
                      {item.status === "paid"
                        ? "Đã thanh toán"
                        : item.status === "forfeited"
                          ? "Đã quá hạn"
                          : "Đang chờ"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {item.status !== "paid" && item.status !== "forfeited" ? (
                        <button
                          type="button"
                          onClick={() => void openContract(item)}
                          disabled={payingId !== null}
                          className="gradient-cta rounded-full px-3 py-1.5 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {payingId === item.auctionId
                            ? "Đang thanh toán..."
                            : "Xem hợp đồng"}
                        </button>
                      ) : null}
                      <Link
                        href={`/auctions/${item.auctionId}`}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium hover:border-[var(--luxora-gold)]"
                      >
                        Xem phiên đấu giá
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && wonItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-white/45">
                    {error ?? "Bạn chưa thắng phiên đấu giá nào."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {contractItem ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[var(--luxora-bg,#050505)] p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--luxora-gold)]">
                    Hợp đồng mua bán
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{contractItem.productName}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setContractItem(null);
                    setContract(null);
                    setContractError("");
                  }}
                  className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/70 hover:border-white/40 hover:text-white"
                >
                  Đóng
                </button>
              </div>

              {contractLoading ? (
                <p className="mt-6 text-sm text-white/50">Đang tải hợp đồng...</p>
              ) : contract ? (
                <div className="mt-6 space-y-5">
                  <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-white/40">Người bán</p>
                      <p className="mt-1 font-medium">{contract.sellerName}</p>
                      <p className="text-xs text-white/45">{contract.sellerEmail ?? "Chưa có email"}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Người mua</p>
                      <p className="mt-1 font-medium">{contract.buyerName}</p>
                      <p className="text-xs text-white/45">{contract.buyerEmail ?? "Chưa có email"}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="grid gap-3 text-sm md:grid-cols-3">
                      <div>
                        <p className="text-white/40">Giá thắng</p>
                        <p className="mt-1 font-semibold text-[var(--luxora-gold-light)]">
                          {VND.format(contract.finalPrice)} ₫
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40">Cọc đang giữ</p>
                        <p className="mt-1 font-semibold">
                          {VND.format(contract.depositAmount ?? 0)} ₫
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40">Còn thanh toán</p>
                        <p className="mt-1 font-semibold text-green-300">
                          {VND.format(contract.remainingAmount ?? contract.finalPrice)} ₫
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-white/45">
                      Khoản cọc đã được giữ trong ví. Khi thanh toán, hệ thống nhả phần cọc đó và chỉ làm giảm số dư khả dụng thêm phần còn lại.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/70">
                    <p>
                      Tôi xác nhận mua lot {contractItem.lotNumber} - {contract.productName} với giá thắng{" "}
                      <span className="font-semibold text-white">{VND.format(contract.finalPrice)} ₫</span>.
                      Hợp đồng được ký điện tử giữa người bán, người mua và BidZone làm đơn vị vận hành.
                    </p>
                    {contract.signed ? (
                      <p className="mt-3 rounded-lg bg-green-500/10 px-3 py-2 text-xs text-green-300">
                        Đã ký hợp đồng{contract.signedAt ? ` lúc ${formatDate(contract.signedAt)}` : ""}.
                      </p>
                    ) : (
                      <label className="mt-4 flex items-start gap-3 text-xs text-white/65">
                        <input
                          type="checkbox"
                          checked={acceptedContract}
                          onChange={(event) => setAcceptedContract(event.target.checked)}
                          className="mt-1"
                        />
                        <span>Tôi đã đọc, hiểu và đồng ý ký hợp đồng mua bán điện tử cho vật phẩm này.</span>
                      </label>
                    )}
                  </div>
                  {contract.signed ? (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <h3 className="text-sm font-semibold">Äá»‹a chá»‰ nháº­n hÃ ng</h3>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {([['receiverName','NgÆ°á»i nháº­n'],['receiverPhone','Sá»‘ Ä‘iá»‡n thoáº¡i'],['addressLine','Sá»‘ nhÃ , Ä‘Æ°á»ng'],['ward','PhÆ°á»ng/xÃ£'],['district','Quáº­n/huyá»‡n'],['province','Tá»‰nh/thÃ nh phá»‘']] as const).map(([key, label]) => (
                          <label key={key} className="text-xs text-white/50">{label}<input required value={address[key] ?? ''} onChange={(e) => setAddress((old) => ({ ...old, [key]: e.target.value }))} className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-[var(--luxora-gold)]" /></label>
                        ))}
                      </div>
                      <label className="mt-3 block text-xs text-white/50">Ghi chÃº<textarea value={address.note} onChange={(e) => setAddress((old) => ({ ...old, note: e.target.value }))} className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" /></label>
                      <div className="mt-4 border-t border-white/10 pt-3 text-sm"><p className="flex justify-between"><span>PhÃ­ giao hÃ ng</span><span>{VND.format(SHIPPING_FEE)} â‚«</span></p><p className="mt-2 flex justify-between font-semibold text-[var(--luxora-gold-light)]"><span>Tá»•ng thanh toÃ¡n</span><span>{VND.format(contract.finalPrice + SHIPPING_FEE)} â‚«</span></p></div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {contractError ? (
                <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {contractError}
                </p>
              ) : null}

              {contract ? (
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  {contract.signed ? (
                    <button
                      type="button"
                      onClick={() => void viewContractPdf()}
                      className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold hover:border-[var(--luxora-gold)]"
                    >
                      Xem PDF
                    </button>
                  ) : null}
                  {!contract.signed ? (
                    <button
                      type="button"
                      onClick={() => void signContract()}
                      disabled={!acceptedContract || signingContract}
                      className="gradient-cta rounded-full px-4 py-2 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {signingContract ? "Đang ký..." : "Ký hợp đồng"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handlePay(contractItem)}
                      disabled={payingId !== null || !address.receiverName || !address.receiverPhone || !address.addressLine || !address.ward || !address.district || !address.province}
                      className="gradient-cta rounded-full px-4 py-2 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {payingId === contractItem.auctionId ? "Đang thanh toán..." : "Thanh toán"}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </CollectorShell>
  );
}
