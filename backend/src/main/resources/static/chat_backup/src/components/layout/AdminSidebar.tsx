"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/revenue", icon: "payments", label: "Revenue & Analytics" },
  { href: "/admin/auction-history", icon: "history_edu", label: "Auction History" },
  { href: "/admin/categories", icon: "category", label: "Categories" },
  { href: "/admin/broadcasts", icon: "campaign", label: "Broadcasts" },
  { href: "/admin/reports", icon: "assessment", label: "Reports" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-80 fixed left-0 top-0 flex flex-col bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
      <div className="flex flex-col h-full py-lg px-md">
        {/* Header */}
        <div className="mb-xl px-sm">
          <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-primary">LuxeAuction</h1>
          <p className="font-label-md text-label-md text-on-surface-variant">Admin Control Center</p>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-sm px-sm mb-lg">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-z1iwi2tB3iSLzXubYanrlgOXXB0y4Og3bMPRT9g2tiWAvNTHUTqJ6jaSEpp_vOxGstCGOGHBxBgrk3NCOXj8aEE-qbr7ZTpUzHXXn2DJRRhepekMD7rcBKlCuw4RTcviRs97ygQvVu_2IJmGkpiMdN5zFTfIPLyo6UNl-ggg-H8pz8oZFyIeAMIGS1AeTLEmXbHORD3uXlhPOf5BRyvielQmQGt3lGOHWKRZHWiqw9acH7xFfHKMd0ixAa9VLo1DBUgXodILB3Pw"
              alt="Admin"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-label-md text-label-md text-on-surface">System Administrator</span>
            <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest">Active Status</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-xs overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-base rounded-lg px-md py-sm transition-all duration-200 ${
                  active
                    ? "bg-primary-container text-on-primary-container shadow-sm"
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="mt-lg px-sm">
          <button className="w-full bg-secondary text-on-secondary font-label-md text-label-md py-md rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-sm">
            <span className="material-symbols-outlined">visibility</span>
            Live Auction Monitor
          </button>
        </div>

        {/* Footer nav */}
        <div className="mt-lg pt-lg border-t border-outline-variant/30 flex flex-col gap-xs">
          <a className="flex items-center gap-base text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all duration-200 px-md py-sm rounded-lg" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">System Settings</span>
          </a>
          <Link href="/auth" className="flex items-center gap-base text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-all duration-200 px-md py-sm rounded-lg">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
