"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { FiChevronDown, FiGrid, FiLogOut, FiUser } from "react-icons/fi";
import { useTranslations } from "next-intl";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import {
  ApiError,
  AUTH_STATE_EVENT,
  authApi,
  getToken,
  toFrontendRole,
  userApi,
  type UserProfile,
} from "@/lib/api";
import { NAV_LINKS } from "@/lib/home-data";
import { useApiData } from "@/lib/use-api-data";

const ROLE_HOME = {
  collector: "/dashboard",
  seller: "/inventory",
  staff: "/staff/approvals",
  admin: "/admin/dashboard",
  shipper: "/shipper/orders",
} as const;

const ROLE_LABEL = {
  collector: "Người mua",
  seller: "Người bán",
  staff: "Nhân viên",
  admin: "Quản trị viên",
  shipper: "Nhân viên giao hàng",
} as const;

function subscribeToAuthState(onStoreChange: () => void) {
  window.addEventListener(AUTH_STATE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(AUTH_STATE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function hasStoredToken() {
  return Boolean(getToken());
}

export default function Header() {
  const t = useTranslations("header");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const isLoggedIn = useSyncExternalStore(
    subscribeToAuthState,
    hasStoredToken,
    () => false,
  );
  const loadProfile = useCallback(async () => {
    if (!isLoggedIn) return null;

    try {
      const response = await userApi.profile();
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        authApi.logout();
        return null;
      }
      throw error;
    }
  }, [isLoggedIn]);
  const { data: profile } = useApiData<UserProfile | null>(loadProfile, null);
  const role = toFrontendRole(profile?.roleName ?? null);
  const accountName = profile?.fullName || t("roles.collector");
  const initials = accountName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (!accountMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  function handleLogout() {
    setAccountMenuOpen(false);
    authApi.logout();
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="site-header sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-md">
      <div className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 sm:min-h-20 sm:px-6 lg:px-12">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="BidZone"
        >
          <BidZoneLogo priority className="h-10 w-auto sm:h-14" />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-14 text-xs font-medium tracking-widest text-white/80 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              prefetch={link.href === "/storefront" ? false : undefined}
              onClick={(event) => {
                if (
                  link.href !== "/storefront" ||
                  event.ctrlKey ||
                  event.metaKey ||
                  event.shiftKey ||
                  event.altKey
                ) {
                  return;
                }

                event.preventDefault();
                window.location.assign("/storefront");
              }}
              className="transition-colors hover:text-[#f0c982]"
            >
              {tNav(link.key as Parameters<typeof tNav>[0])}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-3">
          <LanguageSwitcher compactOnMobile />
          <ThemeToggle />
          {isLoggedIn ? (
            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((current) => !current)}
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                aria-label={t("openAccountMenu")}
                className="flex h-11 min-w-11 items-center gap-2 rounded-lg border border-transparent px-1.5 text-left transition-colors hover:border-white/10 hover:bg-white/5 sm:min-w-44 sm:px-2"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d7aa63]/70 bg-[#d7aa63]/10 text-[11px] font-bold text-[#f0c982]">
                  {initials || "?"}
                </span>
                <span className="hidden min-w-0 flex-1 sm:block">
                  <span className="block truncate text-xs font-semibold text-white">
                    {accountName}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-white/45">
                    {t(`roles.${role}`)}
                  </span>
                </span>
                <FiChevronDown
                  aria-hidden="true"
                  className={`hidden h-4 w-4 text-white/40 transition-transform sm:block ${
                    accountMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {accountMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] w-60 overflow-hidden rounded-lg border border-white/10 bg-[#111] py-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
                >
                  <div className="border-b border-white/10 px-4 py-3 sm:hidden">
                    <p className="truncate text-sm font-semibold">{accountName}</p>
                    <p className="mt-0.5 text-xs text-white/45">
                      {t(`roles.${role}`)}
                    </p>
                  </div>
                  <Link
                    href={ROLE_HOME[role]}
                    role="menuitem"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <FiGrid className="h-5 w-5 text-[#f0c982]" aria-hidden="true" />
                    {t("dashboard")}
                  </Link>
                  {role === "collector" || role === "seller" ? (
                    <Link
                      href="/profile"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <FiUser className="h-5 w-5 text-white/45" aria-hidden="true" />
                      {t("profile")}
                    </Link>
                  ) : null}
                  <div className="my-1 border-t border-white/10" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10"
                  >
                    <FiLogOut className="h-5 w-5" aria-hidden="true" />
                    {t("logout")}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                href="/auth"
                className="hidden rounded-full border border-[#d7aa63]/50 px-4 py-2.5 text-xs font-semibold tracking-wider text-white transition-colors hover:bg-white/10 md:inline-block"
              >
                {t("login")}
              </Link>
              <Link
                href="/auth"
                className="rounded-full bg-[#f0c982] px-3 py-2.5 text-[11px] font-semibold tracking-wider text-black transition-colors hover:bg-[#f4d79b] sm:px-5 sm:text-xs"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
