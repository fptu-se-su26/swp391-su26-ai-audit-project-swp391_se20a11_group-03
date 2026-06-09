"use client";

import { useState } from "react";
import { mockStaffApprovals } from "@/lib/mock-data";
import StaffShell from "@/components/layout/StaffShell";

type Status = "pending" | "review" | "approved" | "rejected";

const STATUS_CFG: Record<Status, { label: string; class: string }> = {
  pending: { label: "Pending", class: "bg-secondary-container text-on-secondary-container" },
  review: { label: "Under Review", class: "bg-primary-fixed text-on-primary-fixed-variant" },
  approved: { label: "Approved", class: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  rejected: { label: "Rejected", class: "bg-error-container text-on-error-container" },
};

export default function ApprovalsPage() {
  const [items, setItems] = useState(
    mockStaffApprovals.map((a) => ({ ...a, status: a.status as Status }))
  );

  const updateStatus = (id: number, status: Status) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  return (
    <StaffShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">Lot Approvals</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">Review and approve seller submissions before they go live.</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-md">
          {[
            { label: "Awaiting Review", value: items.filter((i) => i.status === "pending").length, color: "secondary" },
            { label: "Under Review", value: items.filter((i) => i.status === "review").length, color: "primary" },
            { label: "Approved Today", value: items.filter((i) => i.status === "approved").length, color: "tertiary" },
          ].map((s) => (
            <div key={s.label} className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant text-center">
              <p className="font-headline-md text-[32px] font-bold text-primary">{s.value}</p>
              <p className="font-label-md text-label-md text-on-surface-variant mt-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-variant">
                {["Item Title", "Seller", "Category", "Est. Value", "Submitted", "Status", "Actions"].map((h) => (
                  <th key={h} className="p-md font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const cfg = STATUS_CFG[item.status];
                return (
                  <tr key={item.id} className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                    <td className="p-md font-label-md text-label-md text-on-surface">{item.title}</td>
                    <td className="p-md font-body-md text-sm text-on-surface-variant">{item.seller}</td>
                    <td className="p-md font-body-md text-sm text-on-surface-variant">{item.category}</td>
                    <td className="p-md font-bold text-primary">{item.estimatedValue}</td>
                    <td className="p-md font-body-md text-sm text-on-surface-variant whitespace-nowrap">{item.submitted}</td>
                    <td className="p-md">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.class}`}>{cfg.label}</span>
                    </td>
                    <td className="p-md">
                      <div className="flex items-center gap-xs">
                        <button
                          onClick={() => updateStatus(item.id, "approved")}
                          className="px-3 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-[10px] uppercase font-bold hover:opacity-80 transition-opacity"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "rejected")}
                          className="px-3 py-1 rounded bg-error-container text-on-error-container font-label-sm text-[10px] uppercase font-bold hover:opacity-80 transition-opacity"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "review")}
                          className="px-3 py-1 rounded border border-outline-variant text-on-surface font-label-sm text-[10px] uppercase font-bold hover:bg-surface-container-low transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </StaffShell>
  );
}
