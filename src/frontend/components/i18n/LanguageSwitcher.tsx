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

export default function LanguageSwitcher({
  compactOnMobile = false,
}: {
  compactOnMobile?: boolean;
}) {
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
      className={`language-switcher${
        compactOnMobile ? " language-switcher--compact" : ""
      }`}
    >
      <FiGlobe aria-hidden="true" />
      <span className={compactOnMobile ? "hidden sm:inline" : undefined}>
        {t("current")}
      </span>
    </button>
  );
}
