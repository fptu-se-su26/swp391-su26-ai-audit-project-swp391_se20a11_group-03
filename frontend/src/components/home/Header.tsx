"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, getUserInitials, StoredUser, isAdmin, subscribeStoredUser } from "@/lib/userSession";
import { ADMIN_HOME } from "@/lib/roleRouting";
import LanguageSwitcher from "@/components/features/LanguageSwitcher";
import NotificationBell from "@/components/features/NotificationBell";
import BrandLogo from "@/components/ui/BrandLogo";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";

const links = ["/live", "/upcoming", "/results", "/sell"];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const copy = useLuxuryHomeCopy();

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    return subscribeStoredUser(sync);
  }, []);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    router.push(query.trim() ? `/browse?keyword=${encodeURIComponent(query.trim())}#live-lots` : "/browse#live-lots");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060606]/88 shadow-[0_10px_35px_rgba(0,0,0,.4)] backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center gap-5 px-4 sm:px-6 lg:px-10">
        <BrandLogo className="shrink-0" inverted />

        <nav className="ml-3 hidden h-full items-center gap-7 lg:flex" aria-label="Primary navigation">
          {links.map((href, index) => {
            const label = copy.nav[index];
            const active = pathname === href;
            return <Link key={href} href={href} className={`relative flex h-full items-center text-[13px] font-semibold uppercase tracking-[0.1em] transition-colors ${active ? "text-[#d4aa61]" : "text-[#e6ded2] hover:text-[#d4aa61]"}`}>
              {label}
              {active && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#d4aa61]" />}
            </Link>;
          })}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden min-w-0 max-w-[350px] flex-1 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 transition focus-within:border-[#d4aa61]/70 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_0_4px_rgba(212,170,97,.14)] md:flex">
          <span className="material-symbols-outlined mr-2 text-[20px] text-[#9d948a]">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-[#f5ead9] outline-none placeholder:text-[#6f675e]" placeholder={copy.search} aria-label="Search auction lots" />
        </form>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block"><LanguageSwitcher /></div>
          <Link href="/watchlist" className="relative grid h-10 w-10 place-items-center rounded-full text-[#e6ded2] transition hover:bg-white/[0.06] hover:text-[#d4aa61]" aria-label="Wishlist">
            <span className="material-symbols-outlined text-[21px]">favorite</span>
          </Link>
          <NotificationBell
            className="text-[#e6ded2] [&_button]:hover:bg-white/[0.06] [&_button]:hover:text-[#d4aa61] [&_.material-symbols-outlined]:text-[21px]"
            menuAlign="end"
          />
          <Link href={user ? (isAdmin(user) ? ADMIN_HOME : "/dashboard") : "/auth"} className="ml-1 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] text-xs font-bold text-[#100d08] shadow-[0_12px_28px_rgba(201,154,75,.28)] transition hover:brightness-110" aria-label={user ? "Open account" : "Sign in"}>
            {user ? getUserInitials(user) : <span className="material-symbols-outlined text-[20px]">person</span>}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="ml-1 grid h-10 w-10 place-items-center rounded-full text-[#f5ead9] transition hover:bg-white/[0.06] lg:hidden" aria-expanded={menuOpen} aria-label="Toggle menu">
            <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {menuOpen && <div className="border-t border-white/10 bg-[#0b0b0a] px-4 py-4 shadow-xl lg:hidden">
        <div className="mb-3 sm:hidden"><LanguageSwitcher /></div>
        <form onSubmit={submitSearch} className="mb-3 flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 md:hidden">
          <span className="material-symbols-outlined mr-2 text-[20px] text-[#9d948a]">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-[#f5ead9] outline-none placeholder:text-[#6f675e]" placeholder={copy.mobileSearch} />
        </form>
        <nav className="grid gap-1">{links.map((href, index) => <Link onClick={() => setMenuOpen(false)} key={href} href={href} className="rounded-xl px-3 py-3 text-sm font-semibold text-[#e6ded2] hover:bg-white/[0.06] hover:text-[#d4aa61]">{copy.nav[index]}</Link>)}</nav>
      </div>}
    </header>
  );
}
