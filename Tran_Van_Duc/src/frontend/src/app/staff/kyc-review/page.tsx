"use client";

import { useState } from "react";
import StaffShell from "@/components/layout/StaffShell";

const SUBMISSIONS = [
  { id: 1, name: "Alexander Sterling", email: "a.sterling@luxecollect.com", submitted: "Oct 28, 2023", docs: ["Government ID", "Proof of Address"], status: "pending" as const },
  { id: 2, name: "Maria Chen", email: "m.chen@fineart.hk", submitted: "Oct 27, 2023", docs: ["Government ID", "Proof of Address"], status: "pending" as const },
  { id: 3, name: "Viktor Petrov", email: "v.petrov@automotive.ru", submitted: "Oct 25, 2023", docs: ["Government ID"], status: "info_required" as const },
];

type Status = "pending" | "approved" | "rejected" | "info_required";

const STATUS_CFG: Record<Status, { label: string; class: string }> = {
  pending: { label: "Pending", class: "bg-secondary-container text-on-secondary-container" },
  approved: { label: "Approved", class: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  rejected: { label: "Rejected", class: "bg-error-container text-on-error-container" },
  info_required: { label: "Info Required", class: "bg-primary-fixed text-on-primary-fixed-variant" },
};

export default function KYCReviewPage() {
  const [selected, setSelected] = useState(SUBMISSIONS[0].id);
  const [statuses, setStatuses] = useState<Record<number, Status>>(
    Object.fromEntries(SUBMISSIONS.map((s) => [s.id, s.status]))
  );

  const activeUser = SUBMISSIONS.find((s) => s.id === selected)!;
  const activeStatus = statuses[selected];

  return (
    <StaffShell>
      <div className="flex h-full">
        {/* Left: Submission List */}
        <aside className="w-72 border-r border-outline-variant flex flex-col h-full bg-surface-container-low shrink-0">
          <div className="p-md border-b border-outline-variant">
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">KYC Queue</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">{SUBMISSIONS.length} pending reviews</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {SUBMISSIONS.map((sub) => {
              const cfg = STATUS_CFG[statuses[sub.id]];
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelected(sub.id)}
                  className={`w-full text-left p-md border-b border-outline-variant/30 hover:bg-surface-container-high transition-colors ${
                    selected === sub.id ? "bg-surface-container-high border-r-2 border-r-secondary" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-xs">
                    <span className="font-label-md text-primary">{sub.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${cfg.class}`}>{cfg.label}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{sub.submitted}</p>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: Document Review */}
        <section className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop space-y-lg bg-background">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-display-lg-mobile md:font-headline-md text-primary">KYC Review — {activeUser.name}</h1>
              <p className="font-label-md text-label-md text-on-surface-variant mt-xs">{activeUser.email} · Submitted {activeUser.submitted}</p>
            </div>
            <span className={`px-3 py-1 rounded-full font-label-sm text-[10px] uppercase font-bold ${STATUS_CFG[activeStatus].class}`}>
              {STATUS_CFG[activeStatus].label}
            </span>
          </div>

          {/* Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {["Government ID", "Proof of Address"].map((doc) => (
              <div key={doc} className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant space-y-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-sm text-headline-sm text-primary">{doc}</h3>
                  {activeUser.docs.includes(doc) ? (
                    <span className="flex items-center gap-1 text-secondary font-label-sm text-[10px] uppercase font-bold">
                      <span className="material-symbols-outlined text-[14px]">attach_file</span>
                      Uploaded
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-error font-label-sm text-[10px] uppercase font-bold">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Missing
                    </span>
                  )}
                </div>
                {activeUser.docs.includes(doc) ? (
                  <div className="bg-surface-container-low border border-surface-variant rounded-xl aspect-video flex items-center justify-center">
                    <div className="text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[48px]">image</span>
                      <p className="font-label-sm text-label-sm mt-xs">{doc.toLowerCase().replace(/ /g, "_")}_document.jpg</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-error-container/10 border border-error/20 rounded-xl aspect-video flex items-center justify-center">
                    <p className="font-label-md text-error text-center">Document not provided</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Staff Notes */}
          <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
            <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">Review Notes</h3>
            <textarea
              rows={4}
              placeholder="Add internal review notes (not visible to user)..."
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-sm">
            <button
              onClick={() => setStatuses((p) => ({ ...p, [selected]: "approved" }))}
              className="flex-1 md:flex-none px-lg py-md rounded-xl bg-tertiary-fixed text-on-tertiary-fixed-variant font-headline-sm flex items-center justify-center gap-sm hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined">check_circle</span>
              Approve KYC
            </button>
            <button
              onClick={() => setStatuses((p) => ({ ...p, [selected]: "info_required" }))}
              className="flex-1 md:flex-none px-lg py-md rounded-xl border border-secondary text-secondary font-headline-sm flex items-center justify-center gap-sm hover:bg-secondary/10 transition-colors"
            >
              <span className="material-symbols-outlined">help</span>
              Request Info
            </button>
            <button
              onClick={() => setStatuses((p) => ({ ...p, [selected]: "rejected" }))}
              className="flex-1 md:flex-none px-lg py-md rounded-xl bg-error-container text-on-error-container font-headline-sm flex items-center justify-center gap-sm hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined">cancel</span>
              Reject
            </button>
          </div>
        </section>
      </div>
    </StaffShell>
  );
}
