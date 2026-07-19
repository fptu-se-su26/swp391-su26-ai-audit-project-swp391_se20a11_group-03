"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FiGlobe } from "react-icons/fi";

/**
 * Persist the locale in NEXT_LOCALE and refresh without changing URL structure.
 */
function setLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export default function LanguageSwitcher() {
  const t = useTranslations("language");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSwitch() {
    // Read the active locale from the cookie.
    const current =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("NEXT_LOCALE="))
        ?.split("=")[1] ?? "vi";

    const next = current === "vi" ? "en" : "vi";
    setLocaleCookie(next);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleSwitch}
      disabled={isPending}
      aria-label={t("switchTo")}
      className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-medium tracking-wide text-white/70 transition-colors hover:border-[#d7aa63]/50 hover:text-[#f0c982] disabled:opacity-50"
    >
      <FiGlobe aria-hidden="true" className="h-3.5 w-3.5" />
      {t("current")}
    </button>
  );
}
