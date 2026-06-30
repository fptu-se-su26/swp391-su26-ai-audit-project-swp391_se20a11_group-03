"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, getUserInitials, StoredUser, isAdmin } from "@/lib/userSession";
import { ADMIN_HOME } from "@/lib/roleRouting";
import LanguageSwitcher from "@/components/features/LanguageSwitcher";
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

  useEffect(() => setUser(getStoredUser()), []);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    router.push(query.trim() ? `/?keyword=${encodeURIComponent(query.trim())}#live-lots` : "/#live-lots");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 shadow-[0_10px_35px_rgba(15,23,42,.06)] backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center gap-5 px-4 sm:px-6 lg:px-10">
        <BrandLogo className="shrink-0" />

        <nav className="ml-3 hidden h-full items-center gap-7 lg:flex" aria-label="Primary navigation">
          {links.map((href, index) => {
            const label = copy.nav[index];
            const active = pathname === href;
            return <Link key={href} href={href} className={`relative flex h-full items-center text-[13px] font-semibold tracking-wide transition-colors ${active ? "text-[#9a6b13]" : "text-slate-600 hover:text-slate-950"}`}>
              {label}
              {active && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#9a6b13]" />}
            </Link>;
          })}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden min-w-0 max-w-[350px] flex-1 items-center rounded-full border border-slate-200 bg-slate-100/80 px-4 py-2.5 shadow-inner transition focus-within:border-[#d6a84f] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(214,168,79,.16)] md:flex">
          <span className="material-symbols-outlined mr-2 text-[20px] text-slate-500">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400" placeholder={copy.search} aria-label="Search auction lots" />
        </form>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block"><LanguageSwitcher /></div>
          <Link href="/watchlist" className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-[#fff8e6] hover:text-[#9a6b13]" aria-label="Wishlist">
            <span className="material-symbols-outlined text-[21px]">favorite</span>
          </Link>
          <button className="relative grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-[#fff8e6] hover:text-[#9a6b13]" aria-label="Notifications">
            <span className="material-symbols-outlined text-[21px]">notifications</span>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>
          <Link href={user ? (isAdmin(user) ? ADMIN_HOME : "/dashboard") : "/auth"} className="ml-1 grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white shadow-[0_12px_28px_rgba(15,23,42,.18)] transition hover:bg-[#9a6b13]" aria-label={user ? "Open account" : "Sign in"}>
            {user ? getUserInitials(user) : <span className="material-symbols-outlined text-[20px]">person</span>}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="ml-1 grid h-10 w-10 place-items-center rounded-full text-slate-950 transition hover:bg-slate-100 lg:hidden" aria-expanded={menuOpen} aria-label="Toggle menu">
            <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {menuOpen && <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-xl lg:hidden">
        <div className="mb-3 sm:hidden"><LanguageSwitcher /></div>
        <form onSubmit={submitSearch} className="mb-3 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 md:hidden">
          <span className="material-symbols-outlined mr-2 text-[20px] text-slate-500">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder={copy.mobileSearch} />
        </form>
        <nav className="grid gap-1">{links.map((href, index) => <Link onClick={() => setMenuOpen(false)} key={href} href={href} className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-[#fff8e6] hover:text-[#9a6b13]">{copy.nav[index]}</Link>)}</nav>
      </div>}
    </header>
  );
}
