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
        className="flex h-10 items-center gap-1.5 rounded-full border border-[#d8d1c5] bg-white px-3 text-[11px] font-semibold text-[#071626] shadow-sm transition-all hover:border-[#b9974f] hover:bg-[#faf6ed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b9974f]"
        title="Change language"
        aria-label="Change language"
      >
        <span className="material-symbols-outlined text-[18px] text-[#344253]">language</span>
        <span className="font-bold">{localeShortLabels[locale]}</span>
        <span className={`material-symbols-outlined text-[16px] text-[#59636d] transition-transform ${open ? "rotate-180" : ""}`}>expand_more</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-[#ddd5c7] bg-[#fffdf8] p-1.5 shadow-[0_18px_45px_rgba(7,22,38,.16)]">
          {locales.map((code) => {
            const active = code === locale;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                  active
                    ? "bg-[#071626] text-[#e5c77a]"
                    : "text-[#344253] hover:bg-[#f1ebdf]"
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
