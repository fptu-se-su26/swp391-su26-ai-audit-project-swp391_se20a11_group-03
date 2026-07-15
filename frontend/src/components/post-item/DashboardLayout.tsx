"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import NotificationBell from "@/components/features/NotificationBell";
import BrandLogo from "@/components/ui/BrandLogo";
import {
  StoredUser,
  getStoredUser,
  isAdmin,
  isSeller,
  subscribeStoredUser,
} from "@/lib/userSession";
import { ADMIN_HOME } from "@/lib/roleRouting";
import { useTranslations } from "@/i18n/I18nProvider";

type MobileLink = readonly [href: string, label: string];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const tSidebar = useTranslations("sidebar");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  const collectorLinks = useMemo(
    (): MobileLink[] =>
      [
        ["/dashboard", tCommon("dashboard")],
        ["/messages", tSidebar("messages")],
        ["/watchlist", tSidebar("watchlist")],
        ["/wallet", tSidebar("myWallet")],
        ["/profile", tSidebar("accountSettings")],
      ],
    [tSidebar, tCommon],
  );

  const sellerLinks = useMemo(
    (): MobileLink[] =>
      [
        ["/post-item", tSidebar("postNewItem")],
        ["/inventory", tSidebar("myAuctions")],
      ],
    [tSidebar],
  );

  const showSellerPortal = isSeller(user) || isAdmin(user);

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    return subscribeStoredUser(sync);
  }, []);

  useEffect(() => {
    if (user && isAdmin(user)) {
      router.replace(ADMIN_HOME);
    }
  }, [router, user]);

  const mobileLinkClass = (href: string) =>
    `rounded-xl px-3 py-3 ${
      href === "/post-item" ? "bg-[#c4a356]/20 text-[#e6cb82]" : "bg-white/[.04]"
    }`;

  return (
    <div className="luxe-app min-h-screen text-[#f5ead9]">
      <Sidebar />
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0b0b0a]/90 px-4 shadow-sm backdrop-blur md:hidden">
        <BrandLogo compact={false} inverted />
        <div className="flex items-center gap-1">
          <NotificationBell className="text-[#cdd7e1]" />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white"
            aria-label="Toggle dashboard menu"
          >
            <span className="material-symbols-outlined">{mobileOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </header>
      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 z-30 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-white/10 bg-[#071626] p-4 shadow-xl md:hidden">
          <p className="mb-2 text-[9px] font-black uppercase tracking-[.24em] text-[#71879a]">
            {tSidebar("yourSpace")}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#c1cbd3]">
            {collectorLinks.map(([href, label]) => (
              <Link
                onClick={() => setMobileOpen(false)}
                href={href}
                key={href}
                className={mobileLinkClass(href)}
              >
                {label}
              </Link>
            ))}
          </div>
          {showSellerPortal && (
            <>
              <p className="mb-2 mt-4 text-[9px] font-black uppercase tracking-[.24em] text-[#71879a]">
                {tSidebar("sellerPortal")}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#c1cbd3]">
                {sellerLinks.map(([href, label]) => (
                  <Link
                    onClick={() => setMobileOpen(false)}
                    href={href}
                    key={href}
                    className={mobileLinkClass(href)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <main className="relative min-h-screen overflow-hidden md:ml-[280px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_10%,rgba(212,170,97,.12),transparent_27%),radial-gradient(circle_at_16%_88%,rgba(212,170,97,.08),transparent_30%),linear-gradient(180deg,#070706_0%,#0b0b0a_45%,#070706_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[.04] [background-image:linear-gradient(#d4aa61_1px,transparent_1px),linear-gradient(90deg,#d4aa61_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[#d2ad55]/10 blur-3xl" />
        <div className="relative">{children}</div>
      </main>
    </div>
  );
}
