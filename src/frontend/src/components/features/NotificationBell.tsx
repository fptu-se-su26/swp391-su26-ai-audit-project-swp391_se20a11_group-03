"use client";

import { useEffect, useRef, useState } from "react";
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

export default function NotificationBell({ className = "" }: { className?: string }) {
  const router = useRouter();
  const tNav = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [list, setList] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const [hasUser, setHasUser] = useState(() => !!getStoredUser());

  useEffect(() => {
    const sync = () => setHasUser(!!getStoredUser());
    sync();
    return subscribeStoredUser(sync);
  }, []);

  useEffect(() => {
    const loadCount = () => {
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
    return subscribeStoredUser(loadCount);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
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

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={toggle}
        className="relative grid h-10 w-10 place-items-center rounded-full text-inherit transition hover:bg-white/10"
        title={tNav("notifications")}
        aria-label={tNav("notifications")}
      >
        <span className="material-symbols-outlined">notifications</span>
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-surface-variant bg-surface text-on-surface shadow-2xl">
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
      )}
    </div>
  );
}
