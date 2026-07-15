export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "vi";

export const LOCALE_STORAGE_KEY = "luxe.locale";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeLabels: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

export const localeShortLabels: Record<Locale, string> = {
  vi: "VI",
  en: "EN",
};
