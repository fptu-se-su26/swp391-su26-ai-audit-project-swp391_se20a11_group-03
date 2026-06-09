"use client";

import { useState } from "react";
import StaffShell from "@/components/layout/StaffShell";

const TICKETS = [
  { id: 1, user: "Alexander Sterling", subject: "Bid lock not released after auction ended", priority: "high" as const, status: "open" as const, created: "Oct 28, 2023", unread: 2 },
  { id: 2, user: "Maria Chen", subject: "Unable to upload provenance documents", priority: "medium" as const, status: "open" as const, created: "Oct 27, 2023", unread: 1 },
  { id: 3, user: "James Harrington", subject: "Payout not received after 7 business days", priority: "high" as const, status: "pending" as const, created: "Oct 26, 2023", unread: 0 },
  { id: 4, user: "Clara Laurent", subject: "Shipping address update request", priority: "low" as const, status: "resolved" as const, created: "Oct 24, 2023", unread: 0 },
];

const PRIORITY_CFG = {
  high: "bg-error-container text-on-error-container",
  medium: "bg-primary-fixed text-on-primary-fixed-variant",
  low: "bg-surface-variant text-on-surface-variant",
};

const STATUS_CFG = {
  open: "bg-secondary-container text-on-secondary-container",
  pending: "bg-secondary-container text-on-secondary-container",
  resolved: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
};

export default function SupportPage() {
  const [selectedId, setSelectedId] = useState(TICKETS[0].id);
  const [reply, setReply] = useState("");

  const ticket = TICKETS.find((t) => t.id === selectedId)!;

  return (
    <StaffShell>
      <div className="flex h-full overflow-hidden">
        {/* Ticket List */}
        <aside className="w-80 border-r border-outline-variant flex flex-col h-full bg-surface-container-low shrink-0">
          <div className="p-md border-b border-outline-variant">
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Support Inbox</h2>
            <div className="mt-sm relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:border-secondary outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {TICKETS.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedId(ticket.id)}
                className={`w-full text-left p-md border-b border-outline-variant/30 hover:bg-surface-container-high transition-colors ${
                  selectedId === ticket.id ? "bg-surface-container-high border-r-2 border-r-secondary" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-xs">
                  <span className="font-label-md text-primary text-sm truncate flex-1">{ticket.user}</span>
                  {ticket.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-[10px] flex items-center justify-center flex-shrink-0">
                      {ticket.unread}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant truncate mb-xs">{ticket.subject}</p>
                <div className="flex gap-xs">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${PRIORITY_CFG[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${STATUS_CFG[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Ticket Detail */}
        <section className="flex-1 flex flex-col h-full overflow-hidden bg-background">
          {/* Ticket Header */}
          <header className="p-md border-b border-outline-variant bg-surface flex justify-between items-start">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary">{ticket.subject}</h3>
              <div className="flex items-center gap-sm mt-xs">
                <span className="font-label-sm text-on-surface-variant text-sm">{ticket.user}</span>
                <span className="text-outline">·</span>
                <span className="font-label-sm text-on-surface-variant text-sm">{ticket.created}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${PRIORITY_CFG[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <button className="px-md py-sm rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm flex items-center gap-xs hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Resolve
              </button>
              <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">more_vert</button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-md space-y-md no-scrollbar">
            {/* User message */}
            <div className="flex items-start gap-md">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-sm mb-xs">
                  <span className="font-label-md text-primary">{ticket.user}</span>
                  <span className="text-[10px] text-outline">{ticket.created}</span>
                </div>
                <div className="bg-surface border border-outline-variant/20 rounded-2xl rounded-tl-none p-md soft-shadow">
                  <p className="font-body-md text-sm text-on-surface">
                    Hello, I placed a bid on Lot #42 and my deposit was locked. The auction has ended but the funds haven&apos;t been released back to my wallet.
                    It has been over 48 hours now. Could you please investigate this?
                  </p>
                </div>
              </div>
            </div>

            {/* Staff reply */}
            <div className="flex items-start gap-md flex-row-reverse">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-sm mb-xs flex-row-reverse">
                  <span className="font-label-md text-primary">Support Staff</span>
                  <span className="text-[10px] text-outline">Oct 29, 2023</span>
                </div>
                <div className="bg-secondary text-on-secondary rounded-2xl rounded-tr-none p-md soft-shadow ml-auto max-w-[80%] glow-accent">
                  <p className="font-body-md text-sm">
                    Thank you for reaching out. We are looking into your case and will escalate to the finance team. You should see the deposit released within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reply Box */}
          <footer className="p-md border-t border-outline-variant bg-surface-container-low">
            <div className="flex items-start gap-md">
              <textarea
                rows={3}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 px-4 py-2.5 bg-surface border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none font-body-md text-sm"
              />
              <button
                onClick={() => setReply("")}
                className="bg-secondary text-on-secondary rounded-xl px-md py-sm font-label-md text-label-md flex items-center gap-xs hover:bg-secondary-fixed-dim transition-colors glow-accent self-end"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                Reply
              </button>
            </div>
          </footer>
        </section>
      </div>
    </StaffShell>
  );
}
