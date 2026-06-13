"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type StoredUser = {
  email?: string;
  username?: string;
  roleName?: string;
};

export default function TopNav() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("currentUser");

    if (!token || !userJson) {
      setCurrentUser(null);
      return;
    }

    try {
      setCurrentUser(JSON.parse(userJson) as StoredUser);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();

    if (trimmed) {
      router.push(`/?keyword=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("jwt");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm">
      <div className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-20 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
            LuxeAuction
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/storefront" className="font-label-md text-label-md text-secondary font-bold border-b-2 border-secondary pb-1">
              Live Auctions
            </Link>
            <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-all">Upcoming</a>
            <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-all">Results</a>
            <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-all">Sell</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant/30 focus-within:border-primary transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search lots..."
              className="bg-transparent border-none outline-none font-body-md text-body-md w-48 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 p-0"
            />
          </form>
          {currentUser ? (
            <>
              <button className="p-2 rounded-full hover:bg-surface-variant/50 transition-all text-on-surface-variant">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <Link href="/watchlist" className="p-2 rounded-full hover:bg-surface-variant/50 transition-all text-on-surface-variant">
                <span className="material-symbols-outlined">favorite</span>
              </Link>
              <Link
                href={currentUser.roleName?.toLowerCase().includes("staff") ? "/staff/withdrawals" : "/dashboard"}
                className="ml-2 flex items-center gap-xs rounded-full border border-outline-variant/30 bg-surface-container-low px-2 py-1 transition-colors hover:bg-surface-container"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-sm font-bold uppercase text-on-primary-container">
                  {(currentUser.username ?? currentUser.email ?? "U").charAt(0)}
                </div>
                <span className="hidden max-w-32 truncate font-label-sm text-label-sm text-on-surface md:block">
                  {currentUser.username ?? currentUser.email}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-lg px-3 py-2 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-error-container/30 hover:text-error md:inline-flex"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <div className="flex items-center gap-xs">
              <Link
                href="/auth"
                className="rounded-lg px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-primary-container/10"
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth?mode=signup"
                className="rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-opacity hover:opacity-90"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
