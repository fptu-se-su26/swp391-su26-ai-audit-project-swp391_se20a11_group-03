"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearStoredAuth } from "@/lib/apiClient";
import { useNavigationContext } from "@/lib/NavigationContext";
import { getWatchlistIds, refreshWatchlistIds, subscribeWatchlist } from "@/lib/watchlist";
import {
  StoredUser,
  getStoredUser,
  getUserDisplayName,
  getUserInitials,
  notifyStoredUserChanged,
  subscribeStoredUser,
  isSeller,
} from "@/lib/userSession";
import { getUnreadCount, markAsRead, markAllAsRead, AppNotification } from "@/lib/services/notificationService";
import LanguageSwitcher from "@/components/features/LanguageSwitcher";
import { useI18n, useTranslations } from "@/i18n/I18nProvider";

type NotifTimeFormatter = (dateStr: string) => string;

function buildNotifTimeFormatter(
  t: (key: string, values?: Record<string, string | number>) => string,
  locale: "vi" | "en"
): NotifTimeFormatter {
  return (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return t("justNow");
    if (diffMins < 60) return t("minutesAgo", { minutes: diffMins });
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return t("hoursAgo", { hours: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return t("daysAgo", { days: diffDays });
    return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
      day: "numeric",
      month: "short",
    });
  };
}

function notifIcon(type: string): string {
  switch (type) {
    case "PRODUCT_APPROVED": return "check_circle";
    case "PRODUCT_REJECTED": return "cancel";
    case "AUCTION_STARTING": return "schedule";
    case "AUCTION_ENDING": return "timer";
    case "OUTBID": return "trending_up";
    case "PAYMENT_REQUIRED": return "payments";
    case "KYC_APPROVED": return "verified_user";
    case "KYC_REJECTED": return "gpp_bad";
    case "BID_PLACED": return "gavel";
    default: return "notifications";
  }
}

