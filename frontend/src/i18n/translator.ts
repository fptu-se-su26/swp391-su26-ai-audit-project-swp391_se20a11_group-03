import vi from "@/i18n/messages/vi.json";
import en from "@/i18n/messages/en.json";
import { defaultLocale, type Locale } from "./config";

const messages: Record<Locale, Record<string, unknown>> = {
  vi: vi as Record<string, unknown>,
  en: en as Record<string, unknown>,
};

function getByPath(source: Record<string, unknown>, path: string): unknown {
  const segments = path.split(".");
  let current: unknown = source;
  for (const segment of segments) {
    if (current && typeof current === "object" && segment in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

function format(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = values[key];
    return value === undefined || value === null ? `{${key}}` : String(value);
  });
}

export function createTranslator(locale: Locale) {
  const dictionary = messages[locale] ?? messages[defaultLocale];
  return function translate(key: string, values?: Record<string, string | number>): string {
    const value = getByPath(dictionary, key);
    if (typeof value === "string") {
      return format(value, values);
    }
    const fallback = getByPath(messages[defaultLocale], key);
    if (typeof fallback === "string") {
      return format(fallback, values);
    }
    return key;
  };
}
