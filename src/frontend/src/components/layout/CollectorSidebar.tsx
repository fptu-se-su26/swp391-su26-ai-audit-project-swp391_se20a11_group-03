"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockUser } from "@/lib/mock-data";
import LiveChat from "@/components/features/LiveChat";

const MY_AUCTIONS = [
  { href: "/dashboard", icon: "account_balance_wallet", label: "My Active Bids", badge: "red" },
  { href: "/messages", icon: "chat", label: "Messages", badge: "3" },
  { href: "/watchlist", icon: "visibility", label: "Watchlist" },
  { href: "/won-items", icon: "history", label: "Won Items / History" },
];

const ACCOUNT_SETTINGS = [
  { href: "/profile", icon: "person", label: "Personal Information" },
  { href: "/security", icon: "shield", label: "Security" },
  { href: "/wallet", icon: "account_balance", label: "My Wallet" },
  { href: "/kyc", icon: "verified_user", label: "KYC Verification" },
];

const SELLER_PORTAL = [
  { href: "/inventory", icon: "inventory_2", label: "My Inventory" },
  { href: "/post-item", icon: "add_circle", label: "Post New Item" },
  { href: "/earnings", icon: "account_balance_wallet", label: "Earnings & Payouts" },
];

export default function CollectorSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const NavLink = ({
    href,
    icon,
    label,
    badge,
  }: {
    href: string;
    icon: string;
    label: string;
    badge?: string;
  }) => {
    const active = isActive(href);
    return (
      <li>
        <Link
          href={href}
          className={`flex items-center justify-between px-4 py-3 transition-colors group ${
            active
              ? "text-primary font-bold border-r-4 border-secondary bg-surface-container-high"
              : "text-on-surface-variant hover:bg-surface-variant"
          }`}
        >
          <div className="flex items-center gap-sm">
            <span
              className={`material-symbols-outlined ${active ? "text-secondary" : "text-outline group-hover:text-primary"} transition-colors`}
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className="font-label-md text-label-md">{label}</span>
          </div>
          {badge === "red" && <span className="w-2 h-2 rounded-full bg-error" />}
          {badge && badge !== "red" && (
            <span className="px-1.5 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-[10px]">
              {badge}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      <nav className="bg-surface-container-low shadow-md h-screen w-64 fixed left-0 top-0 flex flex-col border-r border-outline-variant z-40 hidden md:flex">
        {/* Profile */}
        <div className="p-lg flex flex-col items-center border-b border-outline-variant">
          <div className="w-16 h-16 rounded-full bg-surface-variant overflow-hidden mb-sm soft-shadow">
            <img
              src={mockUser.avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="font-headline-sm text-headline-sm text-primary text-center">{mockUser.name}</h2>
          <p className="font-label-sm text-label-sm text-secondary mt-xs">{mockUser.role}</p>
        </div>

        {/* Nav Links */}
        <div className="flex-1 py-md overflow-y-auto custom-scrollbar">
          <div className="px-4 py-2">
            <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-sm">My Auctions</p>
            <ul className="space-y-1">
              {MY_AUCTIONS.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </ul>
          </div>

          <div className="px-4 py-4">
            <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-sm">Account Settings</p>
            <ul className="space-y-1">
              {ACCOUNT_SETTINGS.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </ul>
          </div>

          <div className="px-4 py-4">
            <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-sm">Seller Portal</p>
            <ul className="space-y-1">
              {SELLER_PORTAL.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-md border-t border-outline-variant">
          <button className="w-full bg-secondary text-on-secondary font-label-md text-label-md py-sm rounded-lg hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-colors glow-accent mb-md">
            Deposit Funds
          </button>
          <ul className="space-y-sm">
            <li>
              <a className="flex items-center gap-sm px-4 py-2 text-on-surface-variant hover:bg-surface-variant transition-colors group rounded-md" href="#">
                <span className="material-symbols-outlined text-outline group-hover:text-primary text-[20px]">help</span>
                <span className="font-label-sm text-label-sm">Help Center</span>
              </a>
            </li>
            <li>
              <a className="flex items-center gap-sm px-4 py-2 text-on-surface-variant hover:bg-surface-variant transition-colors group rounded-md" href="/auth">
                <span className="material-symbols-outlined text-outline group-hover:text-error text-[20px]">logout</span>
                <span className="font-label-sm text-label-sm group-hover:text-error">Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden bg-surface shadow-sm sticky top-0 z-30 px-margin-mobile py-sm flex justify-between items-center">
        <h1 className="font-headline-md text-headline-md text-primary font-bold">LuxeAuction</h1>
        <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden">
          <img src={mockUser.avatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </header>

      <LiveChat />
    </>
  );
}
