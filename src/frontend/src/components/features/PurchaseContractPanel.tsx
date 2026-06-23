"use client";

import { useEffect, useState } from "react";
import {
  PurchaseContract,
  getPurchaseContract,
  purchaseContractPdfUrl,
  signPurchaseContract,
} from "@/lib/services/purchaseContractService";

function formatCurrency(amount: number | null): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
}

type Props = {
  auctionId: number;
  onSigned?: () => void;
  compact?: boolean;
};

export default function PurchaseContractPanel({ auctionId, onSigned, compact }: Props) {
  const [contract, setContract] = useState<PurchaseContract | null>(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPurchaseContract(auctionId)
      .then((c) => {
        if (!cancelled) setContract(c);
      })
      .catch(() => {
        if (!cancelled) setError("Không thể tải hợp đồng mua bán.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auctionId]);

  async function handleSign() {
    if (!agree && !contract?.signed) {
      setError("Bạn cần đồng ý với nội dung hợp đồng trước khi ký.");
      return;
    }
    setSigning(true);
    setError("");
    try {
      const result = await signPurchaseContract(auctionId);
      setContract({
        signed: true,
        contractId: result.contractId,
        fileUrl: result.fileUrl,
        signedAt: result.signedAt,
        finalPrice: contract?.finalPrice ?? result.finalPrice ?? null,
        productName: contract?.productName ?? result.productName ?? null,
      });
      onSigned?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể ký hợp đồng.");
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-on-surface-variant">Đang tải hợp đồng mua bán...</p>;
  }

  const pdfUrl = purchaseContractPdfUrl(contract?.fileUrl ?? null);

  return (
    <div className={`rounded-lg border border-secondary/40 bg-secondary-container/15 ${compact ? "p-sm" : "p-md"}`}>
      <div className="flex items-center gap-xs">
        <span className="material-symbols-outlined text-secondary">contract</span>
        <h3 className="font-label-md text-label-md text-primary">Hợp đồng mua bán điện tử</h3>
      </div>

      {!compact && (
        <div className="mt-sm max-h-40 overflow-y-auto rounded-md border border-outline-variant bg-surface-container-lowest p-sm text-xs text-on-surface-variant">
          <p className="font-label-md text-label-md text-primary">Mẫu hợp đồng mua bán qua đấu giá</p>
          {contract?.productName && <p className="mt-1">Sản phẩm: <strong>{contract.productName}</strong></p>}
          {contract?.finalPrice != null && <p>Số tiền thanh toán: <strong>{formatCurrency(contract.finalPrice)}</strong></p>}
          <p className="mt-1">Bên bán / nền tảng đã ký sẵn. Bạn (bên mua) cần ký điện tử trước khi thanh toán.</p>
          <p className="mt-1">Hợp đồng gồm thông tin bên bán, bên mua, sản phẩm và giá chốt — tự động điền theo phiên đấu giá.</p>
        </div>
      )}

      {contract?.signed ? (
        <div className="mt-sm flex flex-wrap items-center gap-sm">
          <span className="flex items-center gap-xs text-on-tertiary-container">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="font-label-md text-label-md">Đã ký hợp đồng mua bán</span>
          </span>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-xs rounded-lg border border-secondary/50 bg-surface px-3 py-1.5 font-label-md text-label-md text-secondary hover:bg-secondary-container/30"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              Xem PDF
            </a>
          )}
        </div>
      ) : (
        <>
          <label className="mt-sm flex items-start gap-sm">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
            <span className="text-sm text-on-surface-variant">
              Tôi đã đọc và đồng ý ký hợp đồng mua bán điện tử (bên bán/nền tảng đã ký sẵn).
            </span>
          </label>
          <button
            type="button"
            onClick={handleSign}
            disabled={signing || !agree}
            className="mt-sm w-full rounded-md bg-secondary px-4 py-2 font-label-md text-label-md text-on-secondary hover:bg-secondary-fixed-dim disabled:opacity-60"
          >
            {signing ? "Đang ký..." : "Ký hợp đồng mua bán"}
          </button>
        </>
      )}

      {error && <p className="mt-sm text-sm text-error">{error}</p>}
    </div>
  );
}
