"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface RouteItem {
  href: string;
  label: string;
  icon: string;
}

interface RouteGroup {
  title: string;
  icon: string;
  color: string;
  items: RouteItem[];
}

const PORTAL_GROUPS: RouteGroup[] = [
  {
    title: "Collector / Buyer",
    icon: "gavel",
    color: "from-amber-400 to-yellow-600",
    items: [
      { href: "/storefront", label: "Storefront Catalog", icon: "storefront" },
      { href: "/dashboard", label: "Collector Dashboard", icon: "dashboard" },
      { href: "/wallet", label: "My Wallet Balance", icon: "account_balance_wallet" },
      { href: "/watchlist", label: "Personal Watchlist", icon: "visibility" },
      { href: "/won-items", label: "Won Items & History", icon: "history" },
      { href: "/kyc", label: "KYC Upload Verification", icon: "verified_user" },
    ],
  },
  {
    title: "Seller Portal",
    icon: "storefront",
    color: "from-emerald-400 to-teal-600",
    items: [
      { href: "/inventory", label: "My Inventory", icon: "inventory_2" },
      { href: "/post-item", label: "AI Valuation & Post Item", icon: "add_circle" },
      { href: "/earnings", label: "Earnings & Payouts", icon: "payments" },
    ],
  },
  {
    title: "Staff Operations",
    icon: "shield_person",
    color: "from-blue-400 to-indigo-600",
    items: [
      { href: "/staff/approvals", label: "Item Approvals Panel", icon: "task_alt" },
      { href: "/staff/kyc-review", label: "KYC Document Review", icon: "badge" },
      { href: "/staff/support", label: "Support Inbox & Chats", icon: "support_agent" },
    ],
  },
  {
    title: "Admin Control Center",
    icon: "admin_panel_settings",
    color: "from-rose-400 to-red-600",
    items: [
      { href: "/admin/revenue", label: "Revenue & Analytics", icon: "monitoring" },
      { href: "/admin/auction-history", label: "Global Auction History", icon: "history_edu" },
      { href: "/admin/categories", label: "Categories Management", icon: "category" },
      { href: "/admin/broadcasts", label: "System Broadcasts", icon: "campaign" },
      { href: "/admin/reports", label: "Reports & Analytics Export", icon: "assessment" },
    ],
  },
  {
    title: "Gateway Pages",
    icon: "login",
    color: "from-purple-400 to-fuchsia-600",
    items: [
      { href: "/auth", label: "Auth Lobby (Login/Signup)", icon: "login" },
      { href: "/auth/onboarding", label: "Role Selector Onboarding", icon: "manage_accounts" },
    ],
  },
];

export default function PortalSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("All");
  const pathname = usePathname();

  const handleToggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-body-md select-none">
      {/* Glow effect behind trigger button when closed */}
      {!isOpen && (
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse pointer-events-none" />
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={handleToggle}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform active:scale-95 border ${
          isOpen
            ? "bg-slate-900 border-white/20 text-white rotate-90"
            : "bg-gradient-to-r from-slate-900 to-slate-800 border-amber-300/30 text-amber-300 hover:scale-105"
        }`}
        title="Open Portal Navigator"
      >
        <span className="material-symbols-outlined text-[26px]">
          {isOpen ? "close" : "hub"}
        </span>
      </button>

      {/* Main Panel */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-[92vw] sm:w-[480px] max-h-[75vh] flex flex-col bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
          style={{ zIndex: 9999 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold font-label-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-amber-300 text-[18px]">explore</span>
                Prototype Navigator
              </h3>
              <p className="text-[10px] text-slate-400 font-label-sm mt-0.5">Bypass login restrictions and access all modules instantly</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-amber-400/10 text-amber-300 rounded-full font-mono uppercase tracking-wider font-bold">
              Debug Mode
            </span>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex bg-slate-900/60 p-2 border-b border-white/5 gap-1 overflow-x-auto scrollbar-none shrink-0">
            {["All", "Collector", "Seller", "Staff", "Admin"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-[11px] font-label-md rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-amber-400/20 text-amber-300 border border-amber-300/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Links Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-[250px]">
            {PORTAL_GROUPS.filter((group) => {
              if (activeTab === "All") return true;
              if (activeTab === "Collector" && group.title.includes("Collector")) return true;
              if (activeTab === "Seller" && group.title.includes("Seller")) return true;
              if (activeTab === "Staff" && group.title.includes("Staff")) return true;
              if (activeTab === "Admin" && group.title.includes("Admin")) return true;
              return false;
            }).map((group) => (
              <div key={group.title} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">{group.icon}</span>
                  <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{group.title}</h4>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all duration-200 group/item ${
                          active
                            ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
                            : "bg-white/5 border-transparent text-slate-300 hover:bg-white/10 hover:border-white/10 hover:text-white"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110 ${
                            active
                              ? "bg-amber-400/20 text-amber-300"
                              : "bg-slate-900 text-slate-400 group-hover/item:text-slate-200"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold font-label-md truncate">{item.label}</p>
                          <p className="text-[9px] text-slate-500 font-mono truncate">{item.href}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="bg-slate-950 p-3 border-t border-white/10 text-center text-[10px] text-slate-500 font-label-sm shrink-0 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Click any module to simulate live portal swapping without credentials.</span>
          </div>
        </div>
      )}
    </div>
  );
}
