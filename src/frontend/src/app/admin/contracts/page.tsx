"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { ContractRow, getContracts } from "@/lib/services/dashboardService";
import { resolveApiUrl } from "@/lib/apiClient";

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

type Filter = "all" | "SELLER_AGREEMENT" | "LISTING";

export default function AdminContractsPage() {
  const [rows, setRows] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    getContracts()
      .then(setRows)
      .catch(() => setError("Không thể tải danh sách hợp đồng."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.contractType === filter)),
    [rows, filter],
  );

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: `Tất cả (${rows.length})` },
    { id: "SELLER_AGREEMENT", label: "Hợp đồng người bán" },
    { id: "LISTING", label: "Hợp đồng niêm yết" },
  ];

  if (loading) {
    return (
      <AdminShell>
        <div className="flex h-64 items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-[1400px] space-y-lg p-margin-mobile md:p-margin-desktop">
        <div>
          <h1 className="font-display-lg-mobile text-primary md:font-display-lg">Hợp đồng điện tử</h1>
          <p className="mt-xs font-body-lg text-on-surface-variant">
            Tất cả hợp đồng điện tử (PDF) đã ký trên nền tảng: hợp đồng người bán và hợp đồng niêm yết.
          </p>
        </div>

        {error && <div className="rounded-xl bg-error-container p-md text-on-error-container">{error}</div>}

        <div className="flex flex-wrap gap-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-full px-4 py-1.5 font-label-md text-label-md transition-all ${
                filter === tab.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl bg-surface p-xl text-center">
            <span className="material-symbols-outlined mb-sm block text-4xl text-on-surface-variant">contract</span>
            <p className="text-on-surface-variant">Chưa có hợp đồng nào.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-surface-variant bg-surface soft-shadow">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-surface-variant bg-surface-container-low">
                    {["Mã", "Loại hợp đồng", "Bên liên quan", "Ngày ký", "Tài liệu"].map((h) => (
                      <th key={h} className="whitespace-nowrap p-md font-label-sm text-label-sm text-on-surface-variant">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.contractId} className="border-b border-surface-variant hover:bg-surface-container-lowest">
                      <td className="p-md font-label-md text-label-md text-primary">#{c.contractId}</td>
                      <td className="p-md">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                            c.contractType === "SELLER_AGREEMENT"
                              ? "bg-secondary-container text-on-secondary-container"
                              : "bg-tertiary-container text-on-tertiary-container"
                          }`}
                        >
                          {c.typeLabel}
                        </span>
                      </td>
                      <td className="p-md font-label-md text-label-md text-on-surface">{c.referenceName}</td>
                      <td className="whitespace-nowrap p-md text-sm text-on-surface-variant">{formatDateTime(c.createdAt)}</td>
                      <td className="p-md">
                        {c.fileUrl ? (
                          <a
                            href={resolveApiUrl(c.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-xs rounded-lg border border-secondary/50 px-3 py-1.5 font-label-md text-label-md text-secondary hover:bg-secondary-container/30"
                          >
                            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                            Xem PDF
                          </a>
                        ) : (
                          <span className="text-sm text-on-surface-variant">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
