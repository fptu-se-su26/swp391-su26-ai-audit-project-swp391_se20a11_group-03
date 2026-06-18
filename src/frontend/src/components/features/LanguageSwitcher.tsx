"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { locales, localeShortLabels, type Locale } from "@/i18n/config";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (next: Locale) => {
    setLocale(next);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 rounded-full border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container"
        title="Change language"
        aria-label="Change language"
      >
        <span className="material-symbols-outlined text-[18px]">language</span>
        <span className="font-bold">{localeShortLabels[locale]}</span>
        <span className="material-symbols-outlined text-[16px]">expand_more</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-lg">
          {locales.map((code) => {
            const active = code === locale;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                className={`flex w-full items-center justify-between px-4 py-2 text-left font-label-sm text-label-sm transition-colors ${
                  active
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface hover:bg-surface-variant"
                }`}
              >
                <span>{code === "vi" ? "Tiếng Việt" : "English"}</span>
                {active && (
                  <span className="material-symbols-outlined text-[18px]">check</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
