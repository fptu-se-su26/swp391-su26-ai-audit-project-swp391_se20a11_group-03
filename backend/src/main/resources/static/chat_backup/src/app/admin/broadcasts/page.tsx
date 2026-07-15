"use client";

import { useState } from "react";
import AdminShell from "@/components/layout/AdminShell";

const SENT_BROADCASTS = [
  { id: 1, title: "Heritage Collection Auction — Nov 1st", audience: "All Users", sent: "Oct 20, 2023", type: "Event" },
  { id: 2, title: "New KYC Requirements Effective Dec 1", audience: "Sellers", sent: "Oct 15, 2023", type: "Compliance" },
  { id: 3, title: "Platform Maintenance Window — Oct 30", audience: "All Users", sent: "Oct 12, 2023", type: "System" },
];

const TYPE_BADGE: Record<string, string> = {
  Event: "bg-secondary-container text-on-secondary-container",
  Compliance: "bg-primary-fixed text-on-primary-fixed-variant",
  System: "bg-surface-container-high text-on-surface",
};

export default function BroadcastsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("All Users");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!title.trim() || !body.trim()) return;
    setSent(true);
    setTitle("");
    setBody("");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <AdminShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">System Broadcasts</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">Send platform-wide announcements to collectors, sellers, and staff.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
          {/* Compose */}
          <div className="xl:col-span-2 bg-surface rounded-xl p-lg soft-shadow border border-surface-variant space-y-md">
            <h2 className="font-headline-sm text-headline-sm text-primary border-b border-surface-variant pb-sm">Compose Broadcast</h2>

            {sent && (
              <div className="p-md bg-tertiary-fixed/20 border border-tertiary-fixed-dim/30 rounded-lg flex items-center gap-sm">
                <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-label-md text-on-tertiary-container">Broadcast sent successfully.</span>
              </div>
            )}

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Heritage Collection Preview Now Live"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Message</label>
              <textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your broadcast message here..."
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low outline-none focus:border-secondary appearance-none"
                >
                  <option>All Users</option>
                  <option>Collectors Only</option>
                  <option>Sellers Only</option>
                  <option>Staff Only</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Send Via</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low outline-none focus:border-secondary appearance-none">
                  <option>In-App Notification</option>
                  <option>Email + In-App</option>
                  <option>Email Only</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSend}
              className="w-full bg-secondary text-on-secondary py-md rounded-xl font-headline-sm glow-accent hover:bg-secondary-fixed-dim transition-all flex items-center justify-center gap-sm"
            >
              <span className="material-symbols-outlined">campaign</span>
              Send Broadcast
            </button>
          </div>

          {/* Audience Stats */}
          <div className="space-y-md">
            <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-md">Audience Breakdown</h3>
              {[
                { label: "All Users", count: "8,420" },
                { label: "Collectors", count: "6,180" },
                { label: "Sellers", count: "1,840" },
                { label: "Staff", count: "400" },
              ].map((a) => (
                <div key={a.label} className="flex justify-between items-center py-sm border-b border-surface-variant last:border-0">
                  <span className="font-body-md text-on-surface-variant">{a.label}</span>
                  <span className="font-bold text-primary">{a.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sent Broadcasts */}
        <section>
          <h2 className="font-headline-sm text-headline-sm text-primary border-b border-surface-variant pb-xs mb-md">Sent Broadcasts</h2>
          <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-variant">
                  {["Title", "Audience", "Type", "Sent", "Actions"].map((h) => (
                    <th key={h} className="p-md font-label-sm text-label-sm text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SENT_BROADCASTS.map((b) => (
                  <tr key={b.id} className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
                    <td className="p-md font-label-md text-label-md text-on-surface">{b.title}</td>
                    <td className="p-md font-body-md text-sm text-on-surface-variant">{b.audience}</td>
                    <td className="p-md">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${TYPE_BADGE[b.type]}`}>{b.type}</span>
                    </td>
                    <td className="p-md font-body-md text-sm text-on-surface-variant">{b.sent}</td>
                    <td className="p-md">
                      <button className="text-secondary font-label-sm hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
