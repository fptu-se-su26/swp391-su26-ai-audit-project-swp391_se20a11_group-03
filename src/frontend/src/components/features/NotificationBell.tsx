"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  AppNotification,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@/lib/services/notificationService";
import { getStoredUser, subscribeStoredUser } from "@/lib/userSession";
import { useTranslations } from "@/i18n/I18nProvider";

function notifIcon(type: AppNotification["type"]) {
  switch (type) {
    case "PRODUCT_APPROVED":
      return "check_circle";
    case "PRODUCT_REJECTED":
      return "cancel";
    case "KYC_APPROVED":
      return "verified";
    case "KYC_REJECTED":
      return "gpp_bad";
    case "OUTBID":
      return "trending_up";
    case "PAYMENT_REQUIRED":
      return "payments";
    default:
      return "notifications";
  }
}

function notifColor(type: AppNotification["type"]) {
  switch (type) {
    case "PRODUCT_APPROVED":
    case "KYC_APPROVED":
      return "text-tertiary";
    case "PRODUCT_REJECTED":
    case "KYC_REJECTED":
      return "text-error";
    default:
      return "text-primary";
  }
}

const MENU_WIDTH = 384;

function computeMenuPosition(anchor: DOMRect, align: "start" | "end") {
  const gap = 8;
  const padding = 16;
  let left = align === "end" ? anchor.right - MENU_WIDTH : anchor.left;
  left = Math.max(padding, Math.min(left, window.innerWidth - MENU_WIDTH - padding));
  return { top: anchor.bottom + gap, left };
}

type NotificationBellProps = {
  className?: string;
  /** "start" for left sidebar; "end" for top-right header items */
  menuAlign?: "start" | "end";
};

export default function NotificationBell({ className = "", menuAlign = "end" }: NotificationBellProps) {
  const router = useRouter();
  const tNav = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [list, setList] = useState<AppNotification[]>([]);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    const sync = () => setHasUser(!!getStoredUser());
    sync();
    return subscribeStoredUser(sync);
  }, []);

  useEffect(() => {
    const loadCount = () => {
      if (document.hidden) return;
      if (!getStoredUser()) {
        setCount(0);
        setList([]);
        return;
      }
      getUnreadCount()
        .then(setCount)
        .catch(() => setCount(0));
    };
    loadCount();
    const interval = setInterval(loadCount, 30_000);
    const onVisible = () => loadCount();
    document.addEventListener("visibilitychange", onVisible);
    const unsubscribe = subscribeStoredUser(loadCount);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      unsubscribe();
    };
  }, []);

  useEffect(() => setMounted(true), []);

  const updateMenuPosition = useCallback(() => {
    if (!buttonRef.current) return;
    setMenuPos(computeMenuPosition(buttonRef.current.getBoundingClientRect(), menuAlign));
  }, [menuAlign]);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const onReflow = () => updateMenuPosition();
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target)) return;
      if ((target as Element).closest?.("[data-notification-menu]")) return;
      setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("keydown", onEscape);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    try {
      const items = await getNotifications();
      setList(items.slice(0, 20));
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const onNotifClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      try {
        await markAsRead(notif.notificationId);
        setList((prev) =>
          prev.map((n) => (n.notificationId === notif.notificationId ? { ...n, isRead: true } : n))
        );
        setCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }
    setOpen(false);
    if (notif.referenceType === "PRODUCT") {
      router.push("/inventory");
    }
  };

  const onMarkAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAllAsRead();
      setList((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setCount(0);
    } catch {
      // ignore
    }
  };

  if (!hasUser) return null;

  const menu = open ? (
    <div
      data-notification-menu
      className="fixed z-[200] w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-surface-variant bg-surface text-on-surface shadow-2xl"
      style={{ top: menuPos.top, left: menuPos.left }}
    >
          <div className="flex items-center justify-between border-b border-surface-variant p-md">
            <h3 className="font-label-lg text-label-lg font-bold">{tNav("notifications")}</h3>
            {count > 0 && (
              <button type="button" onClick={onMarkAll} className="text-xs text-primary hover:underline">
                {tNav("markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-lg">
                <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
              </div>
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center p-lg text-center">
                <span className="material-symbols-outlined mb-sm text-4xl text-on-surface-variant">notifications_none</span>
                <p className="text-sm text-on-surface-variant">{tNav("noNotifications")}</p>
              </div>
            ) : (
              list.map((notif) => (
                <button
                  key={notif.notificationId}
                  type="button"
                  onClick={() => onNotifClick(notif)}
                  className={`flex w-full gap-sm border-b border-surface-variant/50 p-md text-left transition hover:bg-surface-variant/40 ${
                    !notif.isRead ? "bg-secondary-container/20" : ""
                  }`}
                >
                  <span className={`material-symbols-outlined shrink-0 ${notifColor(notif.type)}`}>
                    {notifIcon(notif.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-label-md text-label-md font-semibold">{notif.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-on-surface-variant">{notif.message}</p>
                    <p className="mt-1 text-[10px] text-on-surface-variant/70">
                      {new Date(notif.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  {!notif.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </button>
              ))
            )}
          </div>
    </div>
  ) : null;

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className="relative grid h-10 w-10 place-items-center rounded-full text-inherit transition hover:bg-white/10"
        title={tNav("notifications")}
        aria-label={tNav("notifications")}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">notifications</span>
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {mounted && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