function notifColor(type: string): string {
  switch (type) {
    case "PRODUCT_APPROVED": return "text-tertiary";
    case "PRODUCT_REJECTED": return "text-error";
    case "OUTBID": return "text-secondary";
    default: return "text-on-surface-variant";
  }
}

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { parentPage } = useNavigationContext();
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { locale } = useI18n();
  const formatNotifTime = useMemo(
    () => buildNotifTimeFormatter(tNav, locale),
    [tNav, locale],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState<AppNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    const syncWatchlist = () => setWatchlistCount(getWatchlistIds().length);

    syncUser();
    syncWatchlist();
    refreshWatchlistIds().then(syncWatchlist);

    const unsubscribeUser = subscribeStoredUser(syncUser);
    const unsubscribeWatchlist = subscribeWatchlist(syncWatchlist);

    return () => {
      unsubscribeUser();
      unsubscribeWatchlist();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  // Load unread count when user logs in
  useEffect(() => {
    if (!currentUser) {
      setNotifCount(0);
      setNotifList([]);
      return;
    }
    getUnreadCount()
      .then(setNotifCount)
      .catch(() => setNotifCount(0));
  }, [currentUser]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    router.push(trimmed ? `/?keyword=${encodeURIComponent(trimmed)}` : "/");
  };

  const handleLogout = () => {
    clearStoredAuth();
    notifyStoredUserChanged();
    refreshWatchlistIds();
    setCurrentUser(null);
    setNotifCount(0);
    setNotifList([]);
    router.push("/");
  };

  const openNotifications = async () => {
    if (notifOpen) {
      setNotifOpen(false);
      return;
    }
    setNotifOpen(true);
    setNotifLoading(true);
    try {
      const { getNotifications } = await import("@/lib/services/notificationService");
      const list = await getNotifications();
      setNotifList(list.slice(0, 20)); // max 20 items
    } catch {
      setNotifList([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleNotifClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      try {
        await markAsRead(notif.notificationId);
        setNotifList((prev) =>
          prev.map((n) => (n.notificationId === notif.notificationId ? { ...n, isRead: true } : n))
        );
        setNotifCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }
    // Navigate based on reference type
    if (notif.referenceType === "PRODUCT" && notif.referenceId) {
      setNotifOpen(false);
      router.push(`/auctions/${notif.referenceId}`);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAllAsRead();
      setNotifList((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setNotifCount(0);
    } catch {
      // ignore
    }
  };

  const displayName = getUserDisplayName(currentUser);
  const initials = getUserInitials(currentUser);
  const userIsSeller = isSeller(currentUser);

  const navItems = [
    { href: "/live", label: tNav("liveAuctions"), active: parentPage === "live" || pathname === "/live" },
    { href: "/upcoming", label: tNav("upcoming"), active: parentPage === "upcoming" },
    { href: "/results", label: tNav("results"), active: parentPage === "results" },
    ...(userIsSeller ? [{ href: "/post-item", label: tNav("postItem"), active: pathname === "/post-item" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-outline-variant/20 bg-surface/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
            {tCommon("appName")}
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`font-label-md text-label-md transition-all ${
                  item.active
                    ? "border-b-2 border-secondary pb-1 font-bold text-secondary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form
            onSubmit={handleSearch}
            className="hidden items-center rounded-full border border-outline-variant/30 bg-surface-container px-4 py-2 transition-colors focus-within:border-primary md:flex"
          >
            <span className="material-symbols-outlined mr-2 text-on-surface-variant">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={tNav("searchPlaceholder")}
              className="w-48 bg-transparent p-0 font-body-md text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 focus:ring-0"
            />
          </form>

          {currentUser ? (
            <>
              <LanguageSwitcher />
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={openNotifications}
                  className="relative rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-variant/50"
                  title={tNav("notifications")}
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {notifCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
                      {notifCount > 99 ? "99+" : notifCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-surface-variant bg-surface shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between p-md border-b border-surface-variant">
                      <h3 className="font-label-lg text-label-lg text-on-surface font-bold">{tNav("notifications")}</h3>
                      {notifCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary hover:underline"
                        >
                          {tNav("markAllRead")}
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifLoading ? (
                        <div className="flex items-center justify-center p-lg">
                          <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
                        </div>
                      ) : notifList.length === 0 ? (
                        <div className="flex flex-col items-center p-lg text-center">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-sm">notifications_none</span>
                          <p className="text-sm text-on-surface-variant">{tNav("noNotifications")}</p>
                        </div>
                      ) : (
                        notifList.map((notif) => (
                          <button
                            key={notif.notificationId}
                            onClick={() => handleNotifClick(notif)}
                            className={`w-full flex gap-sm p-md border-b border-surface-variant/50 hover:bg-surface-variant/30 transition-colors text-left ${
                              !notif.isRead ? "bg-primary-container/20" : ""
                            }`}
                          >
                            <span className={`mt-0.5 flex-shrink-0 material-symbols-outlined text-xl ${notifColor(notif.type)}`}>
                              {notifIcon(notif.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-sm">
                                <p className={`font-label-sm text-label-sm font-bold line-clamp-1 ${!notif.isRead ? "text-on-surface" : "text-on-surface-variant"}`}>
                                  {notif.title}
                                </p>
                                <span className="text-[10px] text-on-surface-variant whitespace-nowrap mt-0.5">
                                  {formatNotifTime(notif.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-on-surface-variant mt-xs line-clamp-2">{notif.message}</p>
                              {!notif.isRead && (
                                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/watchlist" className="relative rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-variant/50">
                <span className="material-symbols-outlined">favorite</span>
                {watchlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[11px] font-bold text-on-secondary">
                    {watchlistCount}
                  </span>
                )}
              </Link>
              <Link
                href={currentUser.roleName?.toLowerCase().includes("staff") ? "/staff/withdrawals" : "/dashboard"}
                className="ml-2 flex items-center gap-xs rounded-full border border-outline-variant/30 bg-surface-container-low px-2 py-1 transition-colors hover:bg-surface-container"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-sm font-bold uppercase text-on-primary-container">
                  {initials}
                </div>
                <span className="hidden max-w-32 truncate font-label-sm text-label-sm text-on-surface md:block">
                  {displayName}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-lg px-3 py-2 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-error-container/30 hover:text-error md:inline-flex"
              >
                {tCommon("logout")}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-xs">
              <LanguageSwitcher />
              <Link
                href="/auth"
                className="rounded-lg px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-primary-container/10"
              >
                {tCommon("login")}
              </Link>
              <Link
                href="/auth?mode=signup"
                className="rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-opacity hover:opacity-90"
              >
                {tCommon("register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
