"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  defaultLocale,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  locales,
  type Locale,
} from "./config";
import { createTranslator } from "./translator";

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  try {
    const fromStorage = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (fromStorage && (locales as readonly string[]).includes(fromStorage)) {
      return fromStorage as Locale;
    }
  } catch {
    // ignore (e.g. disabled storage)
  }
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`));
  if (cookie) {
    const value = cookie.substring(LOCALE_COOKIE.length + 1);
    if ((locales as readonly string[]).includes(value)) {
      return value as Locale;
    }
  }
  return defaultLocale;
}

function persistLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    setLocaleState(readInitialLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const t = createTranslator(locale);
    return { locale, setLocale, t };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    const t = createTranslator(defaultLocale);
    return { locale: defaultLocale, setLocale: () => undefined, t };
  }
  return ctx;
}

export function useTranslations(namespace: string) {
  const { t } = useI18n();
  return useCallback(
    (key: string, values?: Record<string, string | number>) => t(`${namespace}.${key}`, values),
    [t, namespace],
  );
}
