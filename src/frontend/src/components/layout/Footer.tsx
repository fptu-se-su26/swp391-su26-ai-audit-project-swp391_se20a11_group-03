"use client";

import { useTranslations } from "@/i18n/I18nProvider";

const LINKS = [
  { key: "terms" },
  { key: "privacy" },
  { key: "biddingRules" },
  { key: "contactUs" },
  { key: "careers" },
];

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="w-full bg-primary-container border-t border-on-primary-fixed-variant/20 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-lg max-w-screen-2xl mx-auto gap-gutter">
        <div className="font-headline-sm text-headline-sm font-bold text-on-primary-container mb-4 md:mb-0">
          {t("appName")}
        </div>
        <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
          {LINKS.map((link) => (
            <a
              key={link.key}
              href="#"
              className="font-label-sm text-label-sm text-on-primary-container/80 hover:text-secondary-fixed transition-colors"
            >
              {t(link.key)}
            </a>
          ))}
        </div>
        <div className="font-body-md text-body-md text-on-primary-container/80 text-center md:text-right">
          {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
