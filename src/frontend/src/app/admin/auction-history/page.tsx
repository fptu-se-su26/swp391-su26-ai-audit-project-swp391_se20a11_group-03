"use client";

import { useEffect, useState, useCallback } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { searchProducts } from "@/lib/services/productService";
import { useTranslations } from "@/i18n/I18nProvider";

type ProductWithAuction = {
  productId: number;
  productName: string;
  categoryName: string | null;
  startingPrice: number;
  currentBid: number;
  status: string;
  imageUrl: string | null;
  auctionId: number | null;
  auctionStatus: string | null;
  auctionStartTime: string | null;
  auctionEndTime: string | null;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function AuctionHistoryPage() {
  const t = useTranslations("adminAuctionHistory");
  const [products, setProducts] = useState<ProductWithAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchProducts = useCallback(async () => {
    try {
      const response = await searchProducts({ size: 100 });
      setProducts(response.content);
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      p.auctionStatus?.toUpperCase() === statusFilter.toUpperCase() ||
      (statusFilter === "ENDED" && p.status === "ACTIVE" && p.currentBid > 0);

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.auctionStatus === "ACTIVE").length,
    ended: products.filter((p) => p.currentBid > 0).length,
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        </div>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell>
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          <div className="bg-error-container rounded-xl p-lg text-center">
            <p className="text-on-error-container">{error}</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{t("pageTitle")}</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant text-center">
            <p className="font-headline-md text-[28px] font-bold text-primary">{stats.total}</p>
            <p className="font-label-md text-label-md text-on-surface-variant mt-xs">{t("totalProducts")}</p>
          </div>
          <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant text-center">
            <p className="font-headline-md text-[28px] font-bold text-primary">{stats.active}</p>
            <p className="font-label-md text-label-md text-on-surface-variant mt-xs">{t("activeAuctions")}</p>
          </div>
          <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant text-center">
            <p className="font-headline-md text-[28px] font-bold text-primary">{stats.ended}</p>
            <p className="font-label-md text-label-md text-on-surface-variant mt-xs">{t("endedWithBids")}</p>
          </div>
          <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant text-center">
            <p className="font-headline-md text-[28px] font-bold text-primary">
              {products.reduce((sum, p) => sum + (p.currentBid || 0), 0) > 0
                ? formatCurrency(products.reduce((sum, p) => sum + (p.currentBid || 0), 0))
                : "-"}
            </p>
            <p className="font-label-md text-label-md text-on-surface-variant mt-xs">{t("totalValue")}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-sm">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-sm focus:border-secondary outline-none w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-sm focus:border-secondary outline-none appearance-none"
          >
            <option value="all">{t("allStatuses")}</option>
            <option value="UPCOMING">{t("upcoming")}</option>
            <option value="ACTIVE">{t("active")}</option>
            <option value="ENDED">{t("ended")}</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-lg text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-md">search_off</span>
              <p className="text-on-surface-variant">{t("noProducts")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-variant">
                    {["Lot #", "Item Title", "Category", "Starting Price", "Current Bid", "Status", "Actions"].map((h) => (
                      <th key={h} className="p-md font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                        {t(`table${h.replace(/ /g, "").replace(/#/g, "")}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((row) => (
                    <tr key={row.productId} className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                      <td className="p-md font-label-md text-label-md text-primary">#{row.productId}</td>
                      <td className="p-md max-w-[200px]">
                        <p className="font-body-md text-sm text-on-surface truncate">{row.productName}</p>
                      </td>
                      <td className="p-md font-body-md text-sm text-on-surface-variant">{row.categoryName || "-"}</td>
                      <td className="p-md font-bold text-primary">{formatCurrency(row.startingPrice)}</td>
                      <td className="p-md">
                        {row.currentBid > 0 ? (
                          <span className="font-bold text-primary">{formatCurrency(row.currentBid)}</span>
                        ) : (
                          <span className="text-on-surface-variant">-</span>
                        )}
                      </td>
                      <td className="p-md">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            row.auctionStatus === "ACTIVE"
                              ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                              : row.auctionStatus === "UPCOMING"
                              ? "bg-secondary-container text-on-secondary-container"
                              : row.currentBid > 0
                              ? "bg-primary-fixed text-on-primary-fixed-variant"
                              : "bg-surface-variant text-on-surface-variant"
                          }`}
                        >
                          {row.auctionStatus || row.status}
                        </span>
                      </td>
                      <td className="p-md">
                        <button className="text-secondary font-label-sm text-label-sm hover:underline">{t("view")}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
