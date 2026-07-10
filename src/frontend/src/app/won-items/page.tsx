"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CollectorShell from "@/components/layout/CollectorShell";
import PurchaseContractSignModal from "@/components/features/PurchaseContractSignModal";
import { useTranslations } from "@/i18n/I18nProvider";
import { canPayForWonAuction, isForfeitedPayment } from "@/lib/auctionPayment";
import { getProductImage } from "@/lib/productPresentation";
import { payAuction } from "@/lib/services/auctionService";
import { getPurchaseContract, openPurchaseContractPdf } from "@/lib/services/purchaseContractService";
import { WonItem, getWonItems } from "@/lib/services/userBidService";

export default function WonItemsPage() {
  const t = useTranslations("wonItems");
  const tContracts = useTranslations("contracts");
  const tCommon = useTranslations("common");
  const [items, setItems] = useState<WonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [contractSigned, setContractSigned] = useState<Record<number, boolean>>({});
  const [contractModalAuctionId, setContractModalAuctionId] = useState<number | null>(null);
  const [openingPdfId, setOpeningPdfId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchWonItems() {
      setLoading(true);
      try {
        const wonItems = await getWonItems();
        setItems(wonItems);
        const signed: Record<number, boolean> = {};
        await Promise.all(
          wonItems.map(async (item) => {
            const auctionId = item.auctionId ?? item.id;
            try {
              const c = await getPurchaseContract(auctionId);
              signed[auctionId] = Boolean(c.signed || c.acknowledged);
            } catch {
              signed[auctionId] = false;
            }
          }),
        );
        setContractSigned(signed);
      } catch (err) {
        console.error("Failed to fetch won items:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchWonItems();
  }, []);

  async function handlePay(item: WonItem) {
    setPayingId(item.id);
    setMessage("");
    setError("");
    try {
      await payAuction(item.auctionId ?? item.id);
      setItems((current) =>
        current.map((row) => (row.id === item.id ? { ...row, status: "paid", paymentStatus: "PAID" } : row)),
      );
      setMessage(t("paySuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("payError"));
    } finally {
      setPayingId(null);
    }
  }

  async function handleOpenContractPdf(auctionId: number) {
    setOpeningPdfId(auctionId);
    setError("");
    try {
      await openPurchaseContractPdf(auctionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pdfLoadError"));
    } finally {
      setOpeningPdfId(null);
    }
  }

  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <section>
          <h2 className="font-display-lg-mobile md:font-display-lg text-primary">{t("title")}</h2>
          <p className="font-body-lg text-on-surface-variant mt-xs">{t("subtitle")}</p>
        </section>

        <section>
          {message && (
            <div className="mb-md rounded-lg bg-tertiary-fixed px-md py-sm text-on-tertiary-fixed-variant">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-md rounded-lg bg-error-container px-md py-sm text-on-error-container">
              {error}
            </div>
          )}
          <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
            {loading ? (
              <div className="p-xl text-center text-on-surface-variant">{t("loading")}</div>
            ) : items.length === 0 ? (
              <div className="p-xl text-center text-on-surface-variant">
                <p className="mb-sm">{t("emptyTitle")}</p>
                <p className="text-sm">{t("emptyDesc")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-variant">
                      {[t("date"), t("lotItem"), t("winningBid"), t("paymentStatus"), t("actions")].map((h, i) => (
                        <th key={h} className={`p-md font-label-sm text-label-sm text-on-surface-variant ${i === 4 ? "text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const auctionId = item.auctionId ?? item.id;
                      const forfeited =
                        item.status === "forfeited" ||
                        isForfeitedPayment(item.paymentStatus, item.paymentDeadline);
                      const canPay = canPayForWonAuction(item.paymentStatus, item.paymentDeadline);

                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-surface-variant transition-colors hover:bg-surface-container-lowest ${
                            forfeited ? "bg-error-container/20" : ""
                          }`}
                        >
                          <td className={`p-md font-body-md text-sm ${forfeited ? "text-error" : "text-on-surface"}`}>
                            {item.wonDate}
                          </td>
                          <td className="p-md">
                            <div className="flex items-center gap-sm">
                              <div className="w-12 h-12 rounded bg-surface-variant overflow-hidden shrink-0">
                                <img src={getProductImage(item.image)} alt={item.productName} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className={`font-label-md text-label-md ${forfeited ? "text-error" : "text-primary"}`}>
                                  {item.lotNumber}
                                </p>
                                <p className="font-body-md text-sm text-on-surface-variant truncate w-40">{item.productName}</p>
                              </div>
                            </div>
                          </td>
                          <td className={`p-md font-headline-sm text-[16px] font-bold ${forfeited ? "text-error" : "text-primary"}`}>
                            ₫{item.finalPrice.toLocaleString("vi-VN")}
                          </td>
                          <td className="p-md">
                            {item.status === "paid" || item.paymentStatus === "PAID" ? (
                              <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-1 rounded-full font-label-sm text-[10px]">
                                {t("paid")}
                              </span>
                            ) : forfeited ? (
                              <span className="inline-flex items-center gap-1 bg-error-container text-error px-2 py-1 rounded-full font-label-sm text-[10px]">
                                {t("forfeited")}
                              </span>
                            ) : item.status === "shipped" || item.status === "delivered" ? (
                              <span className="inline-flex items-center gap-1 bg-primary-container text-on-primary-container px-2 py-1 rounded-full font-label-sm text-[10px]">
                                {item.status === "delivered" ? t("delivered") : t("shipped")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full font-label-sm text-[10px]">
                                {t("pending")}
                              </span>
                            )}
                          </td>
                          <td className="p-md text-right">
                            {forfeited ? (
                              <p className="text-xs text-error max-w-[220px] ml-auto">{t("overdueMsg")}</p>
                            ) : canPay ? (
                              <div className="flex flex-col items-end gap-sm min-w-[220px]">
                                {!contractSigned[auctionId] ? (
                                  <button
                                    type="button"
                                    onClick={() => setContractModalAuctionId(auctionId)}
                                    className="w-full rounded-lg border border-secondary/50 bg-secondary-container/20 px-3 py-2 text-xs font-semibold text-secondary hover:bg-secondary-container/40"
                                  >
                                    {tCommon("readAndSign")}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => void handleOpenContractPdf(auctionId)}
                                    disabled={openingPdfId === auctionId}
                                    className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-xs text-on-surface-variant hover:text-primary"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                                    {openingPdfId === auctionId ? tCommon("opening") : tContracts("downloadPurchasePdf")}
                                  </button>
                                )}
                                <button
                                  onClick={() => void handlePay(item)}
                                  disabled={payingId === item.id || !contractSigned[auctionId]}
                                  className="rounded-lg bg-secondary px-md py-sm font-label-sm text-label-sm text-on-secondary transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {payingId === item.id
                                    ? t("paying")
                                    : contractSigned[auctionId]
                                      ? t("payNow")
                                      : tContracts("signBeforePayShort")}
                                </button>
                                <Link
                                  href={`/auctions/${item.productId}`}
                                  className="text-[11px] text-secondary hover:underline"
                                >
                                  {t("viewSessionDetail")}
                                </Link>
                              </div>
                            ) : contractSigned[auctionId] || item.status === "paid" || item.paymentStatus === "PAID" ? (
                              <button
                                type="button"
                                onClick={() => void handleOpenContractPdf(auctionId)}
                                disabled={openingPdfId === auctionId || !contractSigned[auctionId]}
                                className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-xs text-on-surface-variant hover:text-primary disabled:opacity-50"
                                title={tContracts("downloadPurchasePdf")}
                              >
                                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                                {openingPdfId === auctionId ? "..." : t("contractPdf")}
                              </button>
                            ) : (
                              <button className="text-on-surface-variant hover:text-primary transition-colors p-1" title={t("downloadInvoice")}>
                                <span className="material-symbols-outlined">receipt</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {contractModalAuctionId != null && (
        <PurchaseContractSignModal
          auctionId={contractModalAuctionId}
          open
          onClose={() => setContractModalAuctionId(null)}
          onSigned={() => {
            setContractSigned((current) => ({ ...current, [contractModalAuctionId]: true }));
            setContractModalAuctionId(null);
          }}
        />
      )}
    </CollectorShell>
  );
}
