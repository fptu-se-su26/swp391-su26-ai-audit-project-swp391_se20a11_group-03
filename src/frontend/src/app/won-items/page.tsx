"use client";

import { useEffect, useState } from "react";
import CollectorShell from "@/components/layout/CollectorShell";
import { useTranslations } from "@/i18n/I18nProvider";
import { getProductImage } from "@/lib/productPresentation";
import { payAuction } from "@/lib/services/auctionService";
import { WonItem, getWonItems } from "@/lib/services/userBidService";

export default function WonItemsPage() {
  const t = useTranslations("wonItems");
  const [items, setItems] = useState<WonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchWonItems() {
      setLoading(true);
      try {
        const wonItems = await getWonItems();
        setItems(wonItems);
      } catch (error) {
        console.error("Failed to fetch won items:", error);
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
      await payAuction(item.id);
      setItems((current) =>
        current.map((row) => (row.id === item.id ? { ...row, status: "paid" } : row)),
      );
      setMessage(t("paySuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("payError"));
    } finally {
      setPayingId(null);
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
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                        <td className="p-md font-body-md text-sm text-on-surface">{item.wonDate}</td>
                        <td className="p-md">
                          <div className="flex items-center gap-sm">
                              <div className="w-12 h-12 rounded bg-surface-variant overflow-hidden shrink-0">
                              <img src={getProductImage(item.image)} alt={item.productName} className="w-full h-full object-cover" />
                              </div>
                            <div>
                              <p className="font-label-md text-label-md text-primary">{item.lotNumber}</p>
                              <p className="font-body-md text-sm text-on-surface-variant truncate w-40">{item.productName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-md font-headline-sm text-[16px] font-bold text-primary">
                          ₫{item.finalPrice.toLocaleString('vi-VN')}
                        </td>
                        <td className="p-md">
                          {item.status === "paid" ? (
                            <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-1 rounded-full font-label-sm text-[10px]">
                              {t("paid")}
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
                          {item.status === "pending_payment" ? (
                            <button
                              onClick={() => void handlePay(item)}
                              disabled={payingId === item.id}
                              className="rounded-lg bg-secondary px-md py-sm font-label-sm text-label-sm text-on-secondary transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {payingId === item.id ? t("paying") : t("payNow")}
                            </button>
                          ) : (
                            <button className="text-on-surface-variant hover:text-primary transition-colors p-1" title={t("downloadInvoice")}>
                              <span className="material-symbols-outlined">receipt</span>
                            </button>
                          )}
                          <button
                            className={`p-1 ml-2 transition-colors ${item.status === "paid" || item.status === "shipped" ? "text-on-surface-variant hover:text-primary" : "text-outline-variant cursor-not-allowed"}`}
                            title={t("trackShipping")}
                          >
                            <span className="material-symbols-outlined">local_shipping</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </CollectorShell>
  );
}
