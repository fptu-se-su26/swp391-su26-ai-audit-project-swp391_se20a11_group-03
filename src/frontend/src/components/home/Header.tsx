"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, getUserInitials, StoredUser, isAdmin } from "@/lib/userSession";
import { ADMIN_HOME } from "@/lib/roleRouting";
import LanguageSwitcher from "@/components/features/LanguageSwitcher";
import { useLuxuryHomeCopy } from "./useLuxuryHomeCopy";

const links = ["/live", "/upcoming", "/results", "/sell"];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const copy = useLuxuryHomeCopy();

  useEffect(() => setUser(getStoredUser()), []);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    router.push(query.trim() ? `/?keyword=${encodeURIComponent(query.trim())}#live-lots` : "/#live-lots");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#d8c69b]/30 bg-[#fffdf8]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center gap-5 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="LuxeAuction home">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[#b9974f] bg-[#071626] font-display-lg text-[13px] font-bold tracking-[0.12em] text-[#f3d791] shadow-[0_8px_24px_rgba(7,22,38,.2)] transition-transform group-hover:rotate-6">LA</span>
          <span className="hidden font-display-lg text-[20px] font-semibold tracking-[-0.04em] text-[#071626] sm:block">LuxeAuction</span>
        </Link>

        <nav className="ml-3 hidden h-full items-center gap-7 lg:flex" aria-label="Primary navigation">
          {links.map((href, index) => {
            const label = copy.nav[index];
            const active = pathname === href;
            return <Link key={href} href={href} className={`relative flex h-full items-center text-[13px] font-semibold tracking-wide transition-colors ${active ? "text-[#9a7429]" : "text-[#344253] hover:text-[#9a7429]"}`}>
              {label}
              {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#b9974f]" />}
            </Link>;
          })}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden min-w-0 max-w-[330px] flex-1 items-center rounded-full border border-[#d8d3c9] bg-white px-4 py-2.5 shadow-sm transition focus-within:border-[#b9974f] focus-within:shadow-[0_0_0_3px_rgba(185,151,79,.12)] md:flex">
          <span className="material-symbols-outlined mr-2 text-[20px] text-[#7b7f84]">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-[#071626] outline-none placeholder:text-[#8b8e91]" placeholder={copy.search} aria-label="Search auction lots" />
        </form>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block"><LanguageSwitcher /></div>
          <Link href="/watchlist" className="relative grid h-10 w-10 place-items-center rounded-full text-[#344253] transition hover:bg-[#f3eee3] hover:text-[#9a7429]" aria-label="Wishlist">
            <span className="material-symbols-outlined text-[21px]">favorite</span>
          </Link>
          <button className="relative grid h-10 w-10 place-items-center rounded-full text-[#344253] transition hover:bg-[#f3eee3] hover:text-[#9a7429]" aria-label="Notifications">
            <span className="material-symbols-outlined text-[21px]">notifications</span>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#b3342d]" />
          </button>
          <Link href={user ? (isAdmin(user) ? ADMIN_HOME : "/dashboard") : "/auth"} className="ml-1 grid h-10 w-10 place-items-center rounded-full border border-[#c9b175] bg-[#071626] text-xs font-bold text-[#f3d791] shadow-sm" aria-label={user ? "Open account" : "Sign in"}>
            {user ? getUserInitials(user) : <span className="material-symbols-outlined text-[20px]">person</span>}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="ml-1 grid h-10 w-10 place-items-center rounded-full text-[#071626] lg:hidden" aria-expanded={menuOpen} aria-label="Toggle menu">
            <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {menuOpen && <div className="border-t border-[#e7e1d5] bg-[#fffdf8] px-4 py-4 lg:hidden">
        <div className="mb-3 sm:hidden"><LanguageSwitcher /></div>
        <form onSubmit={submitSearch} className="mb-3 flex items-center rounded-xl border border-[#d8d3c9] bg-white px-3 py-2.5 md:hidden">
          <span className="material-symbols-outlined mr-2 text-[20px] text-[#7b7f84]">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder={copy.mobileSearch} />
        </form>
        <nav className="grid gap-1">{links.map((href, index) => <Link onClick={() => setMenuOpen(false)} key={href} href={href} className="rounded-xl px-3 py-3 text-sm font-semibold text-[#273648] hover:bg-[#f3eee3]">{copy.nav[index]}</Link>)}</nav>
      </div>}
    </header>
  );
}
