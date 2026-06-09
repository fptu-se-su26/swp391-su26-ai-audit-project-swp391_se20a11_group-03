"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/staff/approvals", icon: "task_alt", label: "Item Approvals" },
  { href: "/staff/kyc-review", icon: "badge", label: "KYC Document Review" },
  { href: "/staff/support", icon: "support_agent", label: "Support Inbox" },
];

export default function StaffSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-72 fixed left-0 top-0 flex flex-col bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
      <div className="flex flex-col h-full py-lg px-md">
        <div className="mb-xl px-sm">
          <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-primary">LuxeAuction</h1>
          <p className="font-label-md text-label-md text-on-surface-variant">Staff Operations</p>
        </div>

        <div className="flex items-center gap-sm px-sm mb-lg">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container">manage_accounts</span>
          </div>
          <div>
            <span className="font-label-md text-label-md text-on-surface">Staff Member</span>
            <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest">On Duty</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-xs">
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
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-lg border-t border-outline-variant/30 flex flex-col gap-xs">
          <Link href="/auth" className="flex items-center gap-base text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-all px-md py-sm rounded-lg">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
