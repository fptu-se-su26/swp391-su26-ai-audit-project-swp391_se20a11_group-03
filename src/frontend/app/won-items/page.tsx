"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import CollectorShell from "@/components/shells/CollectorShell";
import { ApiError, auctionApi, type PurchaseContractPreview, type WonAuction } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

async function loadWonItems(): Promise<WonAuction[]> {
  return (await auctionApi.wonAuctions()).data;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

const VND = new Intl.NumberFormat("vi-VN");

export default function WonItemsPage() {
  const t = useTranslations("wonItems");
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
          : t("contractLoadError"),
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
          : t("contractSignError"),
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
          : t("contractPdfError"),
      );
    }
  }

  async function handlePay(item: WonAuction) {
    setPayError("");
    setPaySuccess("");
    setPayingId(item.auctionId);
    try {
      await auctionApi.pay(item.auctionId);
      setPaySuccess(t("paySuccess", { name: item.productName }));
      setData(await loadWonItems());
      setContractItem(null);
      setContract(null);
    } catch (cause) {
      setPayError(
        cause instanceof ApiError
          ? cause.message
          : t("payError"),
      );
    } finally {
      setPayingId(null);
    }
  }

  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">{t("title")}</h1>

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
                <th className="px-5 py-3 font-medium">{t("colDate")}</th>
                <th className="px-5 py-3 font-medium">{t("colLotProduct")}</th>
                <th className="px-5 py-3 font-medium">{t("colWinPrice")}</th>
                <th className="px-5 py-3 font-medium">{t("colPayStatus")}</th>
                <th className="px-5 py-3 font-medium">{t("colAction")}</th>
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
                        ? t("statusPaid")
                        : item.status === "forfeited"
                          ? t("statusForfeited")
                          : t("statusPending")}
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
                            ? t("payingBtn")
                            : t("viewContractBtn")}
                        </button>
                      ) : null}
                      <Link
                        href={`/auctions/${item.auctionId}`}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium hover:border-[var(--luxora-gold)]"
                      >
                        {t("viewAuctionBtn")}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && wonItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-white/45">
                    {error ?? t("empty")}
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
                    {t("contractTitle")}
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
                  {t("contractClose")}
                </button>
              </div>

              {contractLoading ? (
                <p className="mt-6 text-sm text-white/50">{t("contractLoading")}</p>
              ) : contract ? (
                <div className="mt-6 space-y-5">
                  <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-white/40">{t("contractSeller")}</p>
                      <p className="mt-1 font-medium">{contract.sellerName}</p>
                      <p className="text-xs text-white/45">{contract.sellerEmail ?? t("contractNoEmail")}</p>
                    </div>
                    <div>
                      <p className="text-white/40">{t("contractBuyer")}</p>
                      <p className="mt-1 font-medium">{contract.buyerName}</p>
                      <p className="text-xs text-white/45">{contract.buyerEmail ?? t("contractNoEmail")}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="grid gap-3 text-sm md:grid-cols-3">
                      <div>
                        <p className="text-white/40">{t("contractWinPrice")}</p>
                        <p className="mt-1 font-semibold text-[var(--luxora-gold-light)]">
                          {VND.format(contract.finalPrice)} ₫
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40">{t("contractDeposit")}</p>
                        <p className="mt-1 font-semibold">
                          {VND.format(contract.depositAmount ?? 0)} ₫
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40">{t("contractRemaining")}</p>
                        <p className="mt-1 font-semibold text-green-300">
                          {VND.format(contract.remainingAmount ?? contract.finalPrice)} ₫
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-white/45">
                      {t("contractDepositNote")}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/70">
                    <p>
                      {t.rich("contractConfirmText", {
                        lot: contractItem.lotNumber,
                        product: contract.productName,
                        price: `${VND.format(contract.finalPrice)} ₫`,
                        strong: (chunks) => (
                          <span className="font-semibold text-white">{chunks}</span>
                        ),
                      })}
                    </p>
                    {contract.signed ? (
                      <p className="mt-3 rounded-lg bg-green-500/10 px-3 py-2 text-xs text-green-300">
                        {contract.signedAt
                          ? t("contractSignedAt", { date: formatDate(contract.signedAt) })
                          : t("contractSigned")}
                      </p>
                    ) : (
                      <label className="mt-4 flex items-start gap-3 text-xs text-white/65">
                        <input
                          type="checkbox"
                          checked={acceptedContract}
                          onChange={(event) => setAcceptedContract(event.target.checked)}
                          className="mt-1"
                        />
                        <span>{t("contractAgree")}</span>
                      </label>
                    )}
                  </div>
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
                      {t("contractViewPdf")}
                    </button>
                  ) : null}
                  {!contract.signed ? (
                    <button
                      type="button"
                      onClick={() => void signContract()}
                      disabled={!acceptedContract || signingContract}
                      className="gradient-cta rounded-full px-4 py-2 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {signingContract ? t("contractSigning") : t("contractSignBtn")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handlePay(contractItem)}
                      disabled={payingId !== null}
                      className="gradient-cta rounded-full px-4 py-2 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {payingId === contractItem.auctionId ? t("contractPaying") : t("contractPayBtn")}
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
